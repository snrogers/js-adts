import { curry } from 'ramda'

import Identity from './identity'
import EitherT, { either, runEitherT } from './either.transform'


// ----------------------------------------------------------------- //
// Constants and Helpers
// ----------------------------------------------------------------- //
const noop = () => {}


// ----------------------------------------------------------------- //
// Tests
// ----------------------------------------------------------------- //
describe('EitherTIdentity Monad', () => {
  const EitherTIdentity = EitherT(Identity)
  EitherTIdentity.prototype.runEither = function() {
    return this.runEitherT().valueOf()
  }
  EitherTIdentity.prototype.either = curry(function (leftFn, rightFn) {
    return this.eitherT(leftFn, rightFn).valueOf()
  })
  EitherTIdentity.fromLeft = curry((defaultVal, eitherT) =>
    EitherTIdentity.fromLeftT(defaultVal, eitherT).valueOf()
  )
  EitherTIdentity.fromRight = curry((defaultVal, eitherT) =>
    EitherTIdentity.fromRightT(defaultVal, eitherT).valueOf()
  )

  describe('runEither', () => {
    it('executes the computation within a trivial EitherTIdentity', () => {
      const either = EitherTIdentity.of(5)
      const output = either.runEither()
      expect(output).toBe(5)
    })
  })

  describe('map', () => {
    it('composes a function into the EitherTIdentity\'s computation', () => {
      const output = EitherTIdentity.of(2)
        .map(a => a * 3)
        .map(a => a * 5)
        .map(a => a * 7)
        .runEither()
      expect(output).toBe(210)
    })
  })
  describe('chain', () => {
    it('composes Right computations', () => {
      const output = EitherTIdentity.of(2)
        .chain(a => EitherTIdentity.of(a * 3))
        .chain(a => EitherTIdentity.of(a * 5))
        .runEither()
      expect(output).toBe(30)
    })

    it('skips past Right computations when Left', () => {
      const output = EitherTIdentity.of(2)
        .chain(a => EitherTIdentity.of(a * 3))
        .chain(a => EitherTIdentity.Left.of(a * 5))
        .chain(a => EitherTIdentity.of(a * 7))
        .chain(a => EitherTIdentity.of(a * 11))
        .chain(a => EitherTIdentity.Left.of(a * 13))
        .runEither()
      expect(output).toBe(30)
    })
  })

  describe('ap', () => {
    it('applies a EitherTIdentity<fn> to a EitherTIdentity<value>', () => {
      const valueEither = EitherTIdentity.of(3)
      const fnEither = EitherTIdentity.of(a => a * 11)
      const appedEither = valueEither.ap(fnEither)
      const output = appedEither.runEither()
      expect(output).toBe(33)
    })
  })

  describe('fromLeft', () => {
    it('returns a default value from a Right', () => {
      const r = EitherTIdentity.Right.of(5)
      const val = EitherTIdentity.fromLeft('default', r)
      expect(val).toBe('default')
    })

    it('returns the computed value from a Left', () => {
      const l = EitherTIdentity.Left.of(5)
      const val = EitherTIdentity.fromLeft('default', l)
      expect(val).toBe(5)
    })
  })

  describe('either', () => {
    it('escapes Left after transformation with leftFn', () => {
      const output = either(
        a => a * 3,
        noop,
        EitherTIdentity.Left.of(2)
      )
      expect(output).toBe(6)
    })

    it('escapes Right after transformation with rightFn', () => {
      const output = either(
        noop,
        a => a * 3,
        EitherTIdentity.Right.of(2)
      )
      expect(output).toBe(6)
    })
  })

  describe('fromRight', () => {
    it('returns a default value from a Left', () => {
      const l = EitherTIdentity.Left.of(5)
      const val = EitherTIdentity.fromRight('default', l)
      expect(val).toBe('default')
    })

    it('returns the computed value from a Right', () => {
      const r = EitherTIdentity.Right.of(5)
      const val = EitherTIdentity.fromRight('default', r)
      expect(val).toBe(5)
    })
  })
})
