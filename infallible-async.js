import Daggy from 'daggy'
import { ap, chain, map, of } from 'fantasy-land'
import R, { compose, curry } from 'ramda'


// TODO: Safety checks on functions/methods


// ----------------------------------------------------------------- //
// Helpers
// ----------------------------------------------------------------- //
const isFunction = R.compose(R.equals('Function'), R.type)

// ----------------------------------------------------------------- //
// Async Monad
// ----------------------------------------------------------------- //
const Async = Daggy.tagged('Async', [ '_unsafePerformIO' ])

// ----------------------------------------------------------------- //
// Constructors
// ----------------------------------------------------------------- //
Async.defer = fn => Async(fn)
Async.settle = val => Async(settle => settle(val))
Async.of = Async[of] = Async.settle


// ----------------------------------------------------------------- //
// Async Methods
// ----------------------------------------------------------------- //
Async.prototype.forkAsync = function(settle, _cleanup) {
  const unsafePerformIO = this._unsafePerformIO
  unsafePerformIO(val => settle(val))
}


// ----------------------------------------------------------------- //
// ADT Methods
// ----------------------------------------------------------------- //
Async.prototype.map = Async.prototype[map] = function(mapFn) {
  return Async(settle => this.forkAsync(compose(settle, mapFn)))
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
