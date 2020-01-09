import ErrorAsync from './error-async'
import R from 'ramda'

const noop = () => {}
const flow = val => (...fns) => R.pipe(...fns)(val)

// console.log('ErrorAsync: ', Object.keys(ErrorAsync))
// console.log('ErrorAsync.prototype: ', Object.keys(ErrorAsync.prototype))
// console.log('ErrorAsync: ', ErrorAsync.of('fart').toString())

describe('ErrorAsync Monad', () => {
  describe('ErrorAsync.of', () => {
    it('returns a forkable ErrorAsync', () => {
      expect.assertions(1)
      ErrorAsync.of(2)
        .forkAsync(val => {
          expect(val).toBe(2)
        })
    })
  })

  describe('ErrorAsync.forkAsync', () => {
    it('evaluates the computation with ErrorAsync', () => {
      expect.assertions(1)
      ErrorAsync.of(2)
        .forkAsync(val => {
          expect(
            val
          ).toBe(2)
        })
    })

    it('can be called multiple times on a single ErrorAsync instance', () => {
      expect.assertions(2)
      const async = ErrorAsync.of(2)

      async.forkAsync(val => {
        expect(val).toBe(2)
      })

      async.forkAsync(val => {
        expect(val).toBe(2)
      })
    })

    it.skip('[FAILS] returns cached values if called multiple times, rather than re-performing the computation', () => {
      expect.assertions(4)
      const spy = jest.fn(R.identity)

      const async = ErrorAsync.of(2).map(spy)

      async.forkAsync(val => {
        expect(val).toBe(2)
        expect(spy).toHaveBeenCalledTimes(1)
      })

      async.forkAsync(val => {
        expect(val).toBe(2)
        expect(spy).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('ErrorAsync.throwError', () => {

  })

  describe('ErrorAsync.prototype.map', () => {
    it('composes a computation `a -> b`', () => {
      expect.assertions(1)
      ErrorAsync.of(2)
        .map(a => a * 3)
        .forkAsync(val => {
          expect(val).toBe(6)
        })
    })
  })

  describe('ErrorAsync.prototype.chain', () => {
    it('composes a computation `a -> b`', () => {
      expect.assertions(1)
      const a = ErrorAsync.of(2)
        .chain(a => ErrorAsync.of(a * 3))
        .forkAsync(val => {
          console.log('val.toString()', val.toString())
          expect(val).toBe(6)
        })
      console.log('a', a.toString())
    })

    it('skips past map() when error is thrown', () => {
      expect.assertions(2)
      ErrorAsync.of(2)
        .chain(() => ErrorAsync.throwError(new Error('Test Error')))
        .map(a => a * 7)
        .forkAsync(output => {
          expect(output).toBeInstanceOf(Error)
          expect(output.message).toBe('Test Error')
        })
    })

    it('skips past chain() when error is thrown', () => {
      expect.assertions(2)
      ErrorAsync.of(2)
        .chain(a => ErrorAsync.of(a * 3))
        .chain(() => ErrorAsync.throwError(new Error('Test Error')))
        .chain(a => ErrorAsync.of(a * 7))
        .forkAsync(output => {
          expect(output).toBeInstanceOf(Error)
          expect(output.message).toBe('Test Error')
        })
    })

    it('skips `catchError()` clause when no error has been thrown', () => {
      expect.assertions(1)
      ErrorAsync.of(2)
        .chain(a => ErrorAsync.of(a * 3))
        .catchError(_err => ErrorAsync.of(1))
        .chain(a => ErrorAsync.of(a * 5))
        .forkAsync(output => {
          expect(output).toBe(30)
        })
    })

    it('continues computation after `catchError()`', () => {
      expect.assertions(1)
      ErrorAsync.of(2)
        .chain(a => ErrorAsync.of(a * 3))
        .chain(a => ErrorAsync.of(a * 5))
        .chain(() => ErrorAsync.throwError(1))
        .catchError(err => ErrorAsync.of(err))
        .chain(a => ErrorAsync.of(a * 7))
        .forkAsync(output => {
          expect(output).toBe(7)
        })
    })
  })
})
