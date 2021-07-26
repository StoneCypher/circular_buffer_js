
import { version } from './generated/package_version';





type TraversalFunctor<T> = (_element: T, _index?: number, _array?: T[]) => unknown;





/*********
 *
 *  This is a circular queue.
 *
 */


class circular_buffer<T> {



  /** The actual dataset.  Not in order as the outside world would expect.  If
      you want this functionality, use {@link toArray | .toArray()} instead. */
  private _values : T[];


  /** The current offset in the underlying array.  You should never need
      this; it is an internal implementation detail. */
  private _cursor : number;

  /** The current used range within the dataset array.  Values outside this
      range aren't trustworthy.  Use {@link length | .length} instead. */
  private _length : number;

  /** The current size cap, as a cache.  Use {@link capacity | .capacity}
      instead. */
  private _capacity : number;





  /*********
   *
   *  Create a circular queue of the size of the argument, `uCapacity`.
   *
   *  ```typescript
   *  const cb = new circular_buffer(3);
   *  cb.capacity;   // 3
   *  ```
   *
   *  Queues may be, but do not have to be, typed.  If they are, all methods
   *  will also be appropriately typed, both in arguments and return values.
   *
   *  ```typescript
   *  const cb = new circular_buffer<string>(2);
   *  ```
   */

  constructor(uCapacity: number) {

    if (!( Number.isInteger(uCapacity) )) { throw new RangeError(`Capacity must be an integer, received ${uCapacity}`); }
    if (uCapacity < 0)                    { throw new RangeError(`Capacity must be a non-negative integer, received ${uCapacity}`); }

    this._values   = new Array(uCapacity);
    this._capacity = uCapacity;
    this._cursor   = 0;
    this._length   = 0;

  }





  /*********
   *
   *  The number of spaces offered, total, regardless of what's currently used.
   *
   *  ```typescript
   *  const cb = new circular_buffer(3);
   *  cb.capacity;   // 3
   *  cb.push(1);    // ok, returns 1
   *  cb.capacity;   // 3
   *  cb.pop();      // ok, returns 1, container now empty
   *  cb.capacity;   // 3
   *  ```
   */

  get capacity(): number {
    return this._capacity;
  }





  /*********
   *
   *  The number of spaces currently filled.
   *
   *  ```typescript
   *  const cb = new circular_buffer(3);
   *
   *  cb.length;     // 0
   *  cb.push(1);    // ok, returns 1
   *  cb.length;     // 1
   *  cb.pop();      // ok, returns 1, container now empty
   *  cb.length;     // 0
   *  cb.fill(3);    // [3,3,3]
   *  cb.length;     // 3
   *  cb.clear();    // [ , , ]
   *  cb.length;     // 0
   *  ```
   */

  get length(): number {
    return this._length;
  }





  /*********
   *
   *  The number of spaces available to be filled (ie, `.capacity - .length`.)
   *
   *  ```typescript
   *  const cb = new circular_buffer(3);
   *
   *  cb.available;  // 3
   *  cb.push(1);    // ok, returns 1
   *  cb.available;  // 2
   *  cb.pop();      // ok, returns 1, container now empty
   *  cb.available;  // 3
   *  cb.fill(3);    // [3,3,3]
   *  cb.available;  // 0
   *  cb.clear();    // [ , , ]
   *  cb.available;  // 3
   *  ```
   */

  get available(): number {
    return this._capacity - this._length;
  }





  /*********
   *
   *  `true` when the container has no contents (ie, `.length === 0`); `false`
   *  otherwise.
   *
   *  ```typescript
   *  const cb = new circular_buffer(3);
   *
   *  cb.isEmpty;  // true
   *  cb.push(1);  // ok, returns 1
   *  cb.isEmpty;  // false
   *  cb.clear();  // ok, container now empty
   *  cb.isEmpty;  // true
   *  ```
   */

  get isEmpty(): boolean {
    return this._length === 0;
  }





  /*********
   *
   *  `true` when the container has no space left (ie, `.length === .capacity`);
   *  `false` otherwise.
   *
   *  ```typescript
   *  const cb = new circular_buffer(3);
   *
   *  cb.isFull;   // false
   *
   *  cb.push(1);  // ok, returns 1
   *  cb.push(2);  // ok, returns 2
   *  cb.push(3);  // ok, returns 3
   *
   *  cb.isFull;   // true
   *
   *  cb.clear();  // ok, container now empty
   *  cb.isFull;   // false
   *  ```
   */

  get isFull(): boolean {
    return this._length === this._capacity;
  }





  /*********
   *
   *  Gets the first element of the queue; throws RangeError if the queue is
   *  empty.
   *
   *  ```typescript
   *  const cb = new circular_buffer(3);
   *
   *  cb.push(1);  // ok, returns 1
   *  cb.push(2);  // ok, returns 2
   *  cb.push(3);  // ok, returns 3
   *
   *  cb.first;    // 1
   *
   *  cb.clear();  // ok, container now empty
   *  cb.first;    // throws RangeError, because the container is empty
   *  ```
   */

  get first() : T {

    if (this.isEmpty) {
      throw new RangeError('Cannot return first element of an empty container');
    }

    return this.at(0);

  }





  /*********
   *
   *  Gets the last element of the queue; throws RangeError if the queue is
   *  empty.
   *
   *  ```typescript
   *  const cb = new circular_buffer(3);
   *
   *  cb.push(1);  // ok, returns 1
   *  cb.push(2);  // ok, returns 2
   *  cb.push(3);  // ok, returns 3
   *
   *  cb.last;     // 3
   *
   *  cb.clear();  // ok, container now empty
   *  cb.last;     // throws RangeError, because the container is empty
   *  ```
   */

  get last() : T {

    if (this.isEmpty) {
      throw new RangeError('Cannot return last element of an empty container');
    }

    return this.at(this.length - 1);

  }





  /*********
   *
   *  Creates a circular buffer from an `ArrayLike` or an `Iterable`, with a
   *  matching capacity.  Static method, and as such should not be called from
   *  an instance (so, do not call using `new`.)
   *
   *  ```typescript
   *  const cb = circular_buffer.from([1,2,3]);
   *
   *  cb.pop();  // ok, returns 1
   *  cb.pop();  // ok, returns 2
   *  cb.pop();  // ok, returns 3
   *
   *  cb.pop();  // throws RangeError, empty
   *  ```
   */

  static from<T>(i: Iterable<T> | ArrayLike<T>, map_fn?: (_k: T, _i: number) => T, t?: unknown): circular_buffer<T> {

    const new_array: T[] = map_fn
      ? Array.from(i, map_fn, t)
      : Array.from(i);

    const target_length = new_array.length;

    const ncb = new circular_buffer<T>(target_length);
    ncb._values = new_array;
    ncb._length = target_length;

    return ncb;

  }





  /*********
   *
   *  Pushes a value onto the end of the container; throws `RangeError` if the
   *  container is already full.
   *
   *  ```typescript
   *  const cb = new circular_buffer(3);
   *
   *  cb.push(1);  // ok, returns 1
   *  cb.push(2);  // ok, returns 2
   *  cb.push(3);  // ok, returns 3
   *
   *  cb.push(4);  // throws RangeError, container only has 3 spots
   *  ```
   */

  push(v: T): T {

    if (this._length >= this._capacity) { throw new RangeError(`Cannot push, structure is full to capacity`); }

    this._values[(this._cursor + this._length++) % this._capacity] = v;

    return v;

  }





  /*********
   *
   *  Fills a container with a repeated value.
   *
   *  ```typescript
   *  const cb = new circular_buffer(3);
   *
   *  cb.length;       // 0
   *  cb.at(2);        // throws RangeError
   *
   *  cb.fill('Bob');  // ['Bob', 'Bob', 'Bob']
   *  cb.length;       // 3
   *  cb.at(2);        // 'Bob'
   *  ```
   */

  fill(x:T): T[] {

    for (let i = 0; i < this._capacity; i++) {
      this._values[i] = x;
    }

    this._length = this._capacity;

    return this._values;

  }





  /*********
   *
   *  Using an identifier predicate, return either the first matching
   *  element or `undefined`.
   *
   *  ```typescript
   *  const dogs = ['beagle', 'doberman', 'deputy'];
   *        is_dog = animal => dogs.includes(animal);
   *
   *  const room = ['siamese', 'beagle', 'cockatoo'];
   *
   *  console.log(room.find(is_dog));   // prints 'beagle'
   *  ```
   */

  find( predicate: TraversalFunctor<T>, thisArg?: unknown ): T | unknown {
    const items = this.toArray();
    return items.find(predicate, thisArg);
  }





  /*********
   *
   *  Iterates a container with a predicate, testing for all truthy.
   *
   *  ```typescript
   *  const cb = circular_buffer.from([1,2,'three']);
   *  cb.every( i => typeof i === 'number' );  // false
   *  ```
   */

  every( functor: TraversalFunctor<T>, thisArg?: unknown ): boolean {

    const normalized = this.toArray(),
          res        = normalized.every(functor, thisArg);

    // every can mutate, so, store the result, which will usually be nothing

    this._values        = normalized;
    this._values.length = this._capacity;   // stack with new empties
    this._cursor        = 0;                // accomodate internal rotation

    return res;

  }





  /*********
   *
   *  Iterates a container with a predicate, testing for at least one truthy.
   *
   *  ```typescript
   *  const cb = circular_buffer.from([1,2,'three']);
   *  cb.some( i => typeof i === 'string' );  // true
   *  ```
   */

  some( functor: TraversalFunctor<T>, thisArg?: unknown ): boolean {

    const normalized = this.toArray(),
          res        = normalized.some(functor, thisArg);

    // every can mutate, so, store the result, which will usually be nothing

    this._values        = normalized;
    this._values.length = this._capacity;   // stack with new empties
    this._cursor        = 0;                // accomodate internal rotation

    return res;

  }





  /*********
   *
   *  Reverses a container.
   *
   *  ```typescript
   *  const cb = circular_buffer.from([3,2,1]);
   *  cb.reverse();
   *
   *  cb.pop();  // ok, returns 1
   *  cb.pop();  // ok, returns 2
   *  cb.pop();  // ok, returns 3
   *  ```
   */

  reverse(): circular_buffer<T> {

    const normalized: T[] = this.toArray();      // internally rotate to origin and ditch empties

    this._values        = normalized.reverse();  // reverse data
    this._values.length = this._capacity;        // stack with new empties
    this._cursor        = 0;                     // accomodate internal rotation

    return this;

  }





  /*********
   *
   *  Empties a container.  Returns the previous contents.
   *
   *  ```typescript
   *  const cb = new circular_buffer(3);
   *
   *  cb.push(10);  // ok, returns 10
   *  cb.push(20);  // ok, returns 20
   *  cb.push(30);  // ok, returns 30
   *
   *  cb.last;      // 30
   *  cb.length;    // 3
   *
   *  cb.clear();   // ok, returns [10,20,30]; container now empty
   *  cb.last;      // throws RangeError, because the container is empty
   *  cb.length;    // 0
   *  ```
   */

  clear(): T[] {

    const old    = this.toArray();
    this._length = 0;

    return old;

  }





  /*********
   *
   *  Pops a value from the front of the container, by returning it and removing
   *  it from the container; throws `RangeError` if the container is already
   *  empty.
   *
   *  ```typescript
   *  const cb = new circular_buffer(3);
   *
   *  cb.push(1);  // ok, returns 1
   *  cb.push(2);  // ok, returns 2
   *  cb.pop();    // ok, returns 1
   *  cb.pop();    // ok, returns 2
   *
   *  cb.pop();    // throws RangeError, container has nothing to pop out
   *  ```
   *
   */

  pop(): T | undefined {

    if (this._length <= 0) {
      throw new RangeError(`Cannot pop, structure is empty`);
    }

    const cache = this.at(0);

    --this._length;  // the container is now one shorter
    ++this._cursor;  // the cursor moved one forwards

    if (this._cursor >= this._capacity) {  // wrap the cursor if necessary
      this._cursor -= this._capacity;
    }

    return cache;

  }





  /*********
   *
   *  Returns the value at a given index, or throws RangeError if that value
   *  does not exist (container too small or nonsensical index.)
   *
   *  ```typescript
   *  const cb = new circular_buffer(3);
   *
   *  cb.push(1);  // ok, returns 1
   *  cb.push(2);  // ok, returns 2
   *  cb.push(3);  // ok, returns 3
   *
   *  cb.at(0);    // ok, returns 1
   *  cb.at(2);    // ok, returns 3
   *
   *  cb.at(4);    // throws RangeError, larger than the container
   *
   *  cb.at(-1);   // throws RangeError, nonsense index
   *  cb.at(0.5);  // throws RangeError, nonsense index
   *  cb.at("Z");  // throws RangeError, nonsense index
   *  ```
   *
   */

  at(i: number): T {

    if (i < 0)                    { throw new RangeError(`circular_buffer does not support negative traversals; called at(${i})`); }
    if (!( Number.isInteger(i) )) { throw new RangeError(`Accessors must be non-negative integers; called at(${i})`); }

    if (i >= this._capacity)      { throw new RangeError(`Requested cell ${i} exceeds container permanent capacity`); }
    if (i >= this._length)        { throw new RangeError(`Requested cell ${i} exceeds container current length`); }

    return this._values[(this._cursor + i) % this._capacity]!;  // eslint-disable-line @typescript-eslint/no-non-null-assertion

  }





  /*********
   *
   *  Returns the complete, ordered contents of the queue, as an array.
   *
   *  ```typescript
   *  const cb = new circular_buffer(3);
   *  cb.toArray();  // []
   *
   *  cb.push(1);    // ok, returns 1
   *  cb.push(2);    // ok, returns 2
   *  cb.push(3);    // ok, returns 3
   *  cb.toArray();  // [1,2,3]
   *
   *  cb.pop();      // ok, returns 1
   *  cb.toArray();  // [2,3]
   *
   *  ```
   *
   */

  toArray(): T[] {

    const startPoint = this._cursor % this._capacity;

    if (this._capacity > (startPoint + this._length)) {
      // no need to splice, length doesn't wrap
      return this._values.slice(startPoint, startPoint+this._length);

    } else {

      // length wraps
      const base = this._values.slice(startPoint, this._capacity);
      base.push( ... this._values.slice(0, this.length - (this._capacity - startPoint)) );

      return base;

    }

  }



}





export {

  version,
  circular_buffer,

  TraversalFunctor

};
