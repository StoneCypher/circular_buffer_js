import { version } from './generated/package_version';
declare class circular_buffer<T> {
    private _values;
    private _cursor;
    private _length;
    private _capacity;
    constructor(uCapacity: number);
    get capacity(): number;
    get length(): number;
    get available(): number;
    get isEmpty(): boolean;
    get isFull(): boolean;
    get first(): T;
    get last(): T;
    push(v: T): T;
    fill(x: T): T[];
    clear(): T[];
    pop(): T | undefined;
    at(i: number): T;
    toArray(): T[];
}
export { version, circular_buffer };
