import Daggy from 'daggy'
import { ap, chain, map, of } from 'fantasy-land'
import R, { compose, curry } from 'ramda'


// TODO: Safety checks on functions/methods


// ----------------------------------------------------------------- //
// Helpers
// ----------------------------------------------------------------- //
const isFunction = R.compose(R.equals('Function'), R.type)


// ----------------------------------------------------------------- //
// Constructors
// ----------------------------------------------------------------- //
const Async = Daggy.tagged('Async', [ '_fn' ])
Async.defer = fn => Async(fn)
Async.settle = val => Async(settle => settle(val))
Async.of = Async[of] = Async.settle


// ----------------------------------------------------------------- //
// Async Methods
// ----------------------------------------------------------------- //
Async.prototype.forkAsync = function(settle) {
  this._fn(settle)
}

Async.prototype.forkPromise = function(settle) {
  return new Promise(resolve => {
    this.forkAsync(compose(resolve, settle))
  })
}


// ----------------------------------------------------------------- //
// ADT Methods
// ----------------------------------------------------------------- //
Async.prototype.map = Async.prototype[map] = function(mapFn) {
  return Async(settle => this.forkAsync(val => (settle(mapFn(val)))))
}

Async.prototype.chain = Async.prototype[chain] = function(chainFn) {
  return Async(settle => {
    this.forkAsync(
      val => chainFn(val).forkAsync(settle))
  })
}


// ----------------------------------------------------------------- //
// Exports
// ----------------------------------------------------------------- //
module.exports = Async
module.exports.forkAsync = curry((settle, async) => {
  return async.forkAsync(settle)
})
module.exports.forkPromise = curry((settle, async) => {
  return async.forkPromise(settle)
})
