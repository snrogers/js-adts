import List from './list'
import * as R from 'ramda'
import { curry } from 'ramda'


describe('List Monad', () => {
  describe('runList', () => {
    it('executes the computation within a trivial List', () => {
      const output = List.of([ 5 ])
        .runList()
      expect(output).toEqual([ 5 ])
    })
  })

  describe('List.map', () => {
    it('maps a function over the underlying array', () => {
      const output = List.of([ 1, 2, 3 ])
        .map(a => a * 3)
        .runList()
      expect(output).toEqual([ 3, 6, 9 ])
    })
  })

  describe('List.chain', () => {
    it('flatmaps a function over the underlying array', () => {
      const output = List.of([ 1, 2, 3 ])
        .chain(a => [ a, a * -1 ])
        .runList()
      expect(output).toEqual([ 1, -1, 2, -2, 3, -3 ])
    })
  })

  describe('List[Symbol.iterator]', () => {
    it('works with for/of loops', () => {
      const list = List.of([ 1, 2, 3 ])
      const output = []
      for (const val of list) {
        output.push(val)
      }
      expect(output).toEqual(list.runList())
    })

    it('works with Array.from', () => {
      const list = List.of([ 1, 2, 3 ])
      const output = Array.from(list)

      expect(output).toEqual(list.runList())
    })
  })

  describe('List.ap', () => {
    it('applies a List<fn> to a Reader<value>', () => {
      const output = List.of([ 1, 2, 3 ])
        .ap(List.of([ a => a * -1 ]))
        .runList()
      expect(output).toEqual([ -1, -2, -3 ])
    })

    it('performs a juxt when ap is passed a multi-value array of functions', () => {
      const valList = List.of([ 1, 2, 3 ])
      const fnList = List.of([ a => a * -1, a => a * 3 ])
      const output = R.ap(fnList, valList)
      expect(output.runList()).toEqual([ -1, -2, -3, 3, 6, 9 ])
    })
  })
})
