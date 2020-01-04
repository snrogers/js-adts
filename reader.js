import Daggy from 'daggy'
import { always, curry, identity } from 'ramda'


// ----------------------------------------------------------------- //
// Standalone
// ----------------------------------------------------------------- //
const Reader = Daggy.tagged('Reader', [ '_fn' ])
Reader.of = value => Reader(env => value)
Reader.ask = () => Reader(env => env)
Reader.runReader = curry((env, reader) => reader.runReader(env))
Reader.prototype.ap = function(readerWithFn) {
  return readerWithFn.chain(fn => this.map(fn))
}
Reader.prototype.chain = function(fn) {
  return Reader(env => fn(this._fn(env))._fn(env))
}
Reader.prototype.map = function(fn) {
  return Reader(env => fn(this._fn(env)))
}
Reader.prototype.runReader = function(env) { return this._fn(env) }

Reader.prototype['fantasy-land/ap'] = Reader.prototype.ap
Reader.prototype['fantasy-land/chain'] = Reader.prototype.chain
Reader.prototype['fantasy-land/map'] = Reader.prototype.map


// ----------------------------------------------------------------- //
// Transformer
// ----------------------------------------------------------------- //
const ReaderT = Monad => {
  const ReaderTMonad = Daggy.tagged(`ReaderT${Monad}}`, [ '_fn' ])
  ReaderTMonad.lift = m => ReaderTMonad(always(m))
  ReaderTMonad.of = a => ReaderTMonad(env => Monad.of(a))
  ReaderTMonad.ask = () => ReaderTMonad(env => Monad.of(env))
  ReaderTMonad.prototype.ap = function(readerTWithFn) {
    return readerTWithFn.chain(fn => this.map(fn))
  }
  ReaderTMonad.prototype.chain = function(fn) {
    return ReaderTMonad(env => {
      const m = this._fn(env)
      return m.chain(a => {
        const rtm = fn(a)
        return rtm.runReader(env)
      })
    })
  }
  ReaderTMonad.prototype.map = function(fn) {
    return ReaderTMonad(env => {
      const m = this._fn(env)
      return m.map(
        a => fn(a)
      )
    })
  }
  ReaderTMonad.prototype.runReader = function(env) { return this._fn(env) }
  // ReaderTMonad.prototype.valueOf = function() { return this }

  ReaderTMonad.prototype['fantasy-land/ap'] = ReaderTMonad.prototype.ap
  ReaderTMonad.prototype['fantasy-land/chain'] = ReaderTMonad.prototype.chain
  ReaderTMonad.prototype['fantasy-land/map'] = ReaderTMonad.prototype.map

  return ReaderTMonad
}


// ----------------------------------------------------------------- //
// Default and PointFree Exports
// ----------------------------------------------------------------- //
module.exports = Reader
module.exports.ReaderT = ReaderT
module.exports.runReader = curry(
  (env, reader) => reader.runReader(env)
)
