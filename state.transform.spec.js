import Identity from './identity'
import List from './list'
import { StateT } from './state.transform'

describe('State Monad Transformer (StateTIdentity)', () => {
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
    it.skip('works', () => {
      const state = StateTIdentity.of(1)
      const output = state.evalState('BARF')
      expect(output).toEqual(1)
    })
  })

  describe('map', () => {
    it('works', () => {
      const state = StateTIdentity.of(2)
      const output = state.map(a => a * 3).evalState()
      expect(output).toEqual(6)
    })
  })

  describe('chain', () => {
    it('works with trivial chaining', () => {
      const output = StateTIdentity.of(2)
        .chain(a => StateTIdentity.of(a * 5))
        .evalState()

      expect(output).toEqual(10)
    })

    it('works with get', () => {
      const state = StateTIdentity.of(2)
      const output = state
        .chain(a =>
          StateTIdentity.get()
            .map(state => state * a))
        .evalState(5)
      expect(output).toEqual(10)
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
      expect(output).toEqual(14)
    })

    it('works with modify', () => {
      const state = StateTIdentity.of(2)
      const output = state
        .chain(a => StateTIdentity.modify(state => state * 5).map(() => a)) // replace state
        .chain(a => StateTIdentity.get().map(state => state * a))
        .evalState(3)
      expect(output).toEqual(30)
    })
  })

  describe('ap', () => {
    it('works', () => {
      const state = StateTIdentity.of(3)
      const output = state.ap(
        StateTIdentity.of(a => a * 7),
      ).evalState()
      expect(output).toEqual(21)
    })
  })

  describe('evalState', () => {
    it('returns the result of the computation', () => {
      const state = StateTIdentity.of(3)
      const output = state.evalState()
      expect(output).toEqual(3)
    })
  })

  describe('execState', () => {
    it('returns the final state of the computation', () => {
      const state = StateTIdentity.put(5)
      const output = state.execState()
      expect(output).toEqual(5)
    })
  })

  describe('runState', () => {
    it('returns both the result and the final state of the computation', () => {
      const state = StateTIdentity.of(3)
      const output = state.runState('womp')
      expect(output).toEqual({ val: 3, s: 'womp' })
    })
  })
})

describe.skip('State Monad Transformer (StateTList)', () => {
  const StateTList = StateT(List)

  StateTList.prototype.runState = function(initState) {
    const list = this.runStateT(initState)
    return list.runList()
  }
  StateTList.prototype.evalState = function(initState) {
    const list = this.evalStateT(initState)
    return list.runList()
  }
  StateTList.prototype.execState = function(initState) {
    return this.execStateT(initState)
  }

  describe('of', () => {
    it.only('works', () => {
      const state = StateTList.of([ 1 ])
      const output = state.evalState('state')
      console.log('OUTPUT', output)
      expect(output).toEqual([ 1 ])
    })
  })

  describe('map', () => {
    it('works', () => {
      const state = StateTList.of([ 2 ])
      const output = state.map(a => a * 3).evalState('state')
      expect(output).toEqual([ 6 ])
    })
  })

  describe('chain', () => {
    it('works with trivial chaining', () => {
      const output = StateTList.of(2)
        .chain(a => StateTList.of(a * 5))
        .evalState()

      expect(output).toEqual(10)
    })

    it('works with get', () => {
      const state = StateTList.of(2)
      const output = state
        .chain(a =>
          StateTList.get()
            .map(state => state * a))
        .evalState(5)
      expect(output).toEqual(10)
    })

    it('works with put', () => {
      const output =
        StateTList.of(2)
          .chain(a => // replace state
            StateTList.put(7)
              .map(() => a))
          .chain(a =>
            StateTList.get()
              .map(state => state * a))
          .evalState(5)

      console.log('output._fn()', output._fn)
      // console.log('output', output.toString())
      expect(output).toEqual(14)
    })

    it('works with modify', () => {
      const state = StateTList.of(2)
      const output = state
        .chain(a => StateTList.modify(state => state * 5).map(() => a)) // replace state
        .chain(a => StateTList.get().map(state => state * a))
        .evalState(3)
      expect(output).toEqual(30)
    })
  })

  describe('ap', () => {
    it('works', () => {
      const state = StateTList.of(3)
      const output = state.ap(
        StateTList.of(a => a * 7),
      ).evalState()
      expect(output).toEqual(21)
    })
  })

  describe('evalState', () => {
    it('returns the result of the computation', () => {
      const state = StateTList.of(3)
      const output = state.evalState()
      expect(output).toEqual(3)
    })
  })

  describe('execState', () => {
    it('returns the final state of the computation', () => {
      const state = StateTList.put(5)
      const output = state.execState()
      expect(output).toEqual(5)
    })
  })

  describe('runState', () => {
    it('returns both the result and the final state of the computation', () => {
      const state = StateTList.of(3)
      const output = state.runState('womp')
      expect(output).toEqual([ [ 3 ], 'womp' ])
    })
  })
})
