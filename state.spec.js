import Identity from './identity'
import State, { StateT } from './state'
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

describe.only('State Monad Transformer (StateTIdentity', () => {
  // NOTE: `execState(s)` and `evalState(s)` derive from `runState(s)`,
  // so we only need to update `runState(s)`
  const StateTIdentity = StateT(Identity)

  StateTIdentity.prototype.runState = function(initState) {
    const identity = this.runStateT(initState)
    return identity.valueOf()
  }
  StateTIdentity.prototype.evalState = function(initState) {
    const identity = this.evalStateT(initState)
    return identity.valueOf()
  }
  StateTIdentity.prototype.execState = function(initState) {
    const identity = this.execStateT(initState)
    return identity.valueOf()
  }


  describe('of', () => {
    it('works', () => {
      const state = StateTIdentity.of(1)
      const output = state.evalState('BARF')
      expect(output).toBe(1)
    })
  })

  describe('map', () => {
    it('works', () => {
      const state = StateTIdentity.of(2)
      const output = state.map(multiply(3)).evalState()
      expect(output).toBe(6)
    })
  })

  describe.only('chain', () => {
    it('works with trivial chaining', () => {
      const output = StateTIdentity.of(2)
        .chain(a => StateTIdentity.of(a * 5))
        .evalState()

      expect(output).toBe(10)
    })

    it('works with get', () => {
      const state = StateTIdentity.of(2)
      const output = state
        .chain(a =>
          StateTIdentity.get()
            .map(state => state * a))
        .evalState(5)
      expect(output).toBe(10)
    })

    it('works with put', () => {
      const output =
        StateTIdentity.of(2)
          .chain(a => // replace state
            StateTIdentity.put(7)
              .map(() => a))
          .chain(a =>
            StateTIdentity.get()
              .map(state => state * a))
          .evalState(5)

      console.log('output._fn()', output._fn)
      // console.log('output', output.toString())
      expect(output).toBe(14)
    })

    it('works with modify', () => {
      const state = StateTIdentity.of(2)
      const output = state
        .chain(a => StateTIdentity.modify(state => state * 5).map(() => a)) // replace state
        .chain(a => StateTIdentity.get().map(state => state * a))
        .evalState(3)
      expect(output).toBe(30)
    })
  })

  describe('ap', () => {
    it('works', () => {
      const state = StateTIdentity.of(3)
      const output = state.ap(
        StateTIdentity.of(multiply(7)),
      ).evalState()
      expect(output).toBe(21)
    })
  })

  describe('evalState', () => {
    it('returns the result of the computation', () => {
      const state = StateTIdentity.of(3)
      const output = state.evalState()
      expect(output).toBe(3)
    })
  })

  describe('execState', () => {
    it('returns the final state of the computation', () => {
      const state = StateTIdentity.put(5)
      const output = state.execState()
      expect(output).toBe(5)
    })
  })

  describe('runState', () => {
    it('returns both the result and the final state of the computation', () => {
      const state = StateTIdentity.of(3)
      const output = state.runState('womp')
      expect(output).toEqual([ 3, 'womp' ])
    })
  })
})
