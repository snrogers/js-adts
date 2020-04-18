import Daggy from 'daggy'
import { always, compose } from 'ramda'
import { ap, chain, map, of } from 'fantasy-land'

// ----------------------------------------------------------------- //
// Helper Functions
// ----------------------------------------------------------------- //


const IdentityT = Monad => {
  // ----------------------------------------------------------------- //
  // Constructors
  // ----------------------------------------------------------------- //
  const IdentityT = Daggy.tagged(`IdentityT${Monad}`, [ '_fn' ])
  IdentityT.of = value => IdentityT(() => Monad.of(value))
  IdentityT.lift = m => IdentityT(always(m))


  // ----------------------------------------------------------------- //
  // ADT Methods
  // ----------------------------------------------------------------- //
  IdentityT.prototype.map = IdentityT.prototype[map] = function(fn) {
    return IdentityT(() => {
      const m = this.valueOfT()
      return m.map(a => fn(a))
    })
  }
  IdentityT.prototype.chain = IdentityT.prototype[chain] = function(fn) {
    return IdentityT(() => {
      const m = this.valueOfT()
      return m.chain(a => {
        const itm = fn(a)
        return itm.valueOfT()
      })
    })
  }


  // ----------------------------------------------------------------- //
  // Derived ADT Methods
  // ----------------------------------------------------------------- //
  IdentityT.prototype.ap = IdentityT.prototype[ap] = function(itmWithFn) {
    return itmWithFn.chain(fn => this.map(fn))
  }


  // ----------------------------------------------------------------- //
  // IdentityMethods
  // ----------------------------------------------------------------- //
  IdentityT.prototype.runIdentityT = function() { return this._fn() }

  // alias runIdentityT TODO: Remove this. Since it's only used when
  // applying transformers anyway, there's no excuse to not force
  // the `run_____T` convention
  IdentityT.prototype.valueOfT = IdentityT.prototype.runIdentityT

  return IdentityT


  // ----------------------------------------------------------------- //
  // Helper Functions
  // ----------------------------------------------------------------- //
  IdentityT.runIdentityT = runStateT
  StateT.evalStateT = evalStateT
  StateT.execStateT = execStateT
}


// ----------------------------------------------------------------- //
// Default and PointFree Exports
// ----------------------------------------------------------------- //
export default IdentityT
