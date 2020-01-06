import Daggy from 'daggy'
import { always, compose, curry } from 'ramda'
import { chain, map, of } from 'fantasy-land'


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
  const MonadErrorT = Daggy.tagged(`MonadErrorT${Monad}`, [ '_fn' ])
  MonadErrorT.of = val => MonadErrorT(() => compose(Monad.of, Valid, always)(val))
  MonadErrorT.throwError = err => MonadErrorT(() => compose(Monad.of, Error, always)(err))

  MonadErrorT.prototype.fold = function(errorFn, validFn) {
    return MonadErrorT(() => {
      const m = this.runMonadError()

      return m.chain(merr => {
        return Monad.of(
          merr.cata({
            Error: errorFn,
            Valid: validFn,
          })
        )
      })
    })
  }

  MonadErrorT.prototype.map = function(fn) {
    return MonadErrorT(() => {
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
  MonadErrorT.prototype.chain = MonadErrorT.prototype[chain] = function(chainFn) {
    return MonadErrorT(() => {
      const m = this.runMonadError()
      console.log('m', m.toString())

      return m.chain(mErr => {
        const nextInner = mErr.fold(
          () => Monad.of(Error.of(mErr.runMonadError())),
          () => Monad.of(Valid.of(chainFn(mErr.runMonadError)))
        )
      })
    })
  }

  MonadErrorT.prototype.oldChain = function(fn) {
    return MonadErrorT(() => {
      const m = this._fn() // TODO: try const m = this.runMonadError()
      // console.log('AAA m', m.toString())

      return m.chain(inner => {
        // console.log('AAA inner', inner.toString())
        const nextInner = inner.cata({ // MonadError
          Error: always(inner),
          Valid: _fn => fn(_fn())._fn(), // TODO: Look into how FL phrases this w/ `fold()`
        })
        // console.log('AAA nextInner', nextInner.toString())
        return nextInner
      })
    })
  }
  MonadErrorT.prototype.ap = function(monadErrorTM) {
    return monadErrorTM.chain(fn => this.map(fn))
  }

  MonadErrorT.prototype.runMonadError = function() {
    const m = this._fn()
    return m.map(monadError => monadError.runMonadError())
  }

  MonadErrorT.prototype.catchError = function(errorHandler) {
    return MonadErrorT(() => {
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

  return MonadErrorT
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
