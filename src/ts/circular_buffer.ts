
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

    this._values   = new Array(uCapacity);
    this._capacity = uCapacity;
    this._cursor   = 0;
    this._length   = 0;

  }





  capacity() : number { return this._capacity; }
  length()   : number { return this._length; }





  push(v: T): T {

    if (this._length >= this._capacity) { throw new RangeError(`Cannot push, structure is full to capacity`); }

    this._values[(this._cursor + this._length++) % this._capacity] = v;

    return v;

  }





  pop(): T | undefined {

    if (this._length <= 0) { throw new RangeError(`Cannot pop, structure is empty`); }

    return this._values[((this._cursor++) + (this._length--) -1) % this._capacity];

  }





  at(i: number): T | undefined {

    if (i >= this._capacity) { throw new RangeError(`Requested cell ${i} exceeds container permanent capacity`); }
    if (i >= this._length)   { throw new RangeError(`Requested cell ${i} exceeds container current length`); }

    return this._values[(this._cursor + i) % this._capacity];

  }



}





export {

  version,
  circular_buffer

};
