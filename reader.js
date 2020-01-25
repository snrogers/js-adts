import Daggy from 'daggy'
import { always, curry, identity } from 'ramda'
import { of, ap, chain, map } from 'fantasy-land'
import ReaderT from './reader.transform'


// ----------------------------------------------------------------- //
// Flow Types
// ----------------------------------------------------------------- //
/*::
type env = any

type ReaderClass = {
  (env): ReaderData,
  of: any => ReaderData
}

type ReaderData = {

}
*/



// ----------------------------------------------------------------- //
// Constructors
// ----------------------------------------------------------------- //
const Reader /*:ReaderClass */ = Daggy.tagged('Reader', [ '_fn' ])

Reader.of = Reader[of] = value => Reader(_env => value)
Reader.ask = fn => Reader(env => fn ? fn(env) : env)
Reader.asks = fn => Reader(fn)


// ----------------------------------------------------------------- //
// ADT Methods
// ----------------------------------------------------------------- //
Reader.prototype.chain = Reader.prototype[chain] = function(fn) {
  return Reader(env => {
    const reader = fn(this.runReader(env))
    const value = reader.runReader(env)
    return value
  })
}
Reader.prototype.map = Reader.prototype[map] = function(fn) {
  return Reader(env => {
    const thisValue = this.runReader(env)
    const nextValue = fn(thisValue)
    return nextValue
  })
}


// ----------------------------------------------------------------- //
// Derived ADT Methods
// ----------------------------------------------------------------- //
Reader.prototype.ap = Reader.prototype[ap] = function(readerWithFn) {
  return readerWithFn.chain(fn => this.map(fn))
}


// ----------------------------------------------------------------- //
// Reader Methods
// ----------------------------------------------------------------- //
Reader.prototype.runReader = function(env) { return this._fn(env) }
// TODO: Remove local? I don't really see any use for it
// if we allow for a transform fn in Reader.ask()
Reader.prototype.local = function(transform) {
  return Reader.ask()
    .map(env => this.runReader(transform(env)))
}


// ----------------------------------------------------------------- //
// Default and Point-Free Exports
// ----------------------------------------------------------------- //
module.exports = Reader
module.exports.runReader = curry((env, reader) => reader.runReader(env))
module.exports.local = curry((transform, reader) => {
  return Reader(transform).chain(() => reader)
})
module.exports.ReaderT = ReaderT
