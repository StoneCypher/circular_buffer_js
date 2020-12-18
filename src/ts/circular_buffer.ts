
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





  capacity()  : number { return this._capacity; }
  length()    : number { return this._length; }
  available() : number { return this._capacity - this._length; }





  push(v: T): T {

    if (this._length >= this._capacity) { throw new RangeError(`Cannot push, structure is full to capacity`); }

    this._values[(this._cursor + this._length++) % this._capacity] = v;

    return v;

  }





  pop(): T | undefined {

    if (this._length <= 0) { throw new RangeError(`Cannot pop, structure is empty`); }

    --this._length;

    return this._values[(this._cursor++) % this._capacity];

  }





  at(i: number): T | undefined {

    if (i >= this._capacity)      { throw new RangeError(`Requested cell ${i} exceeds container permanent capacity`); }
    if (i >= this._length)        { throw new RangeError(`Requested cell ${i} exceeds container current length`); }

    if (!( Number.isInteger(i) )) { throw new RangeError(`Accessors must be non-negative integers; called at(${i})`); }
    if (i < 0)                    { throw new RangeError(`circular_buffer does not support negative traversals; called at(${i})`); }

    return this._values[(this._cursor + i) % this._capacity];

  }



}





export {

  version,
  circular_buffer

};
