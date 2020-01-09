import Daggy from 'daggy'
import R, { always, compose, curry, ifElse } from 'ramda'


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

Either.fromLeft = curry((defaultVal, either) => either.cata({
  Left: _fn => _fn(),
  Right: always(defaultVal),
}))
Either.fromRight = curry((defaultVal, either) => either.cata({
  Left: always(defaultVal),
  Right: _fn => _fn(),
}))

Either.prototype.either = curry(function(leftFn, rightFn) {
  return this.cata({
    Left: _fn => leftFn(_fn()),
    Right: _fn => rightFn(_fn()),
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
    Right: _fn => fn(_fn()),
  })
}

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




// ----------------------------------------------------------------- //
// Default and PointFree Exports
// ----------------------------------------------------------------- //
module.exports = Either
module.exports.EitherT = EitherT
module.exports.either = curry((leftFn, rightFn, either) => {
  return either.either(leftFn, rightFn)
})
module.exports.runReader = reader => reader.runReader()
