import Async from './async'
import R from 'ramda'

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

    it.skip('[FAILS] returns cached values if called multiple times, rather than re-performing the computation', () => {
      expect.assertions(4)
      const spy = jest.fn(R.identity)

      const async = Async.of(2).map(spy)

      async.forkAsync(noop, val => {
        console.log('FART')
        expect(val).toBe(2)
        expect(spy).toHaveBeenCalledTimes(1)
      })

      async.forkAsync(noop, val => {
        console.log('FART')
        expect(val).toBe(2)
        expect(spy).toHaveBeenCalledTimes(1)
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
    it('composes a computation `a -> b`', () => {
      expect.assertions(1)
      Async.of(2)
        .chain(a => Async.of(a * 3))
        .forkAsync(noop, val => {
          expect(val).toBe(6)
        })
    })
  })
})
