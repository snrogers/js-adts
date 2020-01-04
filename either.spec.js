import Either, { EitherT } from './either'
import Identity from './identity'


describe('Either Monad', () => {
  describe('runEither', () => {
    it('executes the computation within a trivial Either', () => {
      const either = Either.of(5)
      const output = either.runEither()
      expect(output).toBe(5)
    })
  })

  describe('map', () => {
    it('composes a function into the Either\'s computation', () => {
      const either = Either.of(2)
      const mappedEither = either.map(a => a * 3)
      const output = mappedEither.runEither()
      expect(output).toBe(6)
    })
  })

  describe('chain', () => {
    it('composes Right computations', () => {
      const either = Either.of(2)
      const chainedEither = either.chain(
        a => Either.of(a * 7),
      )
      const output = chainedEither.runEither()
      expect(output).toBe(14)
    })

    it('skips past computations when Left', () => {
      const either = Either.of(2)
      const chainedEither = either.chain(a => Either.of(a * 3))
        .chain(a => Either.Left.of(a * 5))
        .chain(a => Either.of(a * 7))
        .chain(a => Either.of(a * 11))
        .chain(a => Either.Left.of(a * 13))
      const output = chainedEither.runEither()
      expect(output).toBe(30)
    })
  })

  describe('ap', () => {
    it('applies a Either<fn> to a Either<value>', () => {
      const valueEither = Either.of(3)
      const fnEither = Either.of(a => a * 11)
      const appedEither = valueEither.ap(fnEither)
      const output = appedEither.runEither()
      expect(output).toBe(33)
    })
  })
})


describe('EitherTIdentity Monad', () => {
  const EitherTIdentity = EitherT(Identity)
  EitherTIdentity.prototype.runEither = (eitherRun => {
    return function() { return this._fn().valueOf()._fn() }
  })(EitherTIdentity.prototype.runEither)

  describe('runEither', () => {
    it('executes the computation within a trivial EitherTIdentity', () => {
      const either = EitherTIdentity.of(5)
      const output = either.runEither()
      expect(output).toBe(5)
    })
  })

  describe('map', () => {
    it('composes a function into the EitherTIdentity\'s computation', () => {
      const either = EitherTIdentity.of(2)
      const mappedEitherTIdentity = either
        .map(a => a * 3)
        .map(a => a * 5)
        .map(a => a * 7)
      const output = mappedEitherTIdentity.runEither()
      expect(output).toBe(210)
    })
  })
  describe('chain', () => {
    it('composes Right computations', () => {
      const either = EitherTIdentity.of(2)
      const chainedEither = either.chain(
        a => EitherTIdentity.of(a * 7),
      )
      const output = chainedEither.runEither()
      expect(output).toBe(14)
    })

    it('skips past Right computations when Left', () => {
      const either = EitherTIdentity.of(2)
      const chainedEither = either
        .chain(a => EitherTIdentity.of(a * 3))
        .chain(a => EitherTIdentity.Left.of(a * 5))
        .chain(a => EitherTIdentity.of(a * 7))
        .chain(a => EitherTIdentity.of(a * 11))
        .chain(a => EitherTIdentity.Left.of(a * 13))
      const output = chainedEither.runEither()
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
})

