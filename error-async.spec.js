import ErrorAsync from './error-async'
import * as R from 'ramda'
import { __, compose, concat } from 'ramda'

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

  describe('ErrorAsync.defer', () => {
    it('returns a synchronous ErrorAsync', async () => {
      expect.assertions(1)

      await ErrorAsync.defer(settle => settle('a'))
        .forkPromise(val => {
          expect(val).toBe('a')
        })
    })

    it('returns an asynchronous ErrorAsync', async () => {
      expect.assertions(1)

      await ErrorAsync
        .defer(settle => setTimeout(() => settle('a'), 0))
        .forkPromise(val => {
          expect(val).toBe('a')
        })
    })
  })

  describe('ErrorAsync.forkAsync', () => {
    it('evaluates the computation with ErrorAsync', () => {
      expect.assertions(1)
      ErrorAsync.of(2)
        .forkAsync(val => {
          expect(val).toBe(2)
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
    it('composes a computation `a -> mb`', async () => {
      expect.assertions(1)
      await ErrorAsync.of(2)
        .chain(a => ErrorAsync.defer(settle => { settle(a * 3) }))
        .forkPromise(val => { expect(val).toBe(6) })
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
      ErrorAsync.of('a')
        .chain(a => ErrorAsync.of(a + 'b'))
        .chain(() => ErrorAsync.throwError('c'))
        .catchError(err => ErrorAsync.of(err))
        .chain(a => ErrorAsync.of(a + 'd'))
        .forkAsync(output => {
          expect(output).toBe('cd')
        })
    })
  })

  describe('usage', () => {
    const nodeFnRej = (rej, _res) => {
      setTimeout(rej('no'))
    }
    const nodeFnRes = (_rej, res) => {
      setTimeout(res('yes'))
    }

    it('allows for branching to success before entering monadic context', () => {

    })

    it('allows for branching to success while in monadic context', () => {
      const asyncRes = () => {
        return ErrorAsync.of()
          .chain(() => {
            nodeFnRes(null, 
          })
      }
      const ErrorAsync.of()
        .chain(a => {
          
        })
    })
  })
})
