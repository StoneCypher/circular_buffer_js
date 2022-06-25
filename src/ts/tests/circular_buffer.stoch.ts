
import * as assert                  from 'assert';
import * as fc                      from 'fast-check';
import { version, circular_buffer } from '../circular_buffer';





type CbModel = {
  length   : number,
  capacity : number,
  offset   : number
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





class ShoveCommand implements cb_command {

  constructor(readonly value: number) {}    // eslint-disable-line no-unused-vars

  check = (_m: Readonly<CbModel>): boolean => true;  // allowed to push into a full cb because we test overflows

  run(m: CbModel, r: num_cb): void {

    const newValue = whatever();

    if (m.length < m.capacity) {  // cb isn't full, so should increase size
      r.shove( newValue );
      ++m.length;
      assert.deepEqual( r.last, newValue );
    } else if (m.capacity === 0) { // special case: cb is zero-sized
      assert.throws( () => r.shove( newValue ) );  // nowhere to shove
    } else { // cb is full, so shouldn't increase size
      r.shove( newValue );
      assert.deepEqual( r.last, newValue );
    }

  }

  toString = () => `shove(${this.value})`;

}




class PopCommand implements cb_command {

  toString = () => 'pop';
  check    = (_m: Readonly<CbModel>): boolean => true;  // allowed to pop from an empty cb because we test underflows

  run(m: CbModel, r: circular_buffer<unknown>): void {

    if (m.length > 0) {

      const oldFirst = r.first,
            popped   = r.pop();

      --m.length;
      ++m.offset;

      assert.deepEqual( popped, oldFirst );

    } else {
      assert.throws( () => r.pop() );
    }

  }

}





class SetCapacityCommand implements cb_command {

  _sizeSeed  : number;
  _calcSize? : number;

  constructor(readonly sizeSeed: number) { this._sizeSeed = sizeSeed; }  // see https://github.com/dubzzz/fast-check/issues/2136

  toString = () => `set capacity(${this._calcSize ?? 'no size!'})`;
  check    = (_m: Readonly<CbModel>) => true;  // you should always be allowed to resize

  run(m: CbModel, r: circular_buffer<unknown>): void {

    this._calcSize = (m.capacity === 0)? 0 : this._sizeSeed % m.capacity;

    const newSize = this._calcSize,
          was     = r.toArray(),
          oldSize = was.length;

    r.capacity = newSize;
    m.capacity = newSize;
    m.length   = Math.min(m.length, newSize);

    const nowIs = r.toArray();

    assert.equal(r.capacity, newSize);
    assert.equal(m.capacity, newSize);


    for (let i=0, iC=Math.min(oldSize, newSize); i<iC; ++i) {
      assert.deepEqual(nowIs[i], was[i]);
    }

  }

}





class ResizeCommand implements cb_command {

  _sizeSeed  : number;
  _calcSize? : number;

  constructor(readonly sizeSeed: number) { this._sizeSeed = sizeSeed; }  // see https://github.com/dubzzz/fast-check/issues/2136

  toString = () => `resize(${this._calcSize ?? 'no size!'})`;
  check    = (_m: Readonly<CbModel>) => true;  // you should always be allowed to resize

  run(m: CbModel, r: circular_buffer<unknown>): void {

    this._calcSize = (m.capacity === 0)? 0 : this._sizeSeed % m.capacity;

    const newSize = this._calcSize,
          was     = r.toArray(),
          oldSize = was.length;

    r.resize(newSize);
    m.capacity = newSize;
    m.length   = Math.min(m.length, newSize);

    const nowIs = r.toArray();

    assert.equal(r.capacity, newSize);
    assert.equal(m.capacity, newSize);


    for (let i=0, iC=Math.min(oldSize, newSize); i<iC; ++i) {
      assert.deepEqual(nowIs[i], was[i]);
    }

  }

}





class SetLengthCommand implements cb_command {

  _sizeSeed  : number;
  _calcSize? : number;

  constructor(readonly sizeSeed: number) { this._sizeSeed = sizeSeed; }  // see https://github.com/dubzzz/fast-check/issues/2136

  toString = () => `set_length(${this._calcSize ?? `seed ${this._sizeSeed}`})`;
  check    = (_m: Readonly<CbModel>) => true;  // you should always be allowed to call set length

  run(m: CbModel, r: circular_buffer<unknown>): void {

    assert.equal(m.length, r.length);

    this._calcSize = (m.capacity === 0)? 0 : this._sizeSeed % m.capacity;

    const newSize = this._calcSize,
          was     = r.toArray(),
          oldSize = was.length;

    r.length = newSize;
    m.length = Math.min(newSize, oldSize);

    const nowIs = r.toArray();

    assert.equal(r.length, Math.min(newSize, oldSize));
    assert.equal(m.length, Math.min(newSize, oldSize));


    for (let i=0, iC=Math.min(oldSize, newSize); i<iC; ++i) {
      assert.deepEqual(nowIs[i], was[i]);
    }

  }

}





class GetLengthCommand implements cb_command {

  toString = () => 'get_length';
  check    = (_m: Readonly<CbModel>) => true;  // you should always be allowed to call get length

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





class PosCommand implements cb_command {

  toString = () => 'pos';
  check    = (_m: Readonly<CbModel>) => true;  // tests the empty case so run either way

  run(_m: CbModel, r: circular_buffer<unknown>): void {

    if (r.isEmpty) {
      assert.throws( () => r.at(0) );
    } else {

      const ofs = r.offset();

      for (let e1=0, eC = r.length; e1 < eC; ++e1) {
        assert.doesNotThrow( () => r.pos(e1 + ofs) );  // can be looked up
        assert.equal( r.pos(e1 + ofs), r.at(e1) );     // matches what .at() says
      }

    }

  }

}





class OffsetCommand implements cb_command {

  toString = () => 'offset';
  check    = (_m: Readonly<CbModel>) => true;  // tests the empty case so run either way

  run(_m: CbModel, r: circular_buffer<unknown>): void {
    assert.doesNotThrow( () => r.offset() );     // can be looked up
    if (r.length) {
      assert.equal( r.pos(r.offset()), r.at(0) );  // offset matches head
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





describe('[STOCH] Bad resize harassment', () => {

  test('Floats', () => {
    fc.assert(
      fc.property(
        fc.float(),
        sz => assert.throws(
          () => {
            const cb  = new circular_buffer(1);
            if (Number.isInteger(sz)) {
              cb.length = sz + 0.1;
            } else {
              cb.length = sz;
            }
          }
        )
      )
    );
  });

  test('Non-positive', () => {
    fc.assert(
      fc.property(
        fc.nat(),
        sz => assert.throws(
          () => {
            const cb  = new circular_buffer(1);
            cb.length = sz === 0? -2 : sz * -1;
          }
        )
      )
    );
  });

  test('Inf, NInf, NaN', () => {

    assert.throws( () => {
      const cb  = new circular_buffer(0);
      cb.length = Number.POSITIVE_INFINITY;
    });

    assert.throws( () => {
      const cb  = new circular_buffer(0);
      cb.length = Number.NEGATIVE_INFINITY;
    });

    assert.throws( () => {
      const cb  = new circular_buffer(0);
      cb.length = NaN;
    });

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





// describe('[STOCH] pos/1 good calls', () => {
//   test('Check position <=5000 in container size <= 5000', () => {

//     fc.assert(
//       fc.property(
//         fc.integer(1, 5000),
//         fc.integer(0, 5000),
//         (sz, at) => {
//           const cb = new circular_buffer<number>(sz);
//           for (let i=0; i<sz; ++i) { cb.push(i); }

//           assert.equal(cb.pos(Math.min(sz-1,at)), Math.min(sz-1,at));
//         }
//       )
//     );

//   });
// });





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

  const PushARandomInteger   = fc.integer().map(v => new PushCommand(v)        ),
        ShoveARandomInteger  = fc.integer().map(v => new ShoveCommand(v)       ),
        Resize               = fc.nat().map(    v => new ResizeCommand(v)      ),
        SetCapacity          = fc.nat().map(    v => new SetCapacityCommand(v) ),
        SetLength            = fc.nat().map(    v => new SetLengthCommand(v)   ),
        GetLength            = fc.constant( new GetLengthCommand() ),
        Pop                  = fc.constant( new PopCommand()       ),
        Every                = fc.constant( new EveryCommand()     ),
        Find                 = fc.constant( new FindCommand()      ),
        Some                 = fc.constant( new SomeCommand()      ),
        Reverse              = fc.constant( new ReverseCommand()   ),
        Available            = fc.constant( new AvailableCommand() ),
        Capacity             = fc.constant( new CapacityCommand()  ),
        At                   = fc.constant( new AtCommand()        ),
        Pos                  = fc.constant( new PosCommand()       ),
        Offset               = fc.constant( new OffsetCommand()    ),
        ToArray              = fc.constant( new ToArrayCommand()   ),
        Fill                 = fc.constant( new FillCommand()      ),
        IndexOf              = fc.constant( new IndexOfCommand()   ),
        Clear                = fc.constant( new ClearCommand()     ),
        Full                 = fc.constant( new FullCommand()      ),
        Empty                = fc.constant( new EmptyCommand()     ),
        First                = fc.constant( new FirstCommand()     ),
        Last                 = fc.constant( new LastCommand()      );

  const AllCommands          = [ PushARandomInteger, ShoveARandomInteger, Pop, GetLength, SetLength, SetCapacity, Every, Find, Some, Reverse, Available, Capacity, At, Pos, Offset, Resize, ToArray, Fill, IndexOf, Clear, Full, Empty, First, Last ],
        AllCommandNames      =  `PushARandomInteger, ShoveARandomInteger, Pop, GetLength, SetLength, SetCapacity, Every, Find, Some, Reverse, Available, Capacity, At, Pos, Offset, Resize, ToArray, Fill, IndexOf, Clear, Full, Empty, First, Last`,
        CommandGenerator     = fc.commands(AllCommands, MaxCommandCount);

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
      ({ model : { length: 0, offset: 0, capacity: sz },
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
          { numRuns: RunCount, verbose: true }
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
