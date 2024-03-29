var circular_buffer = (function (exports) {
    'use strict';

    const version = '1.10.0';

    class circular_buffer {
        constructor(uCapacity) {
            if (!(Number.isInteger(uCapacity))) {
                throw new RangeError(`Capacity must be an integer, received ${uCapacity}`);
            }
            if (uCapacity < 0) {
                throw new RangeError(`Capacity must be a non-negative integer, received ${uCapacity}`);
            }
            this._values = new Array(uCapacity);
            this._capacity = uCapacity;
            this._cursor = 0;
            this._offset = 0;
            this._length = 0;
        }
        get capacity() {
            return this._capacity;
        }
        set capacity(newSize) {
            this.resize(newSize);
        }
        get length() {
            return this._length;
        }
        set length(newLength) {
            if (newLength > this._capacity) {
                throw new RangeError(`Requested new length [${newLength}] exceeds container capacity [${this._capacity}]`);
            }
            if (newLength < 0) {
                throw new RangeError(`Requested new length [${newLength}] cannot be negative`);
            }
            if (!(Number.isInteger(newLength))) {
                throw new RangeError(`Requested new length [${newLength}] must be an integer`);
            }
            if (this._length <= newLength) {
                return;
            }
            this._length = newLength;
        }
        get available() {
            return this._capacity - this._length;
        }
        get isEmpty() {
            return this._length === 0;
        }
        get isFull() {
            return this._length === this._capacity;
        }
        get first() {
            if (this.isEmpty) {
                throw new RangeError('Cannot return first element of an empty container');
            }
            return this.at(0);
        }
        get last() {
            if (this.isEmpty) {
                throw new RangeError('Cannot return last element of an empty container');
            }
            return this.at(this.length - 1);
        }
        static from(i, map_fn, t) {
            const new_array = map_fn
                ? Array.from(i, map_fn, t)
                : Array.from(i);
            const target_length = new_array.length;
            const ncb = new circular_buffer(target_length);
            ncb._values = new_array;
            ncb._length = target_length;
            return ncb;
        }
        push(v) {
            if (this.isFull) {
                throw new RangeError(`Cannot push, structure is full to capacity`);
            }
            this._values[(this._cursor + this._length++) % this._capacity] = v;
            return v;
        }
        shove(v) {
            let shoved;
            if (this._capacity === 0) {
                throw new RangeError(`Cannot shove, structure is zero-capacity`);
            }
            if (this.isFull) {
                shoved = this.pop();
            }
            this.push(v);
            return shoved;
        }
        fill(x) {
            for (let i = 0; i < this._capacity; i++) {
                this._values[i] = x;
            }
            this._length = this._capacity;
            return this._values;
        }
        indexOf(searchElement, fromIndex) {
            const normalized = this.toArray();
            return normalized.indexOf(searchElement, fromIndex);
        }
        find(predicate, thisArg) {
            return this.toArray().find(predicate, thisArg);
        }
        every(functor, thisArg) {
            const normalized = this.toArray(), res = normalized.every(functor, thisArg);
            this._values = normalized;
            this._values.length = this._capacity;
            this._cursor = 0;
            return res;
        }
        some(functor, thisArg) {
            const normalized = this.toArray(), res = normalized.some(functor, thisArg);
            this._values = normalized;
            this._values.length = this._capacity;
            this._cursor = 0;
            return res;
        }
        reverse() {
            const normalized = this.toArray();
            this._values = normalized.reverse();
            this._values.length = this._capacity;
            this._cursor = 0;
            return this;
        }
        clear() {
            const old = this.toArray();
            this._length = 0;
            return old;
        }
        pop() {
            if (this._length <= 0) {
                throw new RangeError(`Cannot pop, structure is empty`);
            }
            const cache = this.at(0);
            --this._length;
            ++this._offset;
            ++this._cursor;
            if (this._cursor >= this._capacity) {
                this._cursor -= this._capacity;
            }
            return cache;
        }
        at(i) {
            if (i < 0) {
                throw new RangeError(`circular_buffer does not support negative traversals; called at(${i})`);
            }
            if (!(Number.isInteger(i))) {
                throw new RangeError(`Accessors must be non-negative integers; called at(${i})`);
            }
            if (i >= this._capacity) {
                throw new RangeError(`Requested cell ${i} exceeds container permanent capacity`);
            }
            if (i >= this._length) {
                throw new RangeError(`Requested cell ${i} exceeds container current length`);
            }
            return this._values[(this._cursor + i) % this._capacity];
        }
        pos(i) {
            return this.at(i - this.offset());
        }
        offset() {
            return this._offset;
        }
        resize(newSize, preferEnd = false) {
            this._values = this.toArray();
            this._cursor = 0;
            const oldSize = this._length;
            this._length = Math.min(this._length, newSize);
            this._capacity = newSize;
            if (newSize >= oldSize) {
                this._values.length = newSize;
            }
            else {
                if (preferEnd) {
                    const tmp = this._values.slice(oldSize - newSize);
                    this._values = tmp;
                }
                else {
                    this._values.length = newSize;
                }
            }
        }
        toArray() {
            const startPoint = this._cursor % this._capacity;
            if (this._capacity > (startPoint + this._length)) {
                return this._values.slice(startPoint, startPoint + this._length);
            }
            else {
                const base = this._values.slice(startPoint, this._capacity);
                base.push(...this._values.slice(0, this.length - (this._capacity - startPoint)));
                return base;
            }
        }
    }

    exports.circular_buffer = circular_buffer;
    exports.version = version;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));
