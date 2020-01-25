import Daggy from 'daggy'
import { always, curry } from 'ramda'
import { of, ap, chain, map } from 'fantasy-land'

// ----------------------------------------------------------------- //
// Transformer
// ----------------------------------------------------------------- //
const ReaderT = M => {
  const ReaderT = Daggy.tagged(`ReaderT${M}}`, [ '_fn' ])

  ReaderT.of = ReaderT[of] = a => ReaderT(_env => M.of(a))

  ReaderT.lift = m => ReaderT(always(m))

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

module.exports = ReaderT
module.exports.ReaderT = curry(
  (env, reader) => reader.runReaderT(env),
)
