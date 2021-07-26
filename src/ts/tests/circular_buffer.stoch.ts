
import * as assert                  from 'assert';
import * as fc                      from 'fast-check';
import { version, circular_buffer } from '../circular_buffer';





type CbModel = {
  length   : number,
  capacity : number
};

type num_cb     = circular_buffer<unknown>;
type cb_command = fc.Command<CbModel, num_cb>;

// const rand = (n: number) =>
//   Math.floor(Math.random() * n);





// from/1,2 don't really make sense in the command model

test('[STOCH] simple from/1', () => {

  fc.assert(
    fc.property(

      fc.array(whatever()),

      (source: unknown[]) => {

        const cb = circular_buffer.from(source);
        expect(cb.length).toBe(source.length);

        const cbl = cb.length;
        for (let i=0; i<cbl; ++i) {
          expect(cb.pop()).toBe(source[i]);
        }

        expect(() => cb.pop()).toThrow();

      }

    )
  );

});





// from/1,2 don't really make sense in the command model

test('[STOCH] functor from/2', () => {

  fc.assert(
    fc.property(

      fc.array(fc.float()),

      (source: number[]) => {

        const cb = circular_buffer.from(source, (n: number) => n*10);
        expect(cb.length).toBe(source.length);

        const cbl = cb.length;
        for (let i=0; i<cbl; ++i) {
          expect(cb.pop()).toBe((source[i] || 0) * 10);
        }

        expect(() => cb.pop()).toThrow();

      }

    )
  );

});





function whatever(): fc.Arbitrary<unknown> {

  return fc.anything({
    withBigInt        : true,
    withBoxedValues   : true,
    withDate          : true,
    withMap           : true,
    withNullPrototype : true,
    withObjectString  : true,
    withSet           : true,
    withTypedArray    : true
  });

}





class PushCommand implements cb_command {

  constructor(readonly value: number) {}    // eslint-disable-line no-unused-vars

  check = (_m: Readonly<CbModel>): boolean => true;  // allowed to push into a full cb because we test overflows

  run(m: CbModel, r: num_cb): void {

    const newValue = whatever();

    if (m.length < m.capacity) {  // cb isn't full, so should work
      r.push( newValue );
      ++m.length;
      assert.deepEqual( r.last, newValue );
    } else { // cb _is_ full, so should fail
      assert.throws( () => r.push( newValue ) );
    }

  }

  toString = () => `push(${this.value})`;

}




class PopCommand implements cb_command {

  toString = () => 'pop';
  check    = (_m: Readonly<CbModel>): boolean => true;  // allowed to pop from an empty cb because we test underflows

  run(m: CbModel, r: circular_buffer<unknown>): void {

    if (m.length > 0) {

      const oldFirst = r.first,
            popped   = r.pop();

      --m.length;

      assert.deepEqual( popped, oldFirst );

    } else {
      assert.throws( () => r.pop() );
    }

  }

}





class LengthCommand implements cb_command {

  toString = () => 'length';
  check    = (_m: Readonly<CbModel>) => true;  // you should always be allowed to call length

  run(m: CbModel, r: circular_buffer<unknown>): void {
    assert.equal(m.length, r.length);
  }

}





class EveryCommand implements cb_command {

  toString = () => 'every';
  check    = (_m: Readonly<CbModel>) => true;  // you should always be allowed to call every

  run(_m: CbModel, r: circular_buffer<unknown>): void {

    const before = r.toArray();
    assert.equal( r.every( _i => true ), true );
    const after  = r.toArray();

    assert.deepEqual(before, after);

  }

}





class FindCommand implements cb_command {

  toString = () => 'every';
  check    = (_m: Readonly<CbModel>) => true;  // test the nonsense case length 0 too

  run(_m: CbModel, r: circular_buffer<unknown>): void {

    const before = r.toArray();

    if (r.length) {
      for (let i=0, iC = r.length; i<iC; ++i) {
        const here = r.at(i);
        expect(r.find(el => el === here)).toBe(here);  // test that every element may be found
      }
    } else {
      expect(r.find(i => i === 'bob')).toBe(undefined);
    }

    const after = r.toArray();

    assert.deepEqual(before, after);

  }

}





class SomeCommand implements cb_command {

  toString = () => 'some';
  check    = (_m: Readonly<CbModel>) => true;  // you should always be allowed to call any

  run(_m: CbModel, r: circular_buffer<unknown>): void {

    const before = r.toArray();
    if (r.length) { assert.equal( r.some( (_i: unknown) => true) , true ); }
    const after  = r.toArray();

    if ([ before, after ].length !== 2) { true; }

    assert.deepEqual(before, after);

  }

}





class ReverseCommand implements cb_command {

  toString = () => 'reverse';
  check    = (_m: Readonly<CbModel>) => true;  // you should always be allowed to call reverse

  run(_m: CbModel, r: circular_buffer<unknown>): void {

    const before   = r.toArray();

    r.reverse();

    const after    = r.toArray(),
          afterRev = after.reverse();

    assert.deepEqual(before, afterRev);

  }

}





class FirstCommand implements cb_command {

  toString = () => 'first';
  check    = (_m: Readonly<CbModel>) => true;  // we test underflows, so, allowed at any time

  run(_m: CbModel, r: circular_buffer<unknown>): void {
    if (r.isEmpty) {
      assert.throws( () => r.first );
    } else {
      assert.doesNotThrow( () => r.first );
    }
  }

}





class LastCommand implements cb_command {

  toString = () => 'last';
  check    = (_m: Readonly<CbModel>) => true;  // we test underflows, so, allowed at any time

  run(_m: CbModel, r: circular_buffer<unknown>): void {
    if (r.isEmpty) {
      assert.throws( () => r.last );
    } else {
      assert.doesNotThrow( () => r.last );
    }
  }

}





class AvailableCommand implements cb_command {

  toString = () => 'available';
  check    = (_m: Readonly<CbModel>) => true;  // you should always be allowed to call available

  run(m: CbModel, r: circular_buffer<unknown>): void {
    assert.equal(m.capacity - m.length, r.available);
  }

}





class FullCommand implements cb_command {

  toString = () => 'full';
  check    = (_m: Readonly<CbModel>) => true;  // you should always be allowed to call full

  run(m: CbModel, r: circular_buffer<unknown>): void {
    assert.equal(m.length === m.capacity, r.isFull);
  }

}





class EmptyCommand implements cb_command {

  toString = () => 'empty';
  check    = (_m: Readonly<CbModel>) => true;  // you should always be allowed to call empty

  run(m: CbModel, r: circular_buffer<unknown>): void {
    assert.equal(m.length === 0, r.isEmpty);
  }

}





class CapacityCommand implements cb_command {

  toString = () => 'capacity';
  check    = (_m: Readonly<CbModel>) => true;  // you should always be allowed to call capacity

  run(m: CbModel, r: circular_buffer<unknown>): void {
    assert.equal(m.capacity, r.capacity);
  }

}





class FillCommand implements cb_command {

  toString = () => 'fill';
  check    = (_m: Readonly<CbModel>) => true;  // you should always be allowed to call fill

  run(m: CbModel, r: circular_buffer<unknown>): void {
    r.fill( whatever() );
    m.length = r.length;
    assert.equal(r.length, r.capacity);
    assert.equal(m.length, m.capacity);
  }

}





class IndexOfCommand implements cb_command {

  toString = () => 'indexOf';
  check    = (_m: Readonly<CbModel>) => true;  // test the sane and empty cases both

  run(_m: CbModel, r: circular_buffer<unknown>): void {

    const was = r.toArray();

    for (let i=0, iC = r.length; i < iC; ++i) {

      const toMatch = r.at(i),
            idx     = r.indexOf(toMatch);

      // if they match, the test is already successful
      // the goal is to find the matching index of whatever's
      // at the cell
      //
      // there is a valid special case: if this is the 2nd or
      // later amongst repeated values.  then, the first will
      // be found instead.  if they don't match, see if that's
      // what's happening.

      if (i !== idx) {
        assert.deepEqual(r.at(idx), toMatch);
      }

    }

    const now = r.toArray();
    assert.deepEqual(was, now);

  }

}





class ClearCommand implements cb_command {

  toString = () => 'clear';
  check    = (_m: Readonly<CbModel>) => true;  // you should always be allowed to call clear

  run(m: CbModel, r: circular_buffer<unknown>): void {

    const wlen = r.length,
          was  = r.clear();

    m.length = r.length;

    assert.equal(r.length,   0);
    assert.equal(m.length,   0);
    assert.equal(was.length, wlen);

  }

}





class AtCommand implements cb_command {

  toString = () => 'at';
  check    = (_m: Readonly<CbModel>) => true;  // tests the empty case so run either way

  run(_m: CbModel, r: circular_buffer<unknown>): void {

    if (r.isEmpty) {
      assert.throws( () => r.at(0) );
    } else {

      for (let e1=0, eC = r.length; e1 < eC; ++e1) {
        assert.doesNotThrow( () => r.at(e1) );
      }

    }

  }

}





class ToArrayCommand implements cb_command {

  toString = () => 'to_array';
  check    = (_m: Readonly<CbModel>) => true;  // you should always be allowed to call to_array

  run(m: CbModel, r: circular_buffer<unknown>): void {
    const res = r.toArray();
    assert.equal(r.length, res.length);
    assert.equal(m.length, res.length);
  }

}





describe('[STOCH] Bad constructor harassment', () => {

  test('Floats', () => {
    fc.assert(
      fc.property(
        fc.nat(),
        sz => assert.throws(
          () => new circular_buffer( Number.isInteger(sz)? sz+0.1 : sz )  // if an int, non-int it
        )
      )
    );
  });

  test('Non-positive', () => {
    fc.assert(
      fc.property(
        fc.nat(),
        sz => {
          assert.throws( () => new circular_buffer( sz === 0? -2 : sz * -1 ) );
        }
      )
    );
  });

  test('Inf, NInf, NaN', () => {
    assert.throws( () => new circular_buffer( Number.POSITIVE_INFINITY ) );
    assert.throws( () => new circular_buffer( Number.NEGATIVE_INFINITY ) );
    assert.throws( () => new circular_buffer( NaN )                      );
  });

});





describe('[STOCH] at/1 good calls', () => {
  test('Check position <=5000 in container size <= 5000', () => {

    fc.assert(
      fc.property(
        fc.integer(1, 5000),
        fc.integer(0, 5000),
        (sz, at) => {
          const cb = new circular_buffer<number>(sz);
          for (let i=0; i<sz; ++i) { cb.push(i); }

          assert.equal(cb.at(Math.min(sz-1,at)), Math.min(sz-1,at));
        }
      )
    );

  });
});





describe('[STOCH] at/1 bad calls', () => {

  const cb = new circular_buffer<number>(3);
  cb.push(1);

  test('Floats', () => {
    fc.assert(
      fc.property(
        fc.float(),
        sz => {
          fc.pre( !( Number.isInteger(sz) ) );
          assert.throws( () => cb.at( sz ) );
        }
      )
    )
  });

  test('Non-positive', () => {
    fc.assert(
      fc.property(
        fc.nat(),
        sz => {
          fc.pre(sz !== 0);
          assert.throws( () => cb.at( sz * -1 ) );
        }
      )
    );
  });

  test('Over-capacity lookup', () => {
    assert.throws( () => cb.at( 4 ) );
  });

  test('Over-length lookup', () => {
    assert.throws( () => cb.at( 2 ) );
  });

  test('Inf, NInf, 0, NaN', () => {
    assert.throws( () => cb.at( Number.POSITIVE_INFINITY ) );
    assert.throws( () => cb.at( Number.NEGATIVE_INFINITY ) );
    assert.throws( () => cb.at( NaN )                      );
  });

});





describe('[STOCH] Circular buffer', () => {

  const MaxCommandCount      = 100,
        MinBufferSize        = 1,

        TinyRunCount         = 1000,
        SmallRunCount        = 200,
        RegularRunCount      = 40,
        LargeRunCount        = 8,

        TinyMaxBufferSize    = 1,
        SmallMaxBufferSize   = 5,
        RegularMaxBufferSize = 50,
        LargeMaxBufferSize   = 500;

  const PushARandomInteger = fc.integer().map(v => new PushCommand(v)),
        Pop                = fc.constant( new PopCommand()       ),
        Length             = fc.constant( new LengthCommand()    ),
        Every              = fc.constant( new EveryCommand()     ),
        Find               = fc.constant( new FindCommand()      ),
        Some               = fc.constant( new SomeCommand()      ),
        Reverse            = fc.constant( new ReverseCommand()   ),
        Available          = fc.constant( new AvailableCommand() ),
        Capacity           = fc.constant( new CapacityCommand()  ),
        At                 = fc.constant( new AtCommand()        ),
        ToArray            = fc.constant( new ToArrayCommand()   ),
        Fill               = fc.constant( new FillCommand()      ),
        IndexOf            = fc.constant( new IndexOfCommand()   ),
        Clear              = fc.constant( new ClearCommand()     ),
        Full               = fc.constant( new FullCommand()      ),
        Empty              = fc.constant( new EmptyCommand()     ),
        First              = fc.constant( new FirstCommand()     ),
        Last               = fc.constant( new LastCommand()      );

  const AllCommands        = [ PushARandomInteger, Pop, Length, Every, Find, Some, Reverse, Available, Capacity, At, ToArray, Fill, IndexOf, Clear, Full, Empty, First, Last ],
        AllCommandNames    =  `PushARandomInteger, Pop, Length, Every, Find, Some, Reverse, Available, Capacity, At, ToArray, Fill, IndexOf, Clear, Full, Empty, First, Last`,
        CommandGenerator   = fc.commands(AllCommands, MaxCommandCount);

    // define the possible commands and their inputs

  const TinySizeGenerator    :  fc.ArbitraryWithShrink<number> = fc.integer(MinBufferSize, TinyMaxBufferSize),
        SmallSizeGenerator   :  fc.ArbitraryWithShrink<number> = fc.integer(MinBufferSize, SmallMaxBufferSize),
        RegularSizeGenerator :  fc.ArbitraryWithShrink<number> = fc.integer(MinBufferSize, RegularMaxBufferSize),
        LargeSizeGenerator   :  fc.ArbitraryWithShrink<number> = fc.integer(MinBufferSize, LargeMaxBufferSize);

  type guideSize = [ fc.ArbitraryWithShrink<number>, number, number ];

  const Sizes: guideSize[] = [
    [ TinySizeGenerator,    TinyRunCount,    TinyMaxBufferSize    ],
    [ SmallSizeGenerator,   SmallRunCount,   SmallMaxBufferSize   ],
    [ RegularSizeGenerator, RegularRunCount, RegularMaxBufferSize ],
    [ LargeSizeGenerator,   LargeRunCount,   LargeMaxBufferSize   ]
  ];


  const CommandInstance = (sz: number, cmds: Iterable<cb_command>) => {

    const s = () =>
      ({ model : { length: 0, capacity: sz },
         real  : new circular_buffer(sz) }
      );

    fc.modelRun(s, cmds);

  };



  describe(AllCommandNames, () => {

    function test_generator(SizeGenerator: fc.ArbitraryWithShrink<number>, RunCount: number, MaxBufferSize: number) {

      return test(`size <= ${MaxBufferSize}, ${RunCount} runs <= ${MaxCommandCount} commands`, () => {

        // run everything on small sizes
        fc.assert(
          fc.property(SizeGenerator, CommandGenerator, CommandInstance),
          { numRuns: RunCount }
        );

      });

    }

    Sizes.map(
      ([SzGen, RcGen, MxBufSz]) => test_generator(SzGen, RcGen, MxBufSz)
    );

  });


});






describe('[STOCH] version', () => {
  test('Version is present',   () => expect(typeof version).toBe('string'));
  test('Version is non-empty', () => expect(version.length > 0).toBe(true));
});
