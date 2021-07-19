# circular_buffer_js

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/StoneCypher/circular_buffer_js/blob/master/LICENSEs)
[![GitHub Release](https://img.shields.io/github/release/StoneCypher/circular_buffer_js.svg?style=flat)]()
[![Github All Releases](https://img.shields.io/github/downloads/StoneCypher/circular_buffer_js/total.svg?style=flat)]()
[![Issues](https://img.shields.io/github/issues-raw/StoneCypher/circular_buffer_js.svg?maxAge=25000)](https://github.com/StoneCypher/circular_buffer_js/issues)
[![GitHub contributors](https://img.shields.io/github/contributors/StoneCypher/circular_buffer_js.svg?style=flat)]()

```
npm install --save-dev circular_buffer_js
```

* [Documentation](https://stonecypher.github.io/circular_buffer_js/docs/)
    * [Main functional documentation](https://stonecypher.github.io/circular_buffer_js/docs/classes/circular_buffer.circular_buffer-1.html)
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
// yields a buffer of fixed size `size`
const cb = new circular_buffer(size);

cb.push(item);     // inserts `item` at end of `cb`, then returns `item`
cb.pop();          // removes and returns first element
cb.at(location);   // shows the element at 0-indexed offset `location`
cb.fill(item);     // maxes `length` and sets every element to `item`
cb.clear();        // empties the container

cb.first;          // returns the first value in the queue; throws when empty
cb.last;           // returns the last value in the queue; throws when empty
cb.isFull;         // returns `true` if no space left, `false` otherwise
cb.isEmpty;        // returns `true` if no space used, `false` otherwise
cb.available;      // returns the number of spaces remaining currently
cb.capacity;       // returns the total `size` allocated
cb.length;         // returns the amount of space currently used
```





<br/><br/>

## What is this?

This is a circular buffer (or ring buffer, ring queue, etc.)  It was written because a library I wanted
to use had a native buggy implementation, so I provided something more trustworthy.

A circular buffer is a fixed size buffer that allows you to push and pop forever, as a first in first
out queue-like structure.  Circular buffers are more efficient than queues, but can overflow.



<br/>

### Basic usage

```javascript
import { circular_buffer } from 'circular_buffer_js';

const cb = new circular_buffer(3);  // [ , , ]

cb.push(1); // ok: [1, , ]
cb.push(2); // ok: [1,2, ]
cb.push(3); // ok: [1,2,3]

cb.at(0); // 1
cb.first; // 1
cb.last;  // 3

cb.push(4); // throws - full! ; [1,2,3]

cb.pop(); // 1: [2,3, ]
cb.at(0); // 2: [2,3, ]

cb.push(4); // ok: [2,3,4]
cb.push(5); // throws - full! ; [2,3,4]

cb.pop(); // 2: [3,4, ]
cb.pop(); // 3: [4, , ]
cb.pop(); // 4: [ , , ]

cb.pop(); // throws - empty! ; [ , , ]
```



<br/>

### Typescript

It's typescript, so you can also

```typescript
import { circular_buffer } from 'circular_buffer_js';
const cb = new circular_buffer<number>(3);
```



<br/>

### Node CommonJS

And there's a CommonJS build, so you can

```javascript
const cbuf            = require('circular_buffer_js'),
      circular_buffer = new cbuf.circular_buffer;
```



<br/>

### Browser &lt;script&gt;

There're also two `iife` builds - both regular and minified - so that you can use this in older browsers, or from CDN.

```html
<script defer type="text/javascript" src="circular_buffer_js.min.js"></script>
<script defer type="text/javascript">

  window.onload = () => {

    console.log(
      `Using circular buffer version ${circular_buffer.version}`
    );

                      // package      // class
    const mybuf = new circular_buffer.circular_buffer(5);

  };

</script>
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
