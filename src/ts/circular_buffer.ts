
import { version } from './generated/package_version';





/*********
 *
 *  This is a circular queue.
 *
 */


class circular_buffer<T> {



  private _values   : T[];

  private _cursor   : number;
  private _length   : number;
  private _capacity : number;





  constructor(uCapacity: number) {

    if (!( Number.isInteger(uCapacity) )) { throw new RangeError(`Capacity must be an integer, received ${uCapacity}`); }
    if (uCapacity < 1)                    { throw new RangeError(`Capacity must be a positive integer, received ${uCapacity}`); }

    this._values   = new Array(uCapacity);
    this._capacity = uCapacity;
    this._cursor   = 0;
    this._length   = 0;

  }





  capacity()  : number  { return this._capacity; }
  length()    : number  { return this._length; }
  available() : number  { return this._capacity - this._length; }
  empty()     : boolean { return this._length === 0; }
  full()      : boolean { return this._length === this._capacity; }





  push(v: T): T {

    if (this._length >= this._capacity) { throw new RangeError(`Cannot push, structure is full to capacity`); }

    this._values[(this._cursor + this._length++) % this._capacity] = v;

    return v;

  }





  fill(x:T): T[] {
    for (var i = 0; i < this._capacity; i++) {
      this._values[i] = x;
    }
    this._length = i;
    this._cursor = i;
    return this._values;
  }




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





  at(i: number): T | undefined {

    if (i < 0)                    { throw new RangeError(`circular_buffer does not support negative traversals; called at(${i})`); }
    if (!( Number.isInteger(i) )) { throw new RangeError(`Accessors must be non-negative integers; called at(${i})`); }

    if (i >= this._capacity)      { throw new RangeError(`Requested cell ${i} exceeds container permanent capacity`); }
    if (i >= this._length)        { throw new RangeError(`Requested cell ${i} exceeds container current length`); }

    return this._values[(this._cursor + i) % this._capacity];

  }



}





export {

  version,
  circular_buffer

};
