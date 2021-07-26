import { version } from './generated/package_version';
declare type TraversalFunctor<T> = (_element: T, _index: number, _array: T[]) => unknown;
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
    static from<T>(i: Iterable<T> | ArrayLike<T>, map_fn?: (_k: T, _i: number) => T, t?: unknown): circular_buffer<T>;
    push(v: T): T;
    fill(x: T): T[];
    every(functor: TraversalFunctor<T>, thisArg?: unknown): boolean;
    some(functor: TraversalFunctor<T>, thisArg?: unknown): boolean;
    reverse(): circular_buffer<T>;
    clear(): T[];
    pop(): T | undefined;
    at(i: number): T;
    toArray(): T[];
}
export { version, circular_buffer, TraversalFunctor };
