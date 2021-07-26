
import { version, circular_buffer } from '../circular_buffer';





describe('[UNIT] version', () => {
  test('Version is present',   () => expect(typeof version).toBe('string'));
  test('Version is non-empty', () => expect(version.length > 0).toBe(true));
});





describe('[UNIT] Zero size', () => {

  const cb = new circular_buffer(0);

  expect( cb.length    ).toBe(0);
  expect( cb.available ).toBe(0);
  expect( cb.capacity  ).toBe(0);

  expect( () => cb.first ).toThrow();
  expect( () => cb.last  ).toThrow();

  expect( () => cb.push(1) ).toThrow();
  expect( () => cb.pop()   ).toThrow();

});





describe('[UNIT] Circular buffer', () => {

  const unit = (size: number) => {

    describe(`at capacity ${size.toLocaleString()}`, () => {

      test('constructor', () => {
        expect(() => new circular_buffer(size)).not.toThrow();
      });

      test('lifecycle', () => {

        const cb = new circular_buffer(size);

        expect(cb.capacity).toBe(size);
        expect(cb.length).toBe(0);
        expect(cb.available).toBe(size);
        expect(() => cb.first).toThrow();
        expect(() => cb.last).toThrow();

        expect(cb.push(1)).toBe(1);
        expect(cb.capacity).toBe(size);
        expect(cb.length).toBe(1);
        expect(cb.available).toBe(size-1);
        expect(cb.first).toBe(1);
        expect(cb.last).toBe(1);

        expect(cb.pop()).toBe(1);
        expect(cb.capacity).toBe(size);
        expect(cb.length).toBe(0);
        expect(cb.available).toBe(size);
        expect(() => cb.first).toThrow();
        expect(() => cb.last).toThrow();

      });

      test(`* push fill ${size.toLocaleString()}`, () => {

        const pf = new circular_buffer(size);
        for (let i=0; i<size; ++i) {
          expect(pf.push(i)).toBe(i);
          expect(pf.length).toBe(i+1);
          expect(pf.available).toBe((size-i)-1);
        }

      });

      test(`  pop/push cycle 3x ${size.toLocaleString()} +1`, () => {

        const pf = new circular_buffer(size);
        for (let k=0; k<size; ++k) { pf.push(k); }

        for (let i=0; i<(size*3)+1; ++i) {
          pf.pop();
          expect(pf.length).toBe(size-1);
          expect(pf.available).toBe(1);

          expect(pf.push(i)).toBe(i);
          expect(pf.length).toBe(size);
          expect(pf.available).toBe(0);
        }

      });

    });

  };

  [1, 3, 5, 100, 2_000].map(unit);



});



test('[UNIT] simple from/1', () => {

  const cb = circular_buffer.from([1,2,3]);

  expect( cb.pop() ).toBe(1);
  expect( cb.pop() ).toBe(2);
  expect( cb.pop() ).toBe(3);

  expect( () => cb.pop() ).toThrow();

});



test('[UNIT] functor from/2', () => {

  const cb = circular_buffer.from([1,2,3], i => i*10);

  expect( cb.pop() ).toBe(10);
  expect( cb.pop() ).toBe(20);
  expect( cb.pop() ).toBe(30);

  expect( () => cb.pop() ).toThrow();

});



test('[UNIT] first and last', () => {

  const cb = new circular_buffer(5);

  expect(cb.capacity).toBe(5);
  expect(cb.length).toBe(0);
  expect(cb.available).toBe(5);
  expect(() => cb.first).toThrow();
  expect(() => cb.last).toThrow();

  expect(cb.push(1)).toBe(1);
  expect(cb.capacity).toBe(5);
  expect(cb.length).toBe(1);
  expect(cb.available).toBe(5-1);
  expect(cb.first).toBe(1);
  expect(cb.last).toBe(1);
  expect(cb.push(2)).toBe(2);
  expect(cb.first).toBe(1);
  expect(cb.last).toBe(2);

  expect(cb.pop()).toBe(1);
  expect(cb.first).toBe(2);
  expect(cb.last).toBe(2);

  expect(cb.pop()).toBe(2);
  expect(cb.capacity).toBe(5);
  expect(cb.length).toBe(0);
  expect(cb.available).toBe(5);
  expect(() => cb.first).toThrow();
  expect(() => cb.last).toThrow();

});



test('[UNIT] push/1', () => {

  // declare a three item cb
  const pu_ir = new circular_buffer<number>(3);

  // can accept three items
  pu_ir.push(1);
  pu_ir.push(2);
  pu_ir.push(3);

  // cannot accept a fourth, out of space
  expect( () => pu_ir.push(4) ).toThrow('Cannot push, structure is full to capacity');

  // pop and get 1
  expect( pu_ir.pop() ).toBe(1);

  // now can accept a fourth; also pop and get 2, etc.
  pu_ir.push(4);
  expect( pu_ir.pop() ).toBe(2);

  pu_ir.push(5);
  expect( pu_ir.pop() ).toBe(3);

  pu_ir.push(6);
  expect( pu_ir.pop() ).toBe(4);

  // we've now full cycled in twice
  pu_ir.push(7);
  expect( pu_ir.pop() ).toBe(5);

  pu_ir.push(8);
  expect( pu_ir.pop() ).toBe(6);

  // we've now full cycled out twice; done
  pu_ir.push(9);
  expect( pu_ir.pop() ).toBe(7);

});





test('[UNIT] at/1', () => {

  const at_ir = new circular_buffer<number>(3);

  // can accept and check a first item
  at_ir.push(1);
  expect( at_ir.at(0) ).toBe(1);

  // can accept a second item; both first and second work
  at_ir.push(2);
  expect( at_ir.at(0) ).toBe(1);
  expect( at_ir.at(1) ).toBe(2);

  // popping does what's expected
  at_ir.pop();
  expect( at_ir.at(0) ).toBe(2);

  // pushing still does what's expected after a pop
  at_ir.push(3);
  expect( at_ir.at(0) ).toBe(2);
  expect( at_ir.at(1) ).toBe(3);

  // double popping does what's expected
  at_ir.pop();
  at_ir.pop();
  expect( () => at_ir.at(0) ).toThrow();

  // pushing works after an empty
  at_ir.push(4);
  expect( at_ir.at(0) ).toBe(4);

});





test('[UNIT] fill/5', () => {

  // declare a five item cb
  const filler = new circular_buffer<number>(5);

  // can accept five items
  expect(filler.fill(1)).toEqual([1,1,1,1,1]);

  // can overwrite five items
  expect(filler.fill(2)).toEqual([2,2,2,2,2]);

});





test('[UNIT] clear/0', () => {

  // declare a five item cb
  const filler = new circular_buffer<number>(5);

  filler.push(1);
  filler.push(2);
  filler.push(3);
  filler.push(4);
  filler.push(5);

  const was = filler.clear();

  expect(filler.length).toEqual(0);
  expect(was).toStrictEqual([1,2,3,4,5]);

});





test('[UNIT] fill/full/5', () => {
  // declare a five item cb
  const filler = new circular_buffer<number>(5);

  filler.push(1);
  filler.push(1);
  filler.push(1);
  filler.push(1);
  filler.push(1);
  /*we're full*/

  expect(filler.at(0)).toEqual(1);

  expect(filler.at(4)).toEqual(1);

  filler.fill(2);
  /*fill() will overwrite*/

  expect(filler.at(0)).toEqual(2);

  expect(filler.at(4)).toEqual(2);
  /*archaic, but tests ok*/

});





test('[UNIT] fill/partial/3', () => {
  // declare a three item cb
  const filler = new circular_buffer<number>(3);

  filler.push(1);
  /*we have one item present*/

  expect(filler.at(0)).toEqual(1);

  filler.fill(2);
  /*fill() will overwrite*/

  expect(filler.at(0)).toEqual(2);
  expect(filler.at(1)).toEqual(2);
  expect(filler.at(2)).toEqual(2);
});





test('[UNIT] pop/0', () => {

  const popper = new circular_buffer<number>(3);

  // can't pop from a new/empty cb
  expect( () => popper.pop() ).toThrow();

  // can push once; can only pop once, 2nd will throw
  popper.push(1);
  expect( popper.pop() ).toBe(1);
  expect( () => popper.pop() ).toThrow();

  // can push again; can only pop once, 2nd will throw
  popper.push(2);
  expect( popper.pop() ).toBe(2);
  expect( () => popper.pop() ).toThrow();

  // can double push; can pop twice, 3rd will throw
  popper.push(3);
  popper.push(4);
  expect( popper.pop() ).toBe(3);
  expect( popper.pop() ).toBe(4);
  expect( () => popper.pop() ).toThrow();

  // can triple push; fourth will fail; can pop thrice, 4th will throw as expected
  popper.push(5);
  popper.push(6);
  popper.push(7);
  expect( () => popper.push(8) ).toThrow('Cannot push, structure is full to capacity');
  expect( popper.pop() ).toBe(5);
  expect( popper.pop() ).toBe(6);
  expect( popper.pop() ).toBe(7);
  expect( () => popper.pop() ).toThrow();

});





test('[UNIT] toArray/0', () => {

  const popper = new circular_buffer<number>(3);

  expect( popper.toArray() ).toStrictEqual( [] );

  popper.push(1);
  expect( popper.toArray() ).toStrictEqual( [1] );

  popper.push(2);
  expect( popper.toArray() ).toStrictEqual( [1,2] );

  popper.push(3);
  expect( popper.toArray() ).toStrictEqual( [1,2,3] );

  popper.pop();
  popper.push(4);
  expect( popper.toArray() ).toStrictEqual( [2,3,4] );

  popper.pop();
  popper.push(5);
  expect( popper.toArray() ).toStrictEqual( [3,4,5] );

  popper.pop();
  popper.push(6);
  expect( popper.toArray() ).toStrictEqual( [4,5,6] );

  popper.pop();
  popper.push(7);
  expect( popper.toArray() ).toStrictEqual( [5,6,7] );

});





test('[UNIT] available getter', () => {

  const popper = new circular_buffer<number>(3);

  expect( popper.available ).toBe(3);

  popper.push(1);
  expect( popper.available ).toBe(2);

  popper.push(2);
  expect( popper.available ).toBe(1);

  popper.push(3);
  expect( popper.available ).toBe(0);

  popper.pop();
  expect( popper.available ).toBe(1);

});





test('[UNIT] isEmpty getter', () => {

  const popper = new circular_buffer<number>(3);
  expect( popper.isEmpty ).toBe(true);

  popper.push(1);
  expect( popper.isEmpty ).toBe(false);

  popper.pop();
  expect( popper.isEmpty ).toBe(true);

});





test('[UNIT] isFull getter', () => {

  const popper = new circular_buffer<number>(1);
  expect( popper.isFull ).toBe(false);

  popper.push(1);
  expect( popper.isFull ).toBe(true);

  popper.pop();
  expect( popper.isFull ).toBe(false);

});





test('[UNIT] Reverse', () => {

  const cb = circular_buffer.from([3,2,1]);
  cb.reverse();

  expect(cb.pop()).toBe(1);
  expect(cb.pop()).toBe(2);
  expect(cb.pop()).toBe(3);

});





describe('[UNIT] Error cases', () => {

  const overflow = (size: number) => {

    describe('Overflow', () => {
      test(`* push overfill on precisely ${size.toLocaleString()}`, () => {

        const pf = new circular_buffer(size);

        expect(() => { for (let i=0; i<size; ++i) { pf.push(i); } }).not.toThrow();
        expect(() => pf.push(size)).toThrow();

      });
    });

  }

  [1, 2, 3, 10, 1_000].map(overflow);

  describe('Bad constructors', () => {
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
