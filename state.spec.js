import State from './state'
import { multiply } from 'ramda'


describe('State Monad Standalone', () => {
  describe('of', () => {
    it('works', () => {
      const state = State.of(1)
      const output = state.evalState('BARF')
      expect(output).toBe(1)
    })
  })

  describe('map', () => {
    it('works', () => {
      const state = State.of(2)
      const output = state.map(multiply(3)).evalState()
      expect(output).toBe(6)
    })
  })

  describe('chain', () => {
    it('works with trivial chaining', () => {
      const state = State.of(2)
      const output = state
        .chain(a => State.of(a * 5))
        .evalState()
      expect(output).toBe(10)
    })

    State.of

    it('works with get', () => {
      const state = State.of(2)
      const output = state
        .chain(a =>
          State.get().map(state => state * a),
        ).evalState(5)
      expect(output).toBe(10)
    })

    it('works with put', () => {
      const state = State.of(2)
      const output = state
        .chain(a => {
          return State.put(7).map(() => a) // replace state
        })
        .chain(a =>
          State.get().map(state => state * a),
        ).evalState(5)
      expect(output).toBe(14)
    })

    it('works with modify', () => {
      const state = State.of(2)
      const output = state
        .chain(a => {
          return State.modify(state => state * 5)
            .map(() => a) // replace state
        })
        .chain(a =>
          State.get().map(state => state * a),
        ).evalState(3)
      expect(output).toBe(30)
    })
  })

  describe('ap', () => {
    it('works', () => {
      const state = State.of(3)
      const output = state.ap(
        State.of(multiply(7)),
      ).evalState()
      expect(output).toBe(21)
    })
  })

  describe('evalState', () => {
    it('returns the result of the computation', () => {
      const state = State.of(3)
      const output = state.evalState()
      expect(output).toBe(3)
    })
  })

  describe('execState', () => {
    it('returns the final state of the computation', () => {
      const state = State.put(5)
      const output = state.execState()
      expect(output).toBe(5)
    })
  })

  describe('runState', () => {
    it('returns both the result and the final state of the computation', () => {
      const state = State.of(3)
      const output = state.runState('womp')
      expect(output).toEqual([ 3, 'womp' ])
    })
  })
})

