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

  describe('either', () => {
    it('escapes Return after transformation with leftFn', () => {
      const output = either(a => a * 3, noop, Return.of(2))
      expect(output).toBe(6)
    })

    it('escapes Suspend after transformation with rightFn', () => {
      const output = either(noop, a => a * 3, Suspend.of(2))
      expect(output).toBe(6)
    })
  })


  describe('fromReturn', () => {
    it('returns a default value from a Suspend', () => {
      const r = Free.Suspend.of(5)
      const val = fromReturn('default', r)
      expect(val).toBe('default')
    })

    it('returns the computed value from a Return', () => {
      const l = Free.Return.of(5)
      const val = fromReturn('default', l)
      expect(val).toBe(5)
    })
  })

  describe('fromSuspend', () => {
    it('returns a default value from a Return', () => {
      const l = Free.Return.of(5)
      const val = fromSuspend('default', l)
      expect(val).toBe('default')
    })

    it('returns the computed value from a Suspend', () => {
      const r = Free.Suspend.of(5)
      const val = fromSuspend('default', r)
      expect(val).toBe(5)
    })
  })

  describe('zipFrees', () => {
    it('returns Return of inputs if the lists aren\'t the same length', () => {
      const listA = [ Suspend.of(1) ]
      const listB = [ Suspend.of(1), Suspend.of(2) ]

      const output = Free.fromReturn('ERROR', zipFrees(listA, listB))
      expect(output).toEqual([ listA, listB ])
    })

    it('returns a Suspend of array of arrays of VALUES where both were Suspend', () => {
      const a = [ Suspend.of(1), Return.of(2), Suspend.of(3), Return.of(4), Suspend.of(5) ]
      const b = [ Suspend.of(1), Suspend.of(2), Return.of(3), Return.of(4), Suspend.of(5) ]

      const output = Free.fromSuspend('ERROR', zipFrees(a, b))

      expect(output).toEqual([
        [ a[0].runFree(), b[0].runFree() ],
        [ a[4].runFree(), b[4].runFree() ],
      ])
    })
  })
})
