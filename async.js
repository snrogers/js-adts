import Daggy from 'daggy'
import { of } from 'fantasy-land'
import * as R from 'ramda'
import { compose, curry } from 'ramda'


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
Async.prototype.forkAsync = function(reject, resolve) {
  const unsafePerformIO = this._unsafePerformIO

  // Necessary mutable state for preventing repeat reject/resolve
  let hasBeenCalled = false
  const preventMultipleCalls = fn => val => {
    if (hasBeenCalled) throw new Error('[Async]: Attempted to reject/resolve twice')

    hasBeenCalled = true
    return fn(val)
  }

  unsafePerformIO(
    compose(preventMultipleCalls, reject),
    compose(preventMultipleCalls, resolve)
  )
}

Async.prototype.forkPromise = function(reject, resolve) {
  const unsafePerformIO = this._unsafePerformIO

  // Necessary mutable state for preventing repeat reject/resolve
  let hasBeenCalled = false
  const preventMultipleCalls = fn => val => {
    if (!hasBeenCalled) {
      hasBeenCalled = true
      return fn(val)
    }
    throw new Error('[Async]: Attempted to resolve/reject multiple times')
  }

  return new Promise((resolveP, rejectP) => {
    unsafePerformIO(
      compose(rejectP, preventMultipleCalls, reject),
      compose(resolveP, preventMultipleCalls, resolve)
    )
  })
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
