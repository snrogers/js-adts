import InfallibleAsync from './infallible-async'
import MonadError, { MonadErrorT } from './monad-error'
import * as R from 'ramda'
import { compose } from 'ramda'

const ErrorAsync = MonadErrorT(InfallibleAsync)
ErrorAsync.defer = fn => {
  return ErrorAsync(() => {
    return InfallibleAsync(settle => {
      const settleAsMonadError = val => { settle(MonadError.of(val)) }
      fn(settleAsMonadError)
    })
  })
}
ErrorAsync.prototype.forkAsync = function(settle) {
  const infallibleAsync = this.runMonadErrorT()
  infallibleAsync.forkAsync(settle)
}

ErrorAsync.prototype.forkPromise = function(settle) {
  const infallibleAsync = this.runMonadErrorT()
  return infallibleAsync.forkPromise(settle)
}

ErrorAsync['@@type'] = 'ErrorAsync'


// ----------------------------------------------------------------- //
// Exports
// ----------------------------------------------------------------- //
module.exports = ErrorAsync
