import { ReaderT } from './reader'
import Either from './either'
import { curry } from 'ramda'

const ReaderTEither = ReaderT(Either)
ReaderTEither.Left = { of: val => ReaderTEither(_env => Either.Left.of(val)) }
ReaderTEither.Right = { of: val => ReaderTEither(_env => Either.Right.of(val)) }
ReaderTEither.fromLeft = curry((defaultValue, env, rte) => {
  const either = rte.runReaderT(env)
  return Either.fromLeft(defaultValue, either)
})
ReaderTEither.fromRight = curry((defaultValue, env, rte) => {
  const either = rte.runReaderT(env)
  return Either.fromRight(defaultValue, either)
})
ReaderTEither.either = curry((leftFn, rightFn, env, rte) => {
  const either = rte.runReaderT(env)
  return either.either(leftFn, rightFn)
})
ReaderTEither.prototype.runReaderTEither = function(env) {
  const either = this.runReaderT(env)
  return either.runEither()
}

module.exports = ReaderTEither
