
import * as assert         from 'assert';
import * as fc             from 'fast-check';
import { circular_buffer } from '../circular_buffer';





type CbModel = {
  length   : number,
  capacity : number
};

type num_cb = circular_buffer<unknown>;

type cb_command = fc.Command<CbModel, num_cb>;





class PushCommand implements cb_command {

  constructor(readonly value: number) {}

  check = (model: Readonly<CbModel>): boolean =>
    model.length < model.capacity;  // constrained: should not push into a full cb

  run(m: CbModel, r: num_cb): void {

    const newValue = fc.anything({
      withBigInt        : true,
      withBoxedValues   : true,
      withDate          : true,
      withMap           : true,
      withNullPrototype : true,
      withObjectString  : true,
      withSet           : true,
      withTypedArray    : true
    });

    if (m.length < m.capacity) {  // cb isn't full, so should work
      r.push( newValue );
    } else { // cb _is_ full, so should fail
      assert.throws( () => r.push( newValue ) );
    }

    ++m.length;

  }

  toString = () => `push(${this.value})`;

}




class PopCommand implements cb_command {

  check = (m: Readonly<CbModel>): boolean =>
    m.length > 0;    // constrained: should not call pop on an empty cb

  run(m: CbModel, r: circular_buffer<unknown>): void {
    r.pop();
    --m.length;
  }

  toString = () => 'pop';
}





class LengthCommand implements cb_command {

  check = (_m: Readonly<CbModel>) => true;  // you should always be allowed to call length

  run(m: CbModel, r: circular_buffer<unknown>): void {
    assert.equal(m.length, r.length());
  }

  toString = () => 'length';

}





class AvailableCommand implements cb_command {

  check = (_m: Readonly<CbModel>) => true;  // you should always be allowed to call available

  run(m: CbModel, r: circular_buffer<unknown>): void {
    assert.equal(m.capacity - m.length, r.available());
  }

  toString = () => 'available';

}





class FullCommand implements cb_command {

  check = (_m: Readonly<CbModel>) => true;  // you should always be allowed to call full

  run(m: CbModel, r: circular_buffer<unknown>): void {
    assert.equal(m.length === m.capacity, r.full());
  }

  toString = () => 'full';

}





class EmptyCommand implements cb_command {

  check = (_m: Readonly<CbModel>) => true;  // you should always be allowed to call empty

  run(m: CbModel, r: circular_buffer<unknown>): void {
    assert.equal(m.length === 0, r.empty());
  }

  toString = () => 'empty';

}





class CapacityCommand implements cb_command {

  check = (_m: Readonly<CbModel>) => true;  // you should always be allowed to call length

  run(m: CbModel, r: circular_buffer<unknown>): void {
    assert.equal(m.capacity, r.capacity());
  }

  toString = () => 'capacity';

}





describe('[STOCH] Circular buffer', () => {

  const MaxCommandCount      = 1000,
        MinBufferSize        = 1,

        SmallRunCount        = 200,
        RegularRunCount      = 40,
        LargeRunCount        = 8,

        SmallMaxBufferSize   = 5,
        RegularMaxBufferSize = 50,
        LargeMaxBufferSize   = 500;

  const PushARandomInteger = fc.integer().map(v => new PushCommand(v)),
        Pop                = fc.constant(new PopCommand()),
        Length             = fc.constant(new LengthCommand()),
        Available          = fc.constant(new AvailableCommand()),
        Capacity           = fc.constant(new CapacityCommand()),
        Full               = fc.constant(new FullCommand()),
        Empty              = fc.constant(new EmptyCommand());

  const AllCommands        = [ PushARandomInteger, Pop, Length, Available, Capacity, Full, Empty ];

    // define the possible commands and their inputs

  const SmallSizeGenerator   :  fc.ArbitraryWithShrink<number> = fc.integer(MinBufferSize, LargeMaxBufferSize),
        RegularSizeGenerator :  fc.ArbitraryWithShrink<number> = fc.integer(MinBufferSize, LargeMaxBufferSize),
        LargeSizeGenerator   :  fc.ArbitraryWithShrink<number> = fc.integer(MinBufferSize, LargeMaxBufferSize),

        CommandGenerator = fc.commands(AllCommands, MaxCommandCount);

  type guideSize = [ fc.ArbitraryWithShrink<number>, number, number ];

  const Sizes: guideSize[] = [
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


  describe(`Push Pop Len Avl Cap Full Empty`, () => {

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
