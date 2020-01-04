import Daggy from 'daggy'
import { always, compose, curry } from 'ramda'


// ----------------------------------------------------------------- //
// Standalone
// ----------------------------------------------------------------- //
const Either = Daggy.taggedSum('Either', {
  Left: [ '_fn' ],
  Right: [ '_fn' ],
})
const { Left, Right } = Either

Either.of = val => Right(() => val)
Left.of = val => Left(() => val)
Right.of = val => Right(() => val)

Either.prototype.either = curry(function(leftFn, rightFn) {
  return this.cata({
    Left: left => left.map(leftFn).runEither(),
    Right: right => right.map(rightFn).runEither(),
  })
})

Either.prototype.runEither = function() { return this._fn() }
Either.prototype.ap = function(either) { return either.chain(fn => this.map(fn)) }
Either.prototype.map = function (fn) {
  return this.cata({
    Left: _fn => Left(_fn),
    Right: _fn => Right(compose(fn, _fn)),
  })
}
Either.prototype.chain = function(fn) {
  return this.cata({
    Left: _fn => Left(_fn),
    Right: _fn => fn(this._fn()),
  })
}

// ----------------------------------------------------------------- //
// Transformer
// ----------------------------------------------------------------- //
const EitherT = Monad => {
  const EitherTMonad = Daggy.tagged(`EitherT${Monad}`, [ '_fn' ])
  EitherTMonad.of = val => EitherTMonad(() => compose(Monad.of, Right.of)(val))
  EitherTMonad.Left = { of:  val => EitherTMonad(() => compose(Monad.of, Left.of)(val)) }
  EitherTMonad.Right = { of: val => EitherTMonad.of(val) }

  EitherTMonad.prototype.map = function(fn) {
    const m = this._fn()
    return EitherTMonad(() => {
      return m.map(inner => {
        const either = inner.cata({
          Left: always(inner),
          Right: _fn => Right(() => fn(_fn())),
        })
        return either
      })
    })
  }
  EitherTMonad.prototype.chain = function(fn) {
    const m = this._fn()
    return EitherTMonad(() => {
      return m.chain(inner => {
        return inner.cata({ // Either
          Left: always(inner), // TODO:
          Right: _fn => fn(_fn())._fn(), // Returns an M(Either)
        })
      })
    })
  }
  EitherTMonad.prototype.ap = function(eitherTM) {
    return eitherTM.chain(fn => this.map(fn))
  }
  EitherTMonad.prototype.runEither = function() {
    const m = this._fn()
    return m.map(either => either.runEither())
  }

  return EitherTMonad
}




// ----------------------------------------------------------------- //
// Default and PointFree Exports
// ----------------------------------------------------------------- //
module.exports = Either
module.exports.EitherT = EitherT
module.exports.runReader = reader => reader.runReader()
module.exports.fromLeft = curry((defaultVal, either) => either.cata({
  Left: left => left.runEither(),
  Right: always(defaultVal),
}))
module.exports.fromRight = curry((defaultVal, either) => either.cata({
  Left: always(defaultVal),
  Right: right => right.runEither(),
}))
