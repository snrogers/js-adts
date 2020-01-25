import Async from './async'
import * as R from 'ramda'

const noop = () => {}

describe('Async Monad', () => {
  describe('Async.of', () => {
    it('returns a forkable Async', () => {
      expect.assertions(1)
      Async.of(2)
        .forkAsync(noop, val => {
          expect(val).toBe(2)
        })
    })
  })

  describe('Async.forkAsync', () => {
    it('evaluates the computation with Async', () => {
      expect.assertions(1)
      Async.of(2)
        .forkAsync(noop, val => {
          expect(val).toBe(2)
        })
    })

    console.log('it', Object.keys(it))
    it('can be called multiple times on a single Async instance', () => {
      expect.assertions(2)
      const async = Async.of(2)

      async.forkAsync(noop, val => {
        expect(val).toBe(2)
      })

      async.forkAsync(noop, val => {
        expect(val).toBe(2)
      })
    })

    it('reperforms the computation if called multiple times', async () => {
      expect.assertions(4)
      const spy = jest.fn(R.identity)

      const async = Async.of('a')
        .map(spy)
        .chain(val => Async((rej, res) => setTimeout(() => res(val), 0)))

      await async.forkPromise(noop, val => {
        expect(val).toBe('a')
        expect(spy).toHaveBeenCalledTimes(1)
      })

      await async.forkPromise(noop, val => {
        expect(val).toBe('a')
        expect(spy).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Async.prototype.map', () => {
    it('composes a computation `a -> b`', () => {
      expect.assertions(1)
      Async.of(2)
        .map(a => a * 3)
        .forkAsync(noop, val => {
          expect(val).toBe(6)
        })
    })
  })

  describe('Async.prototype.chain', () => {
    it('composes a computation `a -> mb`', () => {
      expect.assertions(1)
      Async.of(2)
        .chain(a => Async.of(a * 3))
        .forkAsync(noop, val => {
          expect(val).toBe(6)
        })
    })

    it('skips map() statements while in rejection', () => {
      expect.assertions(1)
      Async.of('a')
        .chain(() => Async.reject('b'))
        .map(a => R.concat(a, a))
        .map(a => R.concat(a, a))
        .map(a => R.concat(a, a))
        .forkAsync(err => {
          expect(err).toBe('b')
        }, () => {
          throw new Error('failed to fail')
        })
    })

    it('can recover from rejection', () => {
      expect.assertions(1)
      Async.of('a')
        .chain(() => Async.reject('b'))
        .map(a => R.concat(a, a))
        .map(a => R.concat(a, a))
        .map(a => R.concat(a, a))
        .forkAsync(err => {
          expect(err).toBe('b')
        }, () => {
          throw new Error('failed to fail')
        })
    })
  })
})
