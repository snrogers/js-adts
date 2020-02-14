import Daggy from 'daggy'
import { always, compose } from 'ramda'
import { ap, chain, map, of } from 'fantasy-land'


// ----------------------------------------------------------------- //
// Standalone
// ----------------------------------------------------------------- //
const Identity = Daggy.tagged('Identity', [ '_fn' ])
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
const IdentityT = Monad => {
  const IdentityT = Daggy.tagged(`IdentityT${Monad}`, [ '_fn' ])
  IdentityT.of = value => IdentityT(() => Monad.of(value))
  IdentityT.lift = m => IdentityT(always(m))

  IdentityT.prototype.map = function(fn) {
    return IdentityT(() => {
      const m = this.valueOfT()
      return m.map(a => fn(a))
    })
  }
  IdentityT.prototype.chain = function(fn) {
    return IdentityT(() => {
      const m = this.valueOfT()
      return m.chain(a => {
        const itm = fn(a)
        return itm.valueOfT()
      })
    })
  }
  IdentityT.prototype.ap = function(itmWithFn) {
    return itmWithFn.chain(fn => this.map(fn))
  }

  IdentityT.prototype.valueOfT = function() { return this._fn() }

  IdentityT.prototype['fantasy-land/ap'] = IdentityT.prototype.ap
  IdentityT.prototype['fantasy-land/chain'] = IdentityT.prototype.chain
  IdentityT.prototype['fantasy-land/map'] = IdentityT.prototype.map

  return IdentityT
}


// ----------------------------------------------------------------- //
// Default and PointFree Exports
// ----------------------------------------------------------------- //
module.exports = Identity
module.exports.IdentityT = IdentityT
