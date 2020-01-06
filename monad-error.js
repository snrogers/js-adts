import Daggy from 'daggy'
import { always, compose, curry } from 'ramda'


// ----------------------------------------------------------------- //
// Standalone
// ----------------------------------------------------------------- //
const MonadError = Daggy.taggedSum('MonadError', {
  Error: [ '_fn' ],
  Valid: [ '_fn' ],
})
const { Error, Valid } = MonadError

// ----------------------------------------------------------------- //
// Constructors
// ----------------------------------------------------------------- //
MonadError.of = val => Valid(() => val)
MonadError.throwError = err => Error(() => err)


// ----------------------------------------------------------------- //
// ADT Methods
// ----------------------------------------------------------------- //
MonadError.prototype.fold = function(errorFn, validFn) {
  return this.cata({
    Error: errorFn,
    Valid: validFn,
  })
}
MonadError.prototype.map = function (fn) {
  return this.cata({
    Error: always(this),
    Valid: _fn => Valid(compose(fn, _fn)),
  })
}
MonadError.prototype.chain = function(fn) {
  return this.cata({
    Error: always(this),
    Valid: _fn => fn(this._fn()),
  })
}
MonadError.prototype.ap = function(monadError) { return monadError.chain(fn => this.map(fn)) }
MonadError.prototype.catchError = function(errorHandler) {
  return this.cata({
    Error: _fn => errorHandler(_fn()),
    Valid: always(this),
  })
}
MonadError.prototype.runMonadError = function() { return this._fn() }

// ----------------------------------------------------------------- //
// Transformer
// ----------------------------------------------------------------- //
const MonadErrorT = Monad => {
  const MonadErrorTMonad = Daggy.tagged(`MonadErrorT${Monad}`, [ '_fn' ])
  MonadErrorTMonad.of = val => MonadErrorTMonad(() => compose(Monad.of, Valid, always)(val))
  MonadErrorTMonad.throwError = err => MonadErrorTMonad(() => compose(Monad.of, Error, always)(err))

  MonadErrorTMonad.prototype.fold = function(errorFn, validFn) {
    return MonadErrorTMonad(() => {
      const m = this.runMonadError()

      return m.chain(merr => {
        return Monad.of(
          merr.cata({
            Error: errorFn,
            Valid: validFn,
          }))
      })
    })
  }

  MonadErrorTMonad.prototype.map = function(fn) {
    return MonadErrorTMonad(() => {
      const m = this._fn()

      return m.map(inner => {
        const nextInner = inner.cata({
          Error: always(inner),
          Valid: _fn => Valid(() => fn(_fn())),
        })
        return nextInner
      })
    })
  }

  MonadErrorTMonad.prototype.chain = function(fn) {
    return MonadErrorTMonad(() => {
      const m = this._fn()

      return m.chain(inner => {
        const nextInner = inner.cata({ // MonadError
          Error: always(inner),
          Valid: _fn => fn(_fn())._fn(), // TODO: Look into how FL phrases this w/ `fold()`
        })
        return nextInner
      })
    })
  }
  MonadErrorTMonad.prototype.ap = function(monadErrorTM) {
    return monadErrorTM.chain(fn => this.map(fn))
  }

  MonadErrorTMonad.prototype.runMonadError = function() {
    const m = this._fn()
    return m.map(monadError => monadError.runMonadError())
  }

  MonadErrorTMonad.prototype.catchError = function(errorHandler) {
    return MonadErrorTMonad(() => {
      const m = this._fn()

      return m.map(inner => {
        const nextInner = inner.cata({ // MonadError
          Error: _fn => Valid(() => errorHandler(_fn()).runMonadError()), // TODO: Look into how FL phrases this w/ `fold()`
          Valid: always(inner),
        })
        return nextInner
      })
    })
  }

  return MonadErrorTMonad
}




// ----------------------------------------------------------------- //
// Default and PointFree Exports
// ----------------------------------------------------------------- //
module.exports = MonadError
module.exports.MonadErrorT = MonadErrorT
module.exports.runReader = reader => reader.runReader()
module.exports.catchError = curry((errorHandler, monadError) =>
  monadError.catchError(errorHandler)
)
