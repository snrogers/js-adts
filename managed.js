import Daggy from 'daggy'
import { always, curry, identity } from 'ramda'
import { of, ap, chain, map } from 'fantasy-land'

// ----------------------------------------------------------------- //
// Constructors
// ----------------------------------------------------------------- //
const Managed = Daggy.tagged('Managed', [ '_fn' ])

Managed.of = Managed[of] =
  val => {
    const listOfVal = Managed(() => val)
    console.log('listOfVal', listOfVal.runManaged())
    return listOfVal
  }


// ----------------------------------------------------------------- //
// ADT Methods
// ----------------------------------------------------------------- //
Managed.prototype.map = Managed.prototype[map] = function(fn) {
  return Managed(() => {
    const arr = this.runManaged()
    console.log('arr', arr)

    const mappedArr = arr.map(fn)
    console.log('mappedArr', mappedArr)

    return mappedArr
  })
}
Managed.prototype.chain = Managed.prototype[chain] = function(fn) {
  return Managed(() => {
    const val = this.runManaged()
    console.log('LISTval', val)
    const mappedVal = val.map(fn)
    console.log('LISTmappedVal', mappedVal.toString())

    // At this point mappedVal contains Managed Monads. Must convert
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
Managed.prototype.ap = Managed.prototype[ap] = function(listWithFn) {
  return listWithFn.chain(fn => this.map(fn))
}


// ----------------------------------------------------------------- //
// Managed Methods
// ----------------------------------------------------------------- //
Managed.prototype.concat = function(otherManaged) {
  return Managed.of([ ...this.runManaged(), ...otherManaged.runManaged() ])
}
Managed.prototype.reduce = function(reducerFn) {
  return Managed.of(this.runManaged().reduce(reducerFn, []))
}

Managed.prototype.runManaged = function() { return this._fn() }

// Alias runManaged
Managed.prototype.run = Managed.prototype.runManaged


// ----------------------------------------------------------------- //
// Iterable protocol (to make Array.from work in chain, to allow
// algebraic derivation of `ap`
// ----------------------------------------------------------------- //
// Managed.prototype[Symbol.iterator] = function() {
//   const arr = this.runManaged()
//   let idx = 0
//   return {
//     next() {
//       if (idx < arr.length) return { done: false, value: arr[idx++] }
//       else return { done: true }
//     },
//   }
// }


// ----------------------------------------------------------------- //
// Helper Functions
// ----------------------------------------------------------------- //
Managed.runManaged = curry(list => list.runManaged())




// ----------------------------------------------------------------- //
// Default and Point-Free Exports
// ----------------------------------------------------------------- //
export default Managed
export { Managed }

export const runManaged = Managed.runManaged
