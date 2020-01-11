import InfallibleAsync from './infallible-async'
import { MonadErrorT } from './monad-error'
import R from 'ramda'

const ErrorAsync = MonadErrorT(InfallibleAsync)
ErrorAsync.prototype.forkAsync = function(settle) {
  const infallibleAsync = this.runMonadErrorT()
  infallibleAsync.forkAsync(val => settle(val))
}

ErrorAsync['@@type'] = 'ErrorAsync'


// ----------------------------------------------------------------- //
// Exports
// ----------------------------------------------------------------- //
module.exports = ErrorAsync
