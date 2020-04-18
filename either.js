import Daggy from 'daggy'
import * as R from 'ramda'
import { always, compose, curry, curryN, filter, ifElse, pipe, zip } from 'ramda'
import { of, ap, chain, map, reduce, traverse } from 'fantasy-land'

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
// reduce :: Foldable f => f a ~> ((b, a) -> b, b) -> b
// reduce :: Either a b ~> ((c, b) -> c, c) -> c
Either.prototype.reduce = Either.prototype[reduce] = function(foldFn, b) {
  return this.cata({
    Left: () => b,
    Right: _fn => foldFn(b, this._fn()),
  })
}

// traverse :: Applicative f, Traversable t =>
//   t a ~> (TypeRep f, a -> f b) -> f (t b)
// traverse :: Applicative f =>
//   Either a b ~> (TypeRep f, b -> f c) -> f (Either a c)
Either.prototype.traverse = Either.prototype[traverse] = function(F, fn) {
  return this.cata({
    Left: _fn => F.of(Either.left(_fn())),
    Right: _fn => fn(_fn()).map(Either.Right),
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
Either.either = curry((leftFn, rightFn, either) => {
  return either.either(leftFn, rightFn)
})

Either.fromLeft = curry((defaultVal, either) => either.cata({
  Left: _fn => _fn(),
  Right: always(defaultVal),
}))
Either.fromRight = curry((defaultVal, either) => either.cata({
  Left: always(defaultVal),
  Right: _fn => _fn(),
}))
Either.runEither = either => either.runEither()
Either.zipEithers = curryN(2, pipe(
  (listA, listB) => [ listA, listB ],
  ifElse(([ a, b ]) => a.length !== b.length,
    lists => Left.of(lists),
    pipe(
      lists => zip(...lists),
      filter(([ a, b ]) => Right.is(a) && Right.is(b)),
      R.map(R.map(either => either.runEither())),
      Either.Right.of,
    ))))




// ----------------------------------------------------------------- //
// Default and PointFree Exports
// ----------------------------------------------------------------- //
export default Either
export { EitherT, Left, Right }

export const either = Either.either
export const fromLeft = Either.fromLeft
export const fromRight = Either.fromRight
export const runEither = Either.runEither
export const zipEithers = Either.zipEithers
