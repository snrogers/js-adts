import Daggy from 'daggy'
import * as R from 'ramda'
import { always, compose, curry, curryN, filter, ifElse, pipe, zip } from 'ramda'
import { of, ap, chain, map } from 'fantasy-land'


// ----------------------------------------------------------------- //
// Constructors
// ----------------------------------------------------------------- //
const Free = Daggy.taggedSum('Free', {
  Return: [ '_fn' ],
  Suspend: [ '_fn' ],
})
const { Return, Suspend } = Free

Free.of = Free[of] = val => Suspend(() => val)
Return.of = Return[of] = val => Return(() => val)
Suspend.of = Suspend[of] = val => Suspend(() => val)


// ----------------------------------------------------------------- //
// ADT Methods
// ----------------------------------------------------------------- //
Free.prototype.map = Free.prototype[map] = function (fn) {
  return this.cata({
    Return: _fn => Return(_fn),
    Suspend: _fn => Suspend(compose(fn, _fn)),
  })
}
Free.prototype.chain = Free.prototype[chain] = function(fn) {
  return this.cata({
    Return: _fn => Return(_fn),
    Suspend: _fn => fn(_fn()),
  })
}


// ----------------------------------------------------------------- //
// Derived ADT Methods
// ----------------------------------------------------------------- //
Free.prototype.ap = Free.prototype[ap] = function(either) {
  return either.chain(fn => this.map(fn))
}


// ----------------------------------------------------------------- //
// Free Methods
// ----------------------------------------------------------------- //
Free.prototype.runFree = function() { return this._fn() }


// ----------------------------------------------------------------- //
// Helper Functions
// ----------------------------------------------------------------- //



// ----------------------------------------------------------------- //
// Default and PointFree Exports
// ----------------------------------------------------------------- //
export default Free
export { FreeT, Return, Suspend }

export const runFree = Free.runFree
