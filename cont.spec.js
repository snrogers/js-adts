import * as R from 'ramda'

import Cont, {
  mapCont,
  runCont,
  withCont,
} from './cont'



// ----------------------------------------------------------------- //
// Constants and Hlpers
// ----------------------------------------------------------------- //
const noop = () => {}


// ----------------------------------------------------------------- //
// Tests
// ----------------------------------------------------------------- //
describe('Cont Monad', () => {
  describe('runCont', () => {
    it('executes the computation within a Cont', () => {
      const cont = Cont.of('a')
      const output = cont.runCont(a => a + 'b')
      expect(output).toBe('ab')
    })
  })

  describe('map', () => {
    it('composes a function after the Cont\'s computation', () => {
      const cont = Cont.of('a')
      const mappedCont = cont.map(a => a + 'c')
      const output = mappedCont.runCont(a => a + 'b')
      expect(output).toBe('abc')
    })
  })

  describe('chain', () => {
    it('composes continuation-returning functions', () => {
      const output = Cont.of('a')
        .chain(a => Cont.of(a + 'b'))
        .chain(a => Cont.of(a + 'c'))
        .runCont(a => a + 'd')
      expect(output).toBe('abcd')
    })

    it.skip('skips past computations when Left', () => {
      const cont = Cont.of(2)
      const chainedCont = cont.chain(a => Cont.of(a * 3))
        .chain(a => Cont.Left.of(a * 5))
        .chain(a => Cont.of(a * 7))
        .chain(a => Cont.of(a * 11))
        .chain(a => Cont.Left.of(a * 13))
      const output = chainedCont.runCont()
      expect(output).toBe(30)
    })
  })

  describe('ap', () => {
    it('applies a Cont<fn> to a Cont<value>', () => {
      const valueCont = Cont.of('a')

      // NOTE: runs afterward like Map?
      //       Makes sense in terms of covariance, but feels weird,
      //       should think on it some more
      const fnCont = Cont.of(a => a + 'c')

      const appedCont = valueCont.ap(fnCont)
      const output = appedCont.runCont(a => a + 'b')
      expect(output).toBe('abc')
    })

    it.skip('works with R.sequence(Identity.of, listOfIdentities)', () => {
      const input = [ Right.of(1), Right.of(2), Right.of(3) ]
      const sequenced = R.sequence(Right.of, input)
      const output = sequenced.runCont()

      expect(output).toEqual([ 1, 2, 3 ])
    })

    it.skip('works with R.sequence(R.of, RightOfList)', () => {
      const input = Right.of([ 1, 2, 3 ])
      const sequenced = R.sequence(R.of, input)
      console.log('seuqneced', sequenced)
      const output = sequenced.map(Cont.runCont)

      expect(output).toEqual([ 1, 2, 3 ])
    })
  })

  describe.skip('cont', () => {
    it('escapes Left after transformation with leftFn', () => {
      const output = cont(a => a * 3, noop, Left.of(2))
      expect(output).toBe(6)
    })

    it('escapes Right after transformation with rightFn', () => {
      const output = cont(noop, a => a * 3, Right.of(2))
      expect(output).toBe(6)
    })
  })


  describe.skip('fromLeft', () => {
    it('returns a default value from a Right', () => {
      const r = Cont.Right.of(5)
      const val = fromLeft('default', r)
      expect(val).toBe('default')
    })

    it('returns the computed value from a Left', () => {
      const l = Cont.Left.of(5)
      const val = fromLeft('default', l)
      expect(val).toBe(5)
    })
  })

  describe.skip('fromRight', () => {
    it('returns a default value from a Left', () => {
      const l = Cont.Left.of(5)
      const val = fromRight('default', l)
      expect(val).toBe('default')
    })

    it('returns the computed value from a Right', () => {
      const r = Cont.Right.of(5)
      const val = fromRight('default', r)
      expect(val).toBe(5)
    })
  })
})
