import Daggy from 'daggy'
import { always, compose, curry, identity } from 'ramda'
import { of, ap, chain, map } from 'fantasy-land'

// ----------------------------------------------------------------- //
// Constructors
// ----------------------------------------------------------------- //
/** Continuation Monad
 * @typedef {Cont} cont - Cont instance
 *
 */

/** Continuation Monad Type Rep
 *  @property { a -> Cont r a } of
 *            value-accepting constructor
 *  @property { ((a -> r) -> r) -> Cont r a } cont
 *            suspension-accepting constructor
 *  @property { ((a -> m b) -> m a) -> Cont r a } callCC
 *            Suspended computation with escape hatch
 */
const Cont = Daggy.tagged('Cont', [ '_fn' ])

Cont.of = Cont[of] =
  val => Cont(cb => cb(val))

// callCC :: ((a -> m b) -> m a) -> m a
Cont.callCC =
  function(kSus) {
    throw 'unimplemented'
  }

Cont.cont =
  susFn => Cont(susFn)


// ----------------------------------------------------------------- //
// ADT Methods
// ----------------------------------------------------------------- //
Cont.prototype.map = Cont.prototype[map] =
  function(mapFn) {
    const sus = this._fn
    return Cont(cb => compose(mapFn, sus)(cb))
  }

Cont.prototype.chain = Cont.prototype[chain] =
  // This implementation is straight out of Haskell
  function(chainFn) {
    const sus = this._fn
    return Cont(
      cb => sus(
        val => chainFn(val).runCont(cb),
      ))
  }
  // This implementation is my own, keeping it around to think about
  // potential differences in the future
  // function(chainFn) {
  //   const sus = this._fn
  //   console.log('sus', sus.toString())
  //   return sus(val => chainFn(val))
  // }


// ----------------------------------------------------------------- //
// Derived ADT Methods
// ----------------------------------------------------------------- //
Cont.prototype.ap = Cont.prototype[ap] =
  function(contWithFn) {
    return contWithFn.chain(fn => this.map(fn))
  }


// ----------------------------------------------------------------- //
// Cont Methods
// ----------------------------------------------------------------- //
Cont.prototype.mapCont =
  function(reducerFn) {
    throw 'unimplemented'
  }

Cont.prototype.withCont =
  function(reducerFn) {
    throw 'unimplemented'
  }

Cont.prototype.runCont = Cont.prototype.run =
  function(cb) { return this._fn(cb) }

// ----------------------------------------------------------------- //
// Helper Functions
// ----------------------------------------------------------------- //
Cont.mapCont = curry((fn, cont) => cont.mapCont(fn))
Cont.runCont = curry(cont => cont.runCont())
Cont.withCont = curry((fn, cont) => cont.withcont(fn, cont))




// ----------------------------------------------------------------- //
// Default and Point-Free Exports
// ----------------------------------------------------------------- //
export default Cont

export const mapCont = Cont.mapCont
export const runCont = Cont.runCont
export const withCont = Cont.withCont
