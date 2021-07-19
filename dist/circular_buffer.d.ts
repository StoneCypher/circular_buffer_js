import { version } from './generated/package_version';
declare class circular_buffer<T> {
    private _values;
    private _cursor;
    private _length;
    private _capacity;
    constructor(uCapacity: number);
    capacity(): number;
    length(): number;
    available(): number;
    empty(): boolean;
    full(): boolean;
    push(v: T): T;
    fill(x: T): T[];
    clear(): void;
    pop(): T | undefined;
    at(i: number): T | undefined;
}
export { version, circular_buffer };
