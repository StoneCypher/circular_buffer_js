
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
        for (let i=0; i<size; ++i) {
          expect(pf.push(i)).toBe(i);
          expect(pf.length()).toBe(i+1);
          expect(pf.available()).toBe((size-i)-1);
        }

      });

      test(`  pop/push cycle 3x ${size.toLocaleString()} +1`, () => {

        let pf = new circular_buffer(size);
        for (let k=0; k<size; ++k) { pf.push(k); }

        for (let i=0; i<(size*3)+1; ++i) {
          pf.pop();
          expect(pf.length()).toBe(size-1);
          expect(pf.available()).toBe(1);

          expect(pf.push(i)).toBe(i);
          expect(pf.length()).toBe(size);
          expect(pf.available()).toBe(0);
        }

      });

    });

  };

  [1, 3, 5, 100, 2_000].map(unit);





  describe('[UNIT] at/1 in-range', () => {

    const at_ir = new circular_buffer<number>(3);

    at_ir.push(1);
    test('One item', () => { expect( at_ir.at(0) ).toBe(1); })

    at_ir.push(2);
    test('Two items 1', () => { expect( at_ir.at(0) ).toBe(1); })
    test('Two items 1', () => { expect( at_ir.at(1) ).toBe(2); })

    // at_ir.pop();
    // test('One removed', () => { expect( at_ir.at(0) ).toBe(2); })

    // at_ir.push(3);
    // test('One removed two items 1', () => { expect( at_ir.at(0) ).toBe(2); })
    // test('One removed two items 2', () => { expect( at_ir.at(1) ).toBe(3); })

  //   at_ir.pop();
  //   at_ir.pop();
  //   test('Three removed, can\'t at', () => { expect( () => at_ir.at(0) ).toThrow(); })

  //   at_ir.push(4);
  //   test('Three removed one item', () => { expect( at_ir.at(0) ).toBe(4); })

  });





  describe('[UNIT] Error cases', () => {

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

    describe('at/1 out-of-range', () => {

      const at_ooo = new circular_buffer(3);
      at_ooo.push(1);

      test('Above capacity', () => { expect( () => at_ooo.at(4)   ).toThrow(); })
      test('Above length',   () => { expect( () => at_ooo.at(2)   ).toThrow(); })
      test('Below zero',     () => { expect( () => at_ooo.at(-1)  ).toThrow(); })
      test('Fractional',     () => { expect( () => at_ooo.at(1.5) ).toThrow(); })

      at_ooo.push(2);
      at_ooo.pop();

    });

  });

});
