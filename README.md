# circular_buffer_js

```
npm install --save-dev circular_buffer_js
```

* [Documentation](https://stonecypher.github.io/circular_buffer_js/docs/)
* [Build history](https://github.com/StoneCypher/circular_buffer_js/actions)

`Typescript` implementation of a circular buffer, and JS compiles to a es6
module minified, es6 commonjs minified, es6 iife minified, and es6 iife full.

1. Well tested.
    * 100% coverage, 100% property coverage.
1. Tiny.
    * The `es6` minified module build is currently 1.4k.
1. Dependency-free.
    * Only dev-time deps like `typescript` are involved.





<br/><br/>

## API

You should consider viewing the [real documentation](https://stonecypher.github.io/circular_buffer_js/docs/), but:

```typescript
const cb = new circular_buffer<type>(size);   // yields a buffer of fixed size `size`

cb.push(item);                                // inserts `item` at end of `cb`, then returns `item`
cb.pop();                                     // removes and returns first element
cb.at(location);                              // shows the element at 0-indexed offset `location`
cb.fill(item);                                // maxes `length` and sets every element to `item`

cb.full();                                    // returns `true` if no space left, `false` otherwise
cb.empty();                                   // returns `true` if no space used, `false` otherwise
cb.available();                               // returns the number of spaces remaining currently
cb.capacity();                                // returns the total `size` allocated
cb.length();                                  // returns the amount of space currently used
```





<br/><br/>

## What is this?

This is a circular buffer (or ring buffer, ring queue, etc.)  It was written because a library I wanted
to use had a native buggy implementation, so I provided something more trustworthy.

A circular buffer is a fixed size buffer that allows you to push and pop forever, as a first in first
out queue-like structure.  Circular buffers are more efficient than queues, but can overflow.

```javascript
import { circular_buffer } from 'circular_buffer_js';

const cb = new circular_buffer(3);

cb.push(1); // ok
cb.push(2); // ok
cb.push(3); // ok

cb.at(0); // 1

cb.push(4); // throws - full!

cb.pop(); // 1
cb.at(0); // 2

cb.push(4); // ok
cb.push(5); // throws - full!

cb.pop(); // 2
cb.pop(); // 3
cb.pop(); // 4

cb.pop(); // throws - empty!
```

It's typescript, so you can also

```typescript
const cb = new circular_buffer<number>(3);
```

And there's a commonjs build, so you can

```javascript
const cbuf            = require('circular_buffer_js'),
      circular_buffer = cbuf.circular_buffer;
```

There're also two `iife` builds - both regular and minified - so that you can use this in older browsers.

```html
<script type="text/javascript" src="circular_buffer_js.min.js"></script>
```



<br/><br/>

## Alternatives

If this doesn't meet your needs, please try:

* [ring-buffer-ts](https://www.npmjs.com/package/ring-buffer-ts)
* [CBuffer](https://www.npmjs.com/package/CBuffer)
* [ringbuffer.js](https://www.npmjs.com/package/ringbufferjs)
* [qlist](https://www.npmjs.com/package/qlist)
* [fixed-size-list](https://www.npmjs.com/package/fixed-size-list)
* [circular-buffer](https://www.npmjs.com/package/circular-buffer)
* [cyclist](https://www.npmjs.com/package/cyclist)
* [cyclic-buffer](https://www.npmjs.com/package/cyclic-buffer)
* [bsh-circular-buffer](https://www.npmjs.com/package/bsh-circular-buffer)
* [cbarrick-circular-buffer](https://www.npmjs.com/package/cbarrick-circular-buffer)
* [limited-cache](https://www.npmjs.com/package/limited-cache)
