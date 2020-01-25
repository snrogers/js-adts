import Daggy from 'daggy'
import { Left, Right } from './either'
import { always, compose, curry } from 'ramda'

// ----------------------------------------------------------------- //
// Transformer
// ----------------------------------------------------------------- //
const EitherT = Monad => {
  const EitherT = Daggy.tagged(`EitherT${Monad}`, [ '_fn' ])
  EitherT.of = val => EitherT(() => compose(Monad.of, Right.of)(val))
  EitherT.Left = { of:  val => EitherT(() => compose(Monad.of, Left.of)(val)) }
  EitherT.Right = { of: val => EitherT.of(val) }

  EitherT.fromLeftT = curry((defaultVal, eitherT) => {
    const m = eitherT._fn()
    return m.map(either => either.cata({
      Left: _fn => _fn(),
      Right: always(defaultVal),
    }))
  })
  EitherT.fromRightT = curry((defaultVal, eitherT) => {
    const m = eitherT._fn()
    return m.map(either => either.cata({
      Left: always(defaultVal),
      Right: _fn => _fn(),
    }))
  })

  EitherT.prototype.map = function(fn) {
    const m = this._fn()
    return EitherT(() => {
      return m.map(either => either.cata({
        Left: always(either),
        Right: _fn => Right(compose(fn, _fn)),
      }))
    })
  }
  EitherT.prototype.chain = function(fn) {
    const m = this._fn()
    return EitherT(() => {
      return m.chain(inner => {
        return inner.cata({ // Either
          Left: _fn => Monad.of(Left(_fn)),
          Right: _fn => {
            const eitherT = fn(_fn())
            const m = eitherT._fn()
            return m
          },
        })
      })
    })
  }
  EitherT.prototype.ap = function(eitherTM) {
    return eitherTM.chain(fn => this.map(fn))
  }

  EitherT.prototype.eitherT = curry(function(leftFn, rightFn) {
    const m = this._fn()
    return m.map(either => either.cata({
      Left: _fn => leftFn(_fn()),
      Right: _fn => rightFn(_fn()),
    }))
  })

  EitherT.prototype.runEitherT = function() {
    const m = this._fn()
    return m.map(either => either.runEither())
  }

  return EitherT
}

module.exports = EitherT
module.exports.runEitherT = eitherT => eitherT.runEitherT()
module.exports.either = curry((leftFn, rightFn, either) => {
  return either.either(leftFn, rightFn)
})
