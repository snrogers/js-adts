import Daggy from 'daggy'
import R, { always, compose, curry, curryN, filter, ifElse, pipe, zip } from 'ramda'
import { of, ap, chain, map } from 'fantasy-land'

import EitherT from './either.transform'


// ----------------------------------------------------------------- //
// Constructors
// ----------------------------------------------------------------- //
const Either = Daggy.taggedSum('Either', {
  Left: [ '_fn' ],
  Right: [ '_fn' ],
})
const { Left, Right } = Either

Either.of = Either[of] = val => Right(() => val)
Left.of = Left[of] = val => Left(() => val)
Right.of = Right[of] = val => Right(() => val)


// ----------------------------------------------------------------- //
// ADT Methods
// ----------------------------------------------------------------- //
Either.prototype.map = Either.prototype[map] = function (fn) {
  return this.cata({
    Left: _fn => Left(_fn),
    Right: _fn => Right(compose(fn, _fn)),
  })
}
Either.prototype.chain = Either.prototype[chain] = function(fn) {
  return this.cata({
    Left: _fn => Left(_fn),
    Right: _fn => fn(_fn()),
  })
}


// ----------------------------------------------------------------- //
// Derived ADT Methods
// ----------------------------------------------------------------- //
Either.prototype.ap = Either.prototype[ap] = function(either) {
  return either.chain(fn => this.map(fn))
}


// ----------------------------------------------------------------- //
// Either Methods
// ----------------------------------------------------------------- //
Either.prototype.either = curry(function(leftFn, rightFn) {
  return this.cata({
    Left: _fn => leftFn(_fn()),
    Right: _fn => rightFn(_fn()),
  })
})

Either.prototype.runEither = function() { return this._fn() }


// ----------------------------------------------------------------- //
// Helper Functions
// ----------------------------------------------------------------- //
Either.fromLeft = curry((defaultVal, either) => either.cata({
  Left: _fn => _fn(),
  Right: always(defaultVal),
}))
Either.fromRight = curry((defaultVal, either) => either.cata({
  Left: always(defaultVal),
  Right: _fn => _fn(),
}))

Either.zipEithers = R.curryN(2, pipe(
  (listA, listB) => [ listA, listB ],
  ifElse(([ a, b ]) => a.length !== b.length,
    lists => Left.of(lists),
    pipe(
      lists => zip(...lists),
      filter(([ a, b ]) => Right.is(a) && Right.is(b)),
      R.map(R.map(either => either.runEither())),
      Either.Right.of
    ))))




// ----------------------------------------------------------------- //
// Default and PointFree Exports
// ----------------------------------------------------------------- //
module.exports = Either
module.exports.EitherT = EitherT
module.exports.either = curry((leftFn, rightFn, either) => {
  return either.either(leftFn, rightFn)
})
module.exports.runEither = either => either.runEither()
