import InfallibleAsync from './infallible-async'
import { MonadErrorT } from './monad-error'
import R from 'ramda'

const ErrorAsync = MonadErrorT(InfallibleAsync)
ErrorAsync.prototype.runMonadError = (monadErrorRun => {
  return function(settle) {
    const infallibleAsync = monadErrorRun.call(this)
    infallibleAsync.forkAsync(val => settle(val))
  }
})(ErrorAsync.prototype.runMonadError)
ErrorAsync.prototype.forkAsync = function(settle) {

}

ErrorAsync.prototype._runInner = function(settle) {

}

ErrorAsync['@@type'] = 'ErrorAsync'


// ----------------------------------------------------------------- //
// Exports
// ----------------------------------------------------------------- //
module.exports = ErrorAsync
