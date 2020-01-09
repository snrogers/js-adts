import Daggy from 'daggy'
import { of } from 'fantasy-land'
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
Async.reject = val => Async((reject, _resolve) => reject(val))
Async.resolve = val => Async((_reject, resolve) => resolve(val))
Async.of = Async[of] = Async.resolve


// ----------------------------------------------------------------- //
// Async Methods
// ----------------------------------------------------------------- //
Async.prototype.forkAsync = function(reject, resolve, _cleanup) {
  const unsafePerformIO = this._unsafePerformIO

  unsafePerformIO(
    val => reject(val),
    val => resolve(val)
  )
}


// ----------------------------------------------------------------- //
// ADT Methods
// ----------------------------------------------------------------- //
Async.prototype.map = function(mapFn) {
  return Async((reject, resolve) => this.forkAsync(reject, compose(resolve, mapFn)))
}

Async.prototype.chain = function(chainFn) {
  return Async((reject, resolve) => {
    this.forkAsync(reject, val => {
      const m = chainFn(val)
      m.forkAsync(reject, resolve)
    })
  })
}


// ----------------------------------------------------------------- //
// Exports
// ----------------------------------------------------------------- //
module.exports = Async
