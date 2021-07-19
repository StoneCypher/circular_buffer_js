
import * as assert                  from 'assert';
import * as fc                      from 'fast-check';
import { version, circular_buffer } from '../circular_buffer';





type CbModel = {
  length   : number,
  capacity : number
};

type num_cb     = circular_buffer<unknown>;
type cb_command = fc.Command<CbModel, num_cb>;





function whatever(): unknown {
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

  constructor(readonly value: number) {}

  check = (_m: Readonly<CbModel>): boolean => true;  // allowed to push into a full cb because we test overflows

  run(m: CbModel, r: num_cb): void {

    const newValue = whatever();

    if (m.length < m.capacity) {  // cb isn't full, so should work
      r.push( newValue );
      ++m.length;
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
      r.pop();
      --m.length;
    } else {
      assert.throws( () => r.pop() );
    }

  }

}





class LengthCommand implements cb_command {

  toString = () => 'length';
  check    = (_m: Readonly<CbModel>) => true;  // you should always be allowed to call length

  run(m: CbModel, r: circular_buffer<unknown>): void {
    assert.equal(m.length, r.length());
  }

}





class AvailableCommand implements cb_command {

  toString = () => 'available';
  check    = (_m: Readonly<CbModel>) => true;  // you should always be allowed to call available

  run(m: CbModel, r: circular_buffer<unknown>): void {
    assert.equal(m.capacity - m.length, r.available());
  }

}





class FullCommand implements cb_command {

  toString = () => 'full';
  check    = (_m: Readonly<CbModel>) => true;  // you should always be allowed to call full

  run(m: CbModel, r: circular_buffer<unknown>): void {
    assert.equal(m.length === m.capacity, r.full());
  }

}





class EmptyCommand implements cb_command {

  toString = () => 'empty';
  check    = (_m: Readonly<CbModel>) => true;  // you should always be allowed to call empty

  run(m: CbModel, r: circular_buffer<unknown>): void {
    assert.equal(m.length === 0, r.empty());
  }

}





class CapacityCommand implements cb_command {

  toString = () => 'capacity';
  check    = (_m: Readonly<CbModel>) => true;  // you should always be allowed to call length

  run(m: CbModel, r: circular_buffer<unknown>): void {
    assert.equal(m.capacity, r.capacity());
  }

}





class FillCommand implements cb_command {

  toString = () => 'fill';
  check    = (_m: Readonly<CbModel>) => true;  // you should always be allowed to call length

  run(m: CbModel, r: circular_buffer<unknown>): void {
    r.fill( whatever() );
    m.length = r.length();
    assert.equal(r.length(), r.capacity());
    assert.equal(m.length,   m.capacity);
  }

}





class ClearCommand implements cb_command {

  toString = () => 'clear';
  check    = (_m: Readonly<CbModel>) => true;  // you should always be allowed to call clear

  run(m: CbModel, r: circular_buffer<unknown>): void {
    r.clear();
    m.length = r.length();
    assert.equal(r.length(), 0);
    assert.equal(m.length,   0);
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
          assert.throws( () => new circular_buffer( sz * -1 ) );
        }
      )
    );
  });

  test('Inf, NInf, 0, NaN', () => {
    assert.throws( () => new circular_buffer( Number.POSITIVE_INFINITY ) );
    assert.throws( () => new circular_buffer( Number.NEGATIVE_INFINITY ) );
    assert.throws( () => new circular_buffer( 0 )                        );
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

        Pop                = new PopCommand(),
        Length             = new LengthCommand(),
        Available          = new AvailableCommand(),
        Capacity           = new CapacityCommand(),
        Fill               = new FillCommand(),
        Clear              = new ClearCommand(),
        Full               = new FullCommand(),
        Empty              = new EmptyCommand(),
        ConstableVals      = [Pop, Length, Available, Capacity, Fill, Clear, Full, Empty].map(cmd => fc.constant(cmd));
        // Pop                = fc.constant(new PopCommand()),
        // Length             = fc.constant(new LengthCommand()),
        // Available          = fc.constant(new AvailableCommand()),
        // Capacity           = fc.constant(new CapacityCommand()),
        // Fill               = fc.constant(new FillCommand()),
        // Clear              = fc.constant(new ClearCommand()),
        // Full               = fc.constant(new FullCommand()),
        // Empty              = fc.constant(new EmptyCommand());

  const AllCommands        = [ PushARandomInteger, ... ConstableVals ],
        AllCommandNames    = [ 'Push', ... ConstableVals.map(ec => ec.toString()) ].join(' '),
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
