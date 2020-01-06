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
ErrorAsync.prototype.forkAsync = ErrorAsync.prototype.runMonadError
// ErrorAsync.prototype.forkAsync = ((monadErrorRun, forkAsync) => {
//   return function(settle) {
//     console.log('settle', settle)
//     const infallibleAsync = monadErrorRun.call(this)
//     console.log('infallibleAsync', infallibleAsync.toString())
//     forkAsync.call(infallibleAsync)
//     return
//     infallibleAsync.forkAsync(val => settle(val))
//   }
// })(ErrorAsync.prototype.runMonadError, InfallibleAsync.prototype.forkAsync)

ErrorAsync['@@type'] = 'ErrorAsync'


// ----------------------------------------------------------------- //
// Exports
// ----------------------------------------------------------------- //
module.exports = ErrorAsync
