import * as R from 'ramda'

import Free, {
  Return,
  Suspend,
  either,
  fromReturn,
  fromSuspend,
  runFree,
  zipFrees,
} from './either'



// ----------------------------------------------------------------- //
// Constants and Hlpers
// ----------------------------------------------------------------- //
const noop = () => {}


// ----------------------------------------------------------------- //
// Tests
// ----------------------------------------------------------------- //
describe('Free Monad', () => {
  describe('runFree', () => {
    it('executes the computation within a trivial Free', () => {
      const either = Free.of(5)
      const output = either.runFree()
      expect(output).toBe(5)
    })
  })

  describe('map', () => {
    it('composes a function into the Free\'s computation', () => {
      const either = Free.of(2)
      const mappedFree = either.map(a => a * 3)
      const output = mappedFree.runFree()
      expect(output).toBe(6)
    })
  })

  describe('chain', () => {
    it('composes Suspend computations', () => {
      const output = Free.of(2)
        .chain(a => Free.of(a * 3))
        .chain(a => Free.of(a * 5))
        .runFree()
      expect(output).toBe(30)
    })

    it('skips past computations when Return', () => {
      const either = Free.of(2)
      const chainedFree = either.chain(a => Free.of(a * 3))
        .chain(a => Free.Return.of(a * 5))
        .chain(a => Free.of(a * 7))
        .chain(a => Free.of(a * 11))
        .chain(a => Free.Return.of(a * 13))
      const output = chainedFree.runFree()
      expect(output).toBe(30)
    })
  })

  describe('ap', () => {
    it('applies a Free<fn> to a Free<value>', () => {
      const valueFree = Free.of(3)
      const fnFree = Free.of(a => a * 11)
      const appedFree = valueFree.ap(fnFree)
      const output = appedFree.runFree()
      expect(output).toBe(33)
    })
  })
})
