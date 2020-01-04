import Daggy from 'daggy'
import { always, compose } from 'ramda'


// ----------------------------------------------------------------- //
// Standalone
// ----------------------------------------------------------------- //
export const Identity = Daggy.tagged('Identity', [ '_fn' ])
Identity.of = a => Identity(always(a))
Identity.prototype.ap = function(identityWithFn) {
  return identityWithFn.chain(fn => this.map(fn))
}
Identity.prototype.join = function() { return this._fn() }
Identity.prototype.map = function(fn) {
  return compose(Identity.of, fn)(this._fn())
}
Identity.prototype.chain = function(fn) {
  return fn(this._fn())
}
Identity.prototype.valueOf = function() { return this._fn() }


// ----------------------------------------------------------------- //
// Transformer
// ----------------------------------------------------------------- //
export const IdentityT = Monad => {
  const IdentityTMonad = Daggy.tagged(`IdentityT${Monad}`, [ '_fn' ])
  IdentityTMonad.of = value => IdentityTMonad(() => Monad.of(value))
  IdentityTMonad.lift = m => IdentityTMonad(always(m))
  IdentityTMonad.prototype.ap = function(itmWithFn) {
    return itmWithFn.chain(fn => this.map(fn))
  }
  IdentityTMonad.prototype.chain = function(fn) {
    return IdentityTMonad(() => {
      const m = this._fn()
      return m.chain(a => {
        const itm = fn(a)
        return itm.valueOf()
      })
    })
  }
  IdentityTMonad.prototype.map = function(fn) {
    const m = this._fn()
    return IdentityTMonad.of(m.chain(
      a => fn(a).valueOf()
    ))
  }
  IdentityTMonad.prototype.valueOf = function() { return this._fn() }

  IdentityTMonad.prototype['fantasy-land/ap'] =IdentityTMonad.prototype.ap
  IdentityTMonad.prototype['fantasy-land/chain'] = IdentityTMonad.prototype.chain
  IdentityTMonad.prototype['fantasy-land/map'] = IdentityTMonad.prototype.map

  return IdentityTMonad
}


// ----------------------------------------------------------------- //
// Default and PointFree Exports
// ----------------------------------------------------------------- //
export default Identity
