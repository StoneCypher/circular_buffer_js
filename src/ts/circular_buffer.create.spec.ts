
import { circular_buffer } from './circular_buffer';





describe('[UNIT] Circular buffer', () => {

  const unit = (size: number) => {

    describe(`at capacity ${size.toLocaleString()}`, () => {
      describe('creates correctly', () => {

        test('constructor', () => { expect(() => new circular_buffer(size)).not.toThrow(); });

        let cb = new circular_buffer(size);

        test('capacity', () => { expect(cb.capacity()).toBe(size); });
        test('length',   () => { expect(cb.length()).toBe(0);      });

      })
    });

  };

  [1, 3, 5, 100, 1_000_000].map(unit);

});
