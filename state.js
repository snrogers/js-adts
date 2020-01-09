import Daggy from 'daggy'
import { always, compose, curry } from 'ramda'


// ----------------------------------------------------------------- //
// Standalone
// ----------------------------------------------------------------- //
const State = Daggy.tagged('State', [ '_fn' ])
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
  const StateTM = Daggy.tagged(`StateT${M}`, [ '_fn' ])
  StateTM.of = val => StateTM(s => M.of([ val, s ]))
  StateTM.get = () => StateTM(s => M.of([ s, s ]))
  StateTM.modify = fn => StateTM(s => M.of([ null, fn(s) ]))
  StateTM.put = s => StateTM(() => M.of([ null, s ]))

  StateTM.prototype.ap = function(stmWithFn) {
    return stmWithFn.chain(fn => this.map(fn))
  }

  StateTM.prototype.chain = function(fn) {
    return StateTM(s0 => {
      const m = this._fn(s0)

      return m.map(([ val, s1 ]) => {
        const stm = fn(val)
        const [ m, s2 ] = stm.runState(s1)
        return [ m,s2 ]
      })
    })
  }

  StateTM.prototype.map = function(fn) {
    return StateTM(s0 => {
      const m = this._fn(s0)
      return m.map(([ val, s ]) => {
        return [ fn(val), s ]
      })
    })
  }

  StateTM.prototype.runState = function(initState) {
    const m = this._fn(initState)
    return m
  }
  StateTM.prototype.evalState = function(initState) {
    const m = this.runState(initState)
    return m.map(([ v, s ]) => v)
  }
  StateTM.prototype.execState = function(initState) {
    const m = this.runState(initState)
    return m.map(([ v, s ]) => s)
  }

  return StateTM
}

// ----------------------------------------------------------------- //
// Default and PointFree Exports
// ----------------------------------------------------------------- //
module.exports = State
module.exports.StateT = StateT
module.exports.runState = curry(
  (monad, initState) => monad.runState(initState)
)
module.exports.evalState = curry(
  (monad, initState) => monad.evalState(initState)
)
module.exports.execState = curry(
  (monad, initState) => monad.execState(initState)
)
