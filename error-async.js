import InfallibleAsync from './infallible-async'
import { MonadErrorT } from './monad-error'
import R from 'ramda'

const ErrorAsync = MonadErrorT(InfallibleAsync)
ErrorAsync.prototype.runMonadError = (monadErrorRun => {
  return function(settle) {
    const infallibleAsync = monadErrorRun.call(this)
    console.log('infallibleAsync', infallibleAsync.toString())
    console.log('infallibleAsync keys', R.keys(infallibleAsync.__proto__))
    infallibleAsync.forkAsync(val => settle(val))
  }
})(ErrorAsync.prototype.runMonadError)
ErrorAsync.prototype.forkAsync = ErrorAsync.prototype.runMonadError

ErrorAsync['@@type'] = 'ErrorAsync'


// ----------------------------------------------------------------- //
// Exports
// ----------------------------------------------------------------- //
module.exports = ErrorAsync
