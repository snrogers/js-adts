import Identity from './identity'
import State from './state'
import ListT from './list.transformer'

describe.only('ListTIdentity Monad', () => {
  const ListTIdentity = ListT(Identity)
  ListTIdentity.prototype.runList = function() {
    const identityMArr = this.runListT()
    return identityMArr.map(Identity.runIdentity)
  }
  ListTIdentity.prototype.run = ListTIdentity.prototype.runList

  describe('runList', () => {
    it('executes the computation within a trivial ListTIdentity', () => {
      const output = ListTIdentity.of(5)
        .runList()
      expect(output).toEqual([ 5 ])
    })

    it('executes the computation within a trivial ListTIdentity', () => {
      const output = ListTIdentity.of([ 1, 2, 3 ])
        .runList()
      expect(output).toEqual([ 1, 2, 3 ])
    })
  })

  describe('map', () => {
    it('composes a function into the ListTIdentity\'s computation', () => {
      const output = ListTIdentity.of(2)
        .map(a => a * 3)
        .map(a => a * 5)
        .runList()
      expect(output).toEqual([ 30 ])
    })
    it('composes a function into the ListTIdentity\'s computation', () => {
      const output = ListTIdentity.of([ 1, 2, 3 ])
        .map(a => a * 3)
        .map(a => a * 5)
        .runList()
      expect(output).toEqual([ 15, 30, 45 ])
    })
  })

  describe('chain', () => {
    it.only('works with single-valued ListTIdentities', () => {
      const output = ListTIdentity.of('a')
        .chain(a => ListTIdentity.of(a + 'b'))
        .chain(a =>ListTIdentity.of(a + 'c'))
        .runList()
      expect(output).toEqual([ 'abc' ])
    })

    it('works with multiple ListTIdentities', () => {
      const output = ListTIdentity.of([ 'a', 'b' ])
        .chain(el => ListTIdentity.of([ el + 'x', el + 'y' ]))
        .runList()
      expect(output).toEqual([ 'ax', 'ay', 'bx', 'by' ])
    })
  })

  describe('ap', () => {
    it('applies a ListTIdentity<fn> to a ListTIdentity<value>', () => {
      const output = ListTIdentity.of(3)
        .ap(ListTIdentity.of(a => a * 11))
        .runList()
      expect(output).toEqual([ 33 ])
    })
  })
})

describe('ListTState Monad', () => {
  const ListTState = ListT(State)
  ListTState.prototype.runList = function(initState) {
    const stateArr = this.runListT()
    console.log('stateArr', stateArr)

    const resultArr = stateArr.reduce(([ acc, state ], stateM) => {
      console.log('stateM', stateM.runState(state))

      const [ val, stateFinal ] = State.runState(initState, stateM)
      console.log('val, stateFinal', val, stateFinal)

      return [ [ ...acc, val ], stateFinal ]
    }, [ [], initState ])

    console.log('resultArr', resultArr)

    return resultArr
  }
  ListTState.prototype.evalList = function(initState) {
    const stateArr = this.runListT()
    return stateArr.map(State.evalState(initState))
  }
  ListTState.prototype.execList = function(initState) {
    const stateArr = this.runListT()
    return stateArr.map(State.execList(initState))
  }

  describe('evalList', () => {
    it('evaluates the computation within a single-valued ListTState', () => {
      const output = ListTState.of(5)
        .evalList()
      expect(output).toEqual([ 5 ])
    })

    it('evaluates the computation within a multi-valued ListTState', () => {
      const output = ListTState.of([ 1, 2, 3 ])
        .evalList()
      expect(output).toEqual([ 1, 2, 3 ])
    })
  })

  describe('runList', () => {
    it('evaluates the computation and state within a single-valued ListTState', () => {
      const output = ListTState.of(5)
        .runList('initState')
      expect(output).toEqual([ [ 5 ], 'initState' ])
    })

    it('evaluates the computation within a multi-valued ListTState', () => {
      const output = ListTState.of([ 1, 2, 3 ])
        .runList('initState')
      expect(output).toEqual([ [ 1, 2, 3 ], 'initState' ])
    })
  })

  describe('map', () => {
    it('composes a function into the ListTState\'s computation', () => {
      const output = ListTState.of(2)
        .map(a => a * 3)
        .map(a => a * 5)
        .evalList()
      expect(output).toEqual([ 30 ])
    })
    it('composes a function into the ListTState\'s computation', () => {
      const output = ListTState.of([ 1, 2, 3 ])
        .map(a => a * 3)
        .map(a => a * 5)
        .evalList()
      expect(output).toEqual([ 15, 30, 45 ])
    })
  })

  describe('chain', () => {
    it('works with single-valued ListTIdentities', () => {
      const output = ListTState.of('a')
        .chain(a => ListTState.of(a + 'b'))
        .chain(a =>ListTState.of(a + 'c'))
        .evalList()
      expect(output).toEqual([ 'abc' ])
    })

    it('works with multiple ListTIdentities', () => {
      const output = ListTState.of([ 'a', 'b' ])
        .chain(el => ListTState.of([ el + 'x', el + 'y' ]))
        .runList()
      expect(output).toEqual([ 'ax', 'ay', 'bx', 'by' ])
    })
  })

  describe('ap', () => {
    it('applies a ListTState<fn> to a ListTState<value>', () => {
      const output = ListTState.of(3)
        .ap(ListTState.of(a => a * 11))
        .runList()
      expect(output).toEqual([ 33 ])
    })
  })
})
