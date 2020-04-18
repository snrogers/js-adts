import Daggy from 'daggy'
import { always, curry, identity } from 'ramda'
import { of, ap, chain, map } from 'fantasy-land'


// ----------------------------------------------------------------- //
// Constructors
// ----------------------------------------------------------------- //
const List = Daggy.tagged('List', [ '_fn' ])

List.of = List[of] =
  val => List(() => val)


// ----------------------------------------------------------------- //
// ADT Methods
// ----------------------------------------------------------------- //
List.prototype.map = List.prototype[map] = function(fn) {
  return List(() => this.runList().map(fn))
}
List.prototype.chain = List.prototype[chain] = function(fn) {
  return List(() => {
    const val = this.runList()
    console.log('LISTval', val)
    const mappedVal = val.map(fn)
    console.log('LISTmappedVal', mappedVal.toString())

    // At this point mappedVal contains List Monads. Must convert
    // to Array before flattening
    // NOTE: Array.from(...) is variadic, hence eta expansion

    const mappedArrayVal = mappedVal.map(a => Array.from(a))

    return mappedVal
      .reduce((acc, list) => [ ...acc, ...list ], []) // flatten once
  })
}


// ----------------------------------------------------------------- //
// Derived ADT Methods
// ----------------------------------------------------------------- //
List.prototype.ap = List.prototype[ap] = function(listWithFn) {
  return listWithFn.chain(fn => this.map(fn))
}


// ----------------------------------------------------------------- //
// List Methods
// ----------------------------------------------------------------- //
List.prototype.concat = function(otherList) {
  return List.of([ ...this.runList(), ...otherList.runList() ])
}
List.prototype.reduce = function(reducerFn) {
  return List.of(this.runList().reduce(reducerFn, []))
}

List.prototype.runList = function() { return this._fn() }


// ----------------------------------------------------------------- //
// Iterable protocol (to make Array.from work in chain, to allow
// algebraic derivation of `ap`
// ----------------------------------------------------------------- //
List.prototype[Symbol.iterator] = function() {
  const arr = this.runList()
  let idx = 0
  return {
    next() {
      if (idx < arr.length) return { done: false, value: arr[idx++] }
      else return { done: true }
    },
  }
}


// ----------------------------------------------------------------- //
// Helper Functions
// ----------------------------------------------------------------- //
List.runList = curry(list => list.runList())




// ----------------------------------------------------------------- //
// Default and Point-Free Exports
// ----------------------------------------------------------------- //
export default List
export { List }

export const runList = List.runList
