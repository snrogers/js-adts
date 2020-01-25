import Daggy from 'daggy'
import { always, compose, curry } from 'ramda'
import { ap, chain, map } from 'fantasy-land'


// /*::
// type StateClass = {
//   (any => any): StateData,
//   of: any => StateData,
//   get: () => StateData
// }
//
// type StateData = {
//
// }
// */

// ----------------------------------------------------------------- //
// Standalone
// ----------------------------------------------------------------- //
const State /*: StateClass */ = Daggy.tagged('State', [ '_fn' ])
State.of = val => State(state => [ val, state ])
State.get = () => State(state => [ state, state ])
State.modify = fn => State(state => [ null, fn(state) ])
State.put = state => State.modify(always(state))

State.prototype.chain = function(fn) {
  return State(s => {
    const [ val, state ] = this.runState(s)
    return fn(val).runState(state)
  })
}
State.prototype.runState = function(initialState) {
  return this._fn(initialState)
}
State.prototype.evalState = function(initialState) {
  const [ val, _state ] = this.runState(initialState)
  return val
}
State.prototype.execState = function(initialState) {
  const [ _val, state ] = this.runState(initialState)
  return state
}

// Derived
State.prototype.map = function(fn) {
  return this.chain(val => State.of(fn(val)))
}
State.prototype.ap = function(stateWithFn) {
  return stateWithFn.chain(fn => this.map(fn))
}

// ----------------------------------------------------------------- //
// Transformer
// ----------------------------------------------------------------- //
const StateT = M => {
  const StateT = Daggy.tagged(`StateT${M}`, [ '_fn' ])
  StateT.of = val => StateT(s => M.of([ val, s ]))
  StateT.lift = m => StateT(s => m.map(val => [ val, s ]))

  StateT.get = () => StateT(s => M.of([ s, s ]))
  StateT.modify = fn => StateT(s => M.of([ null, fn(s) ]))
  StateT.put = s => StateT(() => M.of([ null, s ]))

  StateT.prototype.ap = StateT.prototype[ap] = function(stmWithFn) {
    return stmWithFn.chain(fn => this.map(fn))
  }

  StateT.prototype.chain = StateT.prototype[chain] = function(fn) {
    return StateT(s0 => {
      const m = this._fn(s0)

      return m.chain(([ val, s1 ]) => {
        const stm = fn(val)
        const mNext = stm._fn(s1)
        return mNext
      })
    })
  }

  StateT.prototype.map = StateT.prototype[map] = function(fn) {
    return StateT(s0 => {
      const m = this._fn(s0)
      return m.map(([ val, s ]) => {
        return [ fn(val), s ]
      })
    })
  }

  StateT.prototype.runStateT = function(initState) {
    const m = this._fn(initState)
    return m
  }
  StateT.prototype.evalStateT = function(initState) {
    const m = this._fn(initState)
    return m.map(([ v, _s ]) => v)
  }
  StateT.prototype.execStateT = function(initState) {
    const m = this._fn(initState)
    return m.map(([ _v, s ]) => s)
  }

  return StateT
}

// ----------------------------------------------------------------- //
// Default and PointFree Exports
// ----------------------------------------------------------------- //
module.exports = State
module.exports.StateT = StateT
module.exports.runState = curry(
  (monad, initState) => monad.runState(initState),
)
module.exports.evalState = curry(
  (monad, initState) => monad.evalState(initState),
)
module.exports.execState = curry(
  (monad, initState) => monad.execState(initState),
)
