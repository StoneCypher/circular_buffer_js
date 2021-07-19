
import { version } from './generated/package_version';





/*********
 *
 *  This is a circular queue.
 *
 */


class circular_buffer<T> {



  /** The actual dataset.  Not in order as the outside world would expect.  If
      you want this functionality, use `.toArray()`. */
  private _values   : T[];


  /** The current offset in the underlying array.  You should never need
      this. */
  private _cursor   : number;

  /** The current used range within the dataset array.  Values outside this
      range aren't trustworthy.  Use `.length` instead. */
  private _length   : number;

  /** The current size cap, as a cache.  Use `.capacity` instead. */
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
    if (uCapacity < 1)                    { throw new RangeError(`Capacity must be a positive integer, received ${uCapacity}`); }

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

    for (var i = 0; i < this._capacity; i++) {
      this._values[i] = x;
    }

    this._length = i;
    this._cursor = i;

    return this._values;

  }





  /*********
   *
   *  Empties a container.
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
   *  cb.clear();   // ok, container now empty
   *  cb.last;      // throws RangeError, because the container is empty
   *  cb.length;    // 0
   *  ```
   */

  clear(): void {

    this._length = 0;
    return;

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

    --this._length;

    // admittedly it's odd to put this here rather than to cache and return the
    // _cursor increment.  however logically it makes no difference: this could
    // be unculled entirely, and indeed would be but for the vain hope that
    // someone would actually use this so long that we'd lose ieee double on
    // safe ints (lol,) so, whatever, do it here, because in code where we use
    // modulo we're gonna pretend to care about the efficiency of an allocate
    //
    // bridges, $30.  get your bridges right here, $30.
    if (this._cursor >= this._capacity) {
      this._cursor -= this._capacity;
    }

    return this._values[(this._cursor++) % this._capacity];

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

    return this._values[(this._cursor + i) % this._capacity]!;

  }



}





export {

  version,
  circular_buffer

};
