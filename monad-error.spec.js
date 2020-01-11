import MonadError, { catchError, throwError, MonadErrorT } from './monad-error'
import Identity from './identity'
import Daggy from 'daggy'
import R, { __, append, concat, chain, compose, map } from 'ramda'

const flow = val => (...fns) => R.pipe(...fns)(val)


describe('MonadError Monad', () => {
  describe('runMonadError', () => {
    it('executes the computation within a trivial MonadError', () => {
      const monadError = MonadError.of(5)
      const output = monadError.runMonadError()
      expect(output).toBe(5)
    })
  })

  describe('map', () => {
    it('composes a function into the MonadError\'s computation', () => {
      const monadError = MonadError.of(2)
      const mappedMonadError = monadError
        .map(a => a * 3)
        .map(a => a * 5)
      const output = mappedMonadError.runMonadError()
      expect(output).toBe(30)
    })
  })

  describe('chain', () => {
    it('composes Right computations', () => {
      const monadError = MonadError.of(2)
      const chainedMonadError = monadError.chain(
        a => MonadError.of(a * 7),
      )
      const output = chainedMonadError.runMonadError()
      expect(output).toBe(14)
    })

    it('skips past computations when error is thrown', () => {
      const monadError = MonadError.of(2)
      const chainedMonadError = flow(monadError)(
        chain(a => MonadError.of(a * 3)),
        chain(() => MonadError.throwError(new Error('Test Error'))),
        chain(a => MonadError.of(a * 5)),
        chain(a => MonadError.of(a * 7))
      )
      const output = chainedMonadError.runMonadError()

      expect(output).toBeInstanceOf(Error)
      expect(output.message).toBe('Test Error')
    })

    it('skips `catchError()` clause when no error has been thrown', () => {
      const monadError = MonadError.of(2)
      const chainedMonadError = monadError.chain(a => MonadError.of(a * 3))
        .chain(a => MonadError.of(a * 5))
        .catchError(err => MonadError.of(1))
        .chain(a => MonadError.of(a * 7))
      const output = chainedMonadError.runMonadError()

      expect(output).toBe(210)
    })

    it('continues computation after `catchError()`', () => {
      const monadError = MonadError.of(2)
      const chainedMonadError = monadError.chain(a => MonadError.of(a * 3))
        .chain(a => MonadError.of(a * 5))
        .chain(() => MonadError.throwError(1))
        .catchError(err => MonadError.of(err))
        .chain(a => MonadError.of(a * 7))
      const output = chainedMonadError.runMonadError()

      expect(output).toBe(7)
    })
  })

  describe('ap', () => {
    it('applies a MonadError<fn> to a MonadError<value>', () => {
      const valueMonadError = MonadError.of(3)
      const fnMonadError = MonadError.of(a => a * 11)
      const appedMonadError = valueMonadError.ap(fnMonadError)
      const output = appedMonadError.runMonadError()
      expect(output).toBe(33)
    })
  })
})

describe('MonadErrorTIdentity Monad', () => {
  const MonadErrorTIdentity = MonadErrorT(Identity)
  MonadErrorTIdentity.prototype.runMonadError = function() {
    const id = this.runMonadErrorT()
    return id.valueOf()
  }

  describe('runMonadError', () => {
    it('executes the computation within a trivial MonadErrorTIdentity', () => {
      const monadError = MonadErrorTIdentity.of(5)
      const output = monadError.runMonadError()
      expect(output).toBe(5)
    })
  })

  describe('map', () => {
    it('composes a function into the MonadErrorTIdentity\'s computation', () => {
      const output = MonadErrorTIdentity.of(2)
        .map(a => a * 3)
        .map(a => a * 5)
        .runMonadError()
      expect(output).toBe(30)
    })
  })

  describe('chain', () => {
    it('composes Valid computations', () => {
      const output = MonadErrorTIdentity.of('a')
        .chain(compose(MonadErrorTIdentity.of, concat(__, 'b')))
        .chain(compose(MonadErrorTIdentity.of, concat(__, 'c')))
        .runMonadError()
      expect(output).toBe('abc')
    })

    it('skips past computations when error is thrown', () => {
      const output = MonadErrorTIdentity.of(2)
        .chain(a => MonadErrorTIdentity.of(a * 3))
        .chain(() => MonadErrorTIdentity.throwError(new Error('Test Error')))
        .chain(a => MonadErrorTIdentity.of(a * 5))
        .chain(a => MonadErrorTIdentity.of(a * 7))
        .runMonadError()

      expect(output).toBeInstanceOf(Error)
      expect(output.message).toBe('Test Error')
    })

    it('skips `catchError()` clause when no error has been thrown', () => {
      const monadError = MonadErrorTIdentity.of(2)
      const chainedMonadError = flow(monadError)(
        chain(a => MonadErrorTIdentity.of(a * 3)),
        catchError(_err => MonadErrorTIdentity.of(1)),
        chain(a => MonadErrorTIdentity.of(a * 5)),
      )

      const output = chainedMonadError.runMonadError()
      expect(output).toBe(30)
    })

    it('continues computation after `catchError()`', () => {
      const output = MonadErrorTIdentity.of(2)
        .chain(a => MonadErrorTIdentity.of(a * 3))
        .chain(a => MonadErrorTIdentity.of(a * 5))
        .chain(() => MonadErrorTIdentity.throwError(1))
        .catchError(err => MonadErrorTIdentity.of(err))
        .chain(a => MonadErrorTIdentity.of(a * 7))
        .runMonadError()

      expect(output).toBe(7)
    })
  })

  describe('ap', () => {
    it('applies a MonadErrorTIdentity<fn> to a MonadErrorTIdentity<value>', () => {
      const valueMonadError = MonadErrorTIdentity.of(3)
      const fnMonadError = MonadErrorTIdentity.of(a => a * 11)
      const appedMonadError = valueMonadError.ap(fnMonadError)
      const output = appedMonadError.runMonadError()
      expect(output).toBe(33)
    })
  })
})

