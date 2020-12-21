# circular_buffer_js

TS implementation of a circular buffer and also a JS compile-down.

Well tested (which is the point.)  100% coverage, 100% property coverage.





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