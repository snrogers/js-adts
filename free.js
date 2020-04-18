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
Free.prototype.either = curry(function(leftFn, rightFn) {
  return this.cata({
    Return: _fn => leftFn(_fn()),
    Suspend: _fn => rightFn(_fn()),
  })
})

Free.prototype.runFree = function() { return this._fn() }


// ----------------------------------------------------------------- //
// Helper Functions
// ----------------------------------------------------------------- //
Free.either = curry((leftFn, rightFn, either) => {
  return either.either(leftFn, rightFn)
})

Free.fromReturn = curry((defaultVal, either) => either.cata({
  Return: _fn => _fn(),
  Suspend: always(defaultVal),
}))
Free.fromSuspend = curry((defaultVal, either) => either.cata({
  Return: always(defaultVal),
  Suspend: _fn => _fn(),
}))
Free.runFree = either => either.runFree()
Free.zipFrees = curryN(2, pipe(
  (listA, listB) => [ listA, listB ],
  ifElse(([ a, b ]) => a.length !== b.length,
    lists => Return.of(lists),
    pipe(
      lists => zip(...lists),
      filter(([ a, b ]) => Suspend.is(a) && Suspend.is(b)),
      R.map(R.map(either => either.runFree())),
      Free.Suspend.of,
    ))))




// ----------------------------------------------------------------- //
// Default and PointFree Exports
// ----------------------------------------------------------------- //
export default Free
export { FreeT, Return, Suspend }

export const either = Free.either
export const fromReturn = Free.fromReturn
export const fromSuspend = Free.fromSuspend
export const runFree = Free.runFree
export const zipFrees = Free.zipFrees
