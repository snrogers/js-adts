import Async from './infallible-async'
import R from 'ramda'

const noop = () => {}

describe('Async Monad', () => {
  describe('Async(callbackFn)', () => {
    it('returns a synchronous forkable Async', () => {
      expect.assertions(1)
      Async(settle => settle('a'))
        .forkAsync(val => {
          expect(val).toBe('a')
        })
    })

    it('returns an asynchronous forkable Async', async () => {
      expect.assertions(1)
      await Async(settle => setTimeout(() => settle('a'), 0))
        .forkPromise(val => {
          expect(val).toBe('a')
        })
    })
  })

  describe('Async.of', () => {
    it('returns a synchronous forkable Async', () => {
      expect.assertions(1)
      Async.of(2)
        .forkAsync(val => {
          expect(val).toBe(2)
        })
    })
  })

  describe('Async.defer', () => {
    it('returns an asynchronous Async', async () => {
      expect.assertions(1)

      await Async.of('a')
        .forkPromise(val => {
          expect(val).toBe('a')
        })
    })
  })

  describe('Async.forkAsync', () => {
    it('evaluates a synchronous computation', () => {
      expect.assertions(1)
      Async.of(2)
        .forkAsync(val => {
          expect(val).toBe(2)
        })
    })

    it('evaluates an asynchronous computation', async () => {
      expect.assertions(1)
      await Async.defer(settle => setTimeout(() => settle(2), 0))
        .forkPromise(val => {
          expect(val).toBe(2)
        })
    })


    it('can be called multiple times on a synchronous Async instance', () => {
      expect.assertions(2)
      const async = Async.of(2)

      async.forkAsync(val => {
        expect(val).toBe(2)
      })

      async.forkAsync(val => {
        expect(val).toBe(2)
      })
    })

    it('can be called multiple times on an asynchronous Async instance', async () => {
      expect.assertions(2)
      const async = Async.defer(settle => setTimeout(() => settle(2), 0))

      await async.forkPromise(val => {
        expect(val).toBe(2)
      })

      await async.forkPromise(val => {
        expect(val).toBe(2)
      })
    })

    it('recomputes values if called multiple times', async () => {
      expect.assertions(4)
      const spy = jest.fn(R.identity)

      const async = Async.of(2)
        .map(spy)
        .map(R.identity)

      await async.forkPromise(val => {
        expect(val).toBe(2)
        expect(spy).toHaveBeenCalledTimes(1)
      })

      await async.forkPromise(val => {
        expect(val).toBe(2)
        expect(spy).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Async.prototype.map', () => {
    it('composes a computation `a -> b`', () => {
      expect.assertions(1)
      Async.of(2)
        .map(a => a * 3)
        .forkAsync(val => {
          expect(val).toBe(6)
        })
    })
  })

  describe('Async.prototype.chain', () => {
    it('composes a computation `a -> b`', () => {
      expect.assertions(1)
      Async.of(2)
        .chain(a => Async.of(a * 3))
        .forkAsync(val => {
          expect(val).toBe(6)
        })
    })
  })
})
