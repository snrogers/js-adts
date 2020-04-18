import Daggy from 'daggy'
import * as R from 'ramda'
import { compose, curry } from 'ramda'
import { ap, chain, map, of } from 'fantasy-land'

const ListT = M => {
  // ----------------------------------------------------------------- //
  // Constructors
  // ----------------------------------------------------------------- //
  const ListT = Daggy.tagged(`ListT${M}`, [ '_fn' ])
  ListT.of = ListT[of] =
    val => Array.isArray(val)
      ? ListT(() => val.map(el => M.of(el)))
      : ListT(() => [ M.of(val) ])
  ListT.lift = m => ListT(() => [ m ])


  // ----------------------------------------------------------------- //
  // ADT Methods
  // ----------------------------------------------------------------- //
  ListT.prototype.map = ListT.prototype[map] = function(fn) {
    const arrOfM = this._fn()
    const mappedArrOfM = arrOfM.map(m => m.map(fn))
    return ListT(() => mappedArrOfM)
  }

  ListT.prototype.chain = ListT.prototype[chain] = function(fn) {
    const arrOfM = this._fn()
    console.log('arrOfM', arrOfM)
    console.log('arrOfM.map(m => m.run())', arrOfM.map(m => m.run()))

    const arrOfChainedMOfArr = arrOfM.map(m => {
      console.log('m', m.toString()) // M DEFINITELY IS A MONAD, NOT AN ARRAY
      const chainedM = m.chain(val => {
        console.log('val', val)

        const ltm = fn(val)
        console.log('[chainedM] ltm', ltm)

        const listOfMNext = ltm.runListT()
        console.log('[chainedM] listOfMNext', listOfMNext)

        // put this list inside the mNext
        const mNext = R.sequence(M.of, listOfMNext)

        console.log('[chainedM] mNext', mNext)
        console.log('[chainedM] mNext.run', mNext.run())

        return mNext // NOTE: chained M will be M([...]), containing an array
      })

      // NOTE: WHY IS chainedM a list of M INSTEAD OF M OF LIST !!!?!?????

      console.log('util.inspect(chainedM)', chainedM)
      console.log('chainedM..map(run)', chainedM.map(m => {
        const val = m.run().toString()
        return val
      }))

      throw 'halt'

      return chainedM
    })

    console.log('arrOfChainedMOfArr', arrOfChainedMOfArr)

    // const arrOfArrOfChainedM =
    //   arrOfChainedMOfArr.map(chainedMOfArr => R.sequence(R.of, chainedMOfArr))
    // console.log('arrOfArrOfChainedM', arrOfArrOfChainedM)

    // throw 'halt'



    // const flattenedArrOfChainedM = arrOfChainedM.reduce((acc, arr) => [ ...acc, ...arr ], [])

    const flattenedArrOfChainedM =
      arrOfChainedMOfArr.reduce((acc, arr) => [ ...acc, ...arr ], [])

    return ListT(() => flattenedArrOfChainedM)
  }

  // ----------------------------------------------------------------- //
  // Derived Methods
  // ----------------------------------------------------------------- //
  ListT.prototype.ap = ListT.prototype[ap] = function(listTWithFn) {
    return listTWithFn.chain(fn => this.map(fn))
  }

  // ----------------------------------------------------------------- //
  // ListT Methods
  // ----------------------------------------------------------------- //
  ListT.prototype.runListT = function() {
    const arrOfM = this._fn()
    console.log('arrOfM', arrOfM)
    return arrOfM
  }

  // ----------------------------------------------------------------- //
  // Helper Functions
  // ----------------------------------------------------------------- //


  return ListT
}

export default ListT
