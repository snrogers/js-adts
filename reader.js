import Daggy from 'daggy'
import { always, curry, identity } from 'ramda'
import { ap, chain, map } from 'fantasy-land'



// ----------------------------------------------------------------- //
// Standalone
// ----------------------------------------------------------------- //
const Reader = Daggy.tagged('Reader', [ '_fn' ])
Reader.of = value => Reader(_env => value)
Reader.ask = () => Reader(env => env)
Reader.runReader = curry((env, reader) => reader.runReader(env))

Reader.prototype.ap = Reader.prototype[ap] = function(readerWithFn) {
  return readerWithFn.chain(fn => this.map(fn))
}
Reader.prototype.chain = Reader.prototype[chain] = function(fn) {
  return Reader(env => fn(this._fn(env))._fn(env))
}
Reader.prototype.map = Reader.prototype[map] = function(fn) {
  return Reader(env => fn(this._fn(env)))
}
Reader.prototype.runReader = function(env) { return this._fn(env) }

Reader.prototype['fantasy-land/ap'] = Reader.prototype.ap
Reader.prototype['fantasy-land/chain'] = Reader.prototype.chain
Reader.prototype['fantasy-land/map'] = Reader.prototype.map


// ----------------------------------------------------------------- //
// Transformer
// ----------------------------------------------------------------- //
const ReaderT = M => {
  const ReaderT = Daggy.tagged(`ReaderT${M}}`, [ '_fn' ])

  ReaderT.lift = m => ReaderT(always(m))

  ReaderT.of = a => ReaderT(_env => M.of(a))
  ReaderT.ask = () => ReaderT(env => M.of(env))

  ReaderT.prototype.map = ReaderT.prototype[map] = function(fn) {
    return ReaderT(env => {
      const m = this._fn(env)
      return m.map(fn)
    })
  }
  ReaderT.prototype.chain = ReaderT.prototype[chain] = function(fn) {
    return ReaderT(env => {
      const m = this._fn(env)

      return m.chain(a => {
        const rtm = fn(a)
        const m = rtm._fn(env)
        return m
      })
    })
  }

  ReaderT.prototype.ap = ReaderT.prototype[ap] = function(readerTWithFn) {
    return readerTWithFn.chain(fn => this.map(fn))
  }

  ReaderT.prototype.runReaderT = function(env) { return this._fn(env) }

  return ReaderT
}


// ----------------------------------------------------------------- //
// Default and PointFree Exports
// ----------------------------------------------------------------- //
module.exports = Reader
module.exports.ReaderT = ReaderT
module.exports.runReaderT = curry(
  (env, reader) => reader.runReaderT(env),
)
