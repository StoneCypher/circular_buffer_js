var circular_buffer = (function (exports) {
    'use strict';

    const version = '1.0.0';

    class circular_buffer {
        constructor(uCapacity) {
            if (!(Number.isInteger(uCapacity))) {
                throw new RangeError(`Capacity must be an integer, received ${uCapacity}`);
            }
            if (uCapacity < 1) {
                throw new RangeError(`Capacity must be a positive integer, received ${uCapacity}`);
            }
            this._values = new Array(uCapacity);
            this._capacity = uCapacity;
            this._cursor = 0;
            this._length = 0;
        }
        get capacity() {
            return this._capacity;
        }
        get length() {
            return this._length;
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
        push(v) {
            if (this._length >= this._capacity) {
                throw new RangeError(`Cannot push, structure is full to capacity`);
            }
            this._values[(this._cursor + this._length++) % this._capacity] = v;
            return v;
        }
        fill(x) {
            for (let i = 0; i < this._capacity; i++) {
                this._values[i] = x;
            }
            this._length = this._capacity;
            return this._values;
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
