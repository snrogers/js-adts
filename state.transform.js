import Daggy from 'daggy'
import { compose, curry } from 'ramda'
import { ap, chain, map, of } from 'fantasy-land'


// ----------------------------------------------------------------- //
// Helper Functions
// ----------------------------------------------------------------- //
export const runStateT = curry(
  (monad, initState) => monad.runStateT(initState),
)
export const evalStateT = curry(
  (monad, initState) => monad.evalStateT(initState),
)
export const execStateT = curry(
  (monad, initState) => monad.execStateT(initState),
)


export const StateT = M => {
  // ----------------------------------------------------------------- //
  // Constructors
  // ----------------------------------------------------------------- //
  const StateT = Daggy.tagged(`StateT${M}`, [ '_fn' ])
  StateT.of = StateT[of] = val => StateT(s => M.of([ val, s ]))
  StateT.lift = m => StateT(s => m.map(val => [ val, s ]))
  StateT.get = () => StateT(s => M.of([ s, s ]))
  StateT.modify = fn => StateT(s => M.of([ null, fn(s) ]))
  StateT.put = s => StateT(() => M.of([ null, s ]))


  // ----------------------------------------------------------------- //
  // ADT Methods
  // ----------------------------------------------------------------- //
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


  // ----------------------------------------------------------------- //
  // Derived ADT Methods
  // ----------------------------------------------------------------- //
  StateT.prototype.map = StateT.prototype[map] = function(fn) {
    return this.chain(compose(StateT.of, fn))
  }
  StateT.prototype.ap = StateT.prototype[ap] = function(stmWithFn) {
    return stmWithFn.chain(fn => this.map(fn))
  }


  // ----------------------------------------------------------------- //
  // State Methods
  // ----------------------------------------------------------------- //
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


  // ----------------------------------------------------------------- //
  // Helper Functions
  // ----------------------------------------------------------------- //
  StateT.runStateT = runStateT
  StateT.evalStateT = evalStateT
  StateT.execStateT = execStateT

  return StateT
}


// ----------------------------------------------------------------- //
// Default Export
// ----------------------------------------------------------------- //
export default StateT
