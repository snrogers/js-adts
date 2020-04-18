// import List from './list'
// import StateT from './state.transform'
import { runState, execState, evalState } from './state'
import * as R from 'ramda'

import { List, ListT, State, StateT } from 'akh'


// const StateTList = StateT(List)
// StateTList.prototype.runState = function(initState) {
//   return this.runStateT(initState) // .runList()
// }
// StateTList.prototype.evalState = function(initState) {
//   return this.evalStateT(initState).runList()
// }
// StateTList.prototype.execState = function(initState) {
//   return this.execStateT(initState).runList()
// }



describe('StateTList', () => {
  it.skip('allows for `chain(...)`-ing over a list while mutating state', () => {
    const STL = StateT(List)

    const input = [ 1, 2, 3 ]

    // const process = R.pipe(
    //   STL.of,
    //   R.map(a => a * -1),
    //   runState({})
    // )

    // const output = process(input)

    const output = STL.of(input)
      .map(a => a * -1)
      .runState()

    expect(output.runList()).toEqual([ -1, -2, -3 ])
  })

  it('AKH', () => {
    // Define a new monad using the state transformer on the list monad.
    const STL = StateT(List)
    // Define a way to pass values through `STL`
    const run = R.curry((state, monad) => StateT.run(monad, state).run())


    // ----------------------------------------------------------------- //
    // ----------------------------------------------------------------- //


    console.log('STL', STL)
    console.log('STL.prototype', STL.prototype)

    const input = [ 1, 2, 3 ]

    const process = R.pipe(
      STL.of,
      R.chain(num => {
        console.log('num', num)
        return num
        // return STL.get.map(s => num + s)
        //   .chain(() => STL.modify(s => s + 1)).map(() => num)
      }),
      run(1)
    )

    console.log('PORCESS OUTPUT', process(input))
  })
})
