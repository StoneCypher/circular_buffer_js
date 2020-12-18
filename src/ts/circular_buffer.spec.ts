
import { circular_buffer } from './circular_buffer';





describe('[UNIT] Circular buffer', () => {

  const unit = (size: number) => {

    describe(`at capacity ${size.toLocaleString()}`, () => {

      test('constructor', () => { expect(() => new circular_buffer(size)).not.toThrow(); });
      let cb = new circular_buffer(size);

      test('  capacity',  () => { expect(cb.capacity()).toBe(size);    });
      test('  length',    () => { expect(cb.length()).toBe(0);         });
      test('  available', () => { expect(cb.available()).toBe(size);   });

      test('+ push(1)',   () => { expect(cb.push(1)).toBe(1);          });
      test('  capacity',  () => { expect(cb.capacity()).toBe(size);    });
      test('  length',    () => { expect(cb.length()).toBe(1);         });
      test('  available', () => { expect(cb.available()).toBe(size-1); });

      test('- pop',       () => { expect(cb.pop()).toBe(1);            });
      test('  capacity',  () => { expect(cb.capacity()).toBe(size);    });
      test('  length',    () => { expect(cb.length()).toBe(0);         });
      test('  available', () => { expect(cb.available()).toBe(size);   });

      test(`* push fill ${size.toLocaleString()}`, () => {

        let pf = new circular_buffer(size);

        for (var i=0; i<size; ++i) {
          expect(pf.push(i)).toBe(i);
          expect(pf.length()).toBe(i+1);
          expect(pf.available()).toBe((size-i)-1);
        }

      });

    });

  };

  [1, 3, 5, 100, 5_000].map(unit);





  describe('Error cases', () => {

    const overflow = (size: number) => {

      describe('Overflow', () => {
        test(`* push overfill on precisely ${size.toLocaleString()}`, () => {

          let pf = new circular_buffer(size);

          expect(() => { for (var i=0; i<size; ++i) { pf.push(i); } }).not.toThrow();
          expect(() => pf.push(size)).toThrow();

        });

      });

    }

    [1, 2, 3, 10, 1_000].map(overflow);

    describe('Bad constructors', () => {
      test('Zero-sized',      () => { expect( () => new circular_buffer(0)                        ).toThrow(); })
      test('Negative-sized',  () => { expect( () => new circular_buffer(-1)                       ).toThrow(); })
      test('Fraction-sized',  () => { expect( () => new circular_buffer(1.5)                      ).toThrow(); })
      test('Infinity-sized',  () => { expect( () => new circular_buffer(Number.POSITIVE_INFINITY) ).toThrow(); })
      test('NInfinity-sized', () => { expect( () => new circular_buffer(Number.NEGATIVE_INFINITY) ).toThrow(); })
      test('NaN-sized',       () => { expect( () => new circular_buffer(NaN)                      ).toThrow(); })
    });

  });

});
