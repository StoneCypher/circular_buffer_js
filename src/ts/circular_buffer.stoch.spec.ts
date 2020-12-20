
import * as assert         from 'assert';

import * as fc             from 'fast-check';
import { circular_buffer } from './circular_buffer';





type num_cb = circular_buffer<unknown>;

type CbModel = {
  length   : number,
  capacity : number
};





class PushCommand implements fc.Command<CbModel, num_cb> {

  constructor(readonly value: number) {}

  check = (model: Readonly<CbModel>): boolean =>
    model.length < model.capacity;  // constrained: should not push into a full cb

  run(m: CbModel, r: num_cb): void {

    r.push(this.value);
    ++m.length;

    assert.equal(m.capacity - m.length, r.available());

  }

  toString = () => `push(${this.value})`;

}




class PopCommand implements fc.Command<CbModel, num_cb> {

  check = (m: Readonly<CbModel>): boolean =>
    m.length > 0;    // constrained: should not call pop on an empty cb

  run(m: CbModel, r: circular_buffer<unknown>): void {
    r.pop();
    --m.length;
  }

  toString = () => 'pop';
}





class LengthCommand implements fc.Command<CbModel, num_cb> {

  check = (_m: Readonly<CbModel>) => true;  // you should always be allowed to call length

  run(m: CbModel, r: circular_buffer<unknown>): void {
    assert.equal(m.length, r.length());
  }

  toString = () => 'length';

}





describe('[STOCH] Circular buffer', () => {

  const RunCount        = 200,
        MaxCommandCount = 5000,
        MinBufferSize   = 1,
        MaxBufferSize   = 5000;

  test(`Push Pop Length; size <= ${MaxBufferSize}, ${RunCount} runs <= ${MaxCommandCount} commands`, () => {

    // define the possible commands and their inputs
    const allCommands = [
      fc.integer().map(v => new PushCommand(v)),
      fc.constant(new PopCommand()),
      fc.constant(new LengthCommand())
    ];

    const SizeGenerator    = fc.integer(MinBufferSize, MaxBufferSize),
          CommandGenerator = fc.commands(allCommands, MaxCommandCount);

    // run everything
    fc.assert(

      fc.property(SizeGenerator, CommandGenerator, (sz, cmds) => {

        const s = () =>
          ({ model : { length: 0, capacity: sz },
             real  : new circular_buffer(sz) }
          );

        fc.modelRun(s, cmds);

      }),

      { numRuns: RunCount }

    );


  });

});
