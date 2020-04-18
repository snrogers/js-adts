import Daggy from 'daggy'
import * as R from 'ramda'
import { ap, chain, map, of } from 'fantasy-land'


// ----------------------------------------------------------------- //
// Standalone
// ----------------------------------------------------------------- //


// ----------------------------------------------------------------- //
// Constructors
// ----------------------------------------------------------------- //
const Identity = Daggy.tagged('Identity', [ '_fn' ])
Identity.of = a => Identity(() => a)


// ----------------------------------------------------------------- //
// ADT Methods
// ----------------------------------------------------------------- //
Identity.prototype.map = function(fn) {
  const val = this._fn()
  console.log('[Identity.map]: val', val.toString())
  if (R.is(Function, val))
    console.log('[Identity.map]: val (as function)', val(1).toString())
  return Identity(() => fn(val))
}
Identity.prototype.chain = function(fn) {
  const val = this._fn()
  return fn(val)
}


// ----------------------------------------------------------------- //
// Derived Methods
// ----------------------------------------------------------------- //
Identity.prototype.ap = function(identityWithFn) {
  console.log('identityWithFn', identityWithFn.toString())
  console.log('identityWithFn', identityWithFn._fn().toString())
  console.log('identityWithFn', identityWithFn.runIdentity())
  return identityWithFn.chain(fn => this.map(fn))
}


// ----------------------------------------------------------------- //
// Identity Methods
// ----------------------------------------------------------------- //
Identity.prototype.join = function() { return this._fn() }
Identity.prototype.runIdentity = function() { return this._fn() }

// Alias runIdentity
Identity.prototype.run = Identity.prototype.runIdentity
Identity.prototype.valueOf = Identity.prototype.runIdentity

// PFF
Identity.runIdentity = Identity.run = Identity.valueOf =
  idM => idM.runIdentity()


// ----------------------------------------------------------------- //
// Transformer
// ----------------------------------------------------------------- //
const IdentityT = Monad => {
  const IdentityT = Daggy.tagged(`IdentityT${Monad}`, [ '_fn' ])
  IdentityT.of = value => IdentityT(() => Monad.of(value))
  IdentityT.lift = m => IdentityT(() => m)

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
