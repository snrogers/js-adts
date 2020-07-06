import Daggy from 'daggy'
import { Left, Right } from './either'
import { always, compose, curry } from 'ramda'


// ----------------------------------------------------------------- //
// Helper Functions
// ----------------------------------------------------------------- //
export const either = curry((leftFn, rightFn, eitherT) => {
  return eitherT.either(leftFn, rightFn)
})
export const fromLeftT = curry((defaultVal, eitherT) => {
  const m = eitherT._fn()
  return m.map(either => either.cata({
    Left: _fn => _fn(),
    Right: always(defaultVal),
  }))
})
export const fromRightT = curry((defaultVal, eitherT) => {
  const m = eitherT._fn()
  return m.map(either => either.cata({
    Left: always(defaultVal),
    Right: _fn => _fn(),
  }))
})
export const runEitherT = eitherT => eitherT.runEitherT()


// ----------------------------------------------------------------- //
// Transformer
// ----------------------------------------------------------------- //
export const EitherT = Monad => {
  // ----------------------------------------------------------------- //
  // Constructors
  // ----------------------------------------------------------------- //
  const EitherT = Daggy.tagged(`EitherT${Monad}`, [ '_fn' ])
  EitherT.of = val => EitherT(() => compose(Monad.of, Right.of)(val))
  EitherT.Left = { of:  val => EitherT(() => compose(Monad.of, Left.of)(val)) }
  EitherT.Right = { of: val => EitherT.of(val) }


  // ----------------------------------------------------------------- //
  // ADT Methods
  // ----------------------------------------------------------------- //
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


  // ----------------------------------------------------------------- //
  // Derived ADT Methods
  // ----------------------------------------------------------------- //
  EitherT.prototype.ap = function(eitherTM) {
    return eitherTM.chain(fn => this.map(fn))
  }


  // ----------------------------------------------------------------- //
  // Either Methods
  // ----------------------------------------------------------------- //
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


  // ----------------------------------------------------------------- //
  // Helper Functions
  // ----------------------------------------------------------------- //
  EitherT.either = either
  EitherT.fromLeftT = fromLeftT
  EitherT.fromRightT = fromRightT
  EitherT.runEitherT = runEitherT


  return EitherT
}


export default EitherT
