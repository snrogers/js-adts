import Identity, { IdentityT } from './identity'
import * as R from 'ramda'

describe.only('Identity', () => {
  describe('of', () => {
    it('works', () => {
      const id = Identity.of(1)
      const output = id.valueOf()
      expect(output).toBe(1)
    })
  })

  describe('map', () => {
    it('works', () => {
      const id = Identity.of(2)
      const output = id.map(R.multiply(3)).valueOf()
      expect(output).toBe(6)
    })
  })

  describe('chain', () => {
    it('works', () => {
      const id = Identity.of(2)
      const output = id.chain(a => Identity.of(a * 5)).valueOf()
      expect(output).toBe(10)
    })
  })

  describe('ap', () => {
    it('works', () => {
      const id = Identity.of(3)
      const output = id.ap(Identity.of(R.multiply(7))).valueOf()
      expect(output).toBe(21)
    })

    it('works with R.sequence(Identity.of, listOfIdentities)', () => {
      const input = [ Identity.of(1), Identity.of(2), Identity.of(3) ]
      const sequenced = R.sequence(Identity.of, input)
      const output = sequenced.runIdentity()

      expect(output).toEqual([ 1, 2, 3 ])
    })

    it.only('works with R.sequence(R.of, IdentityOfList)', () => {
      const input = Identity.of([ 1, 2, 3 ])
      const sequenced = R.sequence(R.of, input)

      console.log('seuqneced', sequenced)
      const output = sequenced.map(Identity.runIdentity)

      expect(output).toEqual([ 1, 2, 3 ])
    })
  })

  describe('valueOf', () => {
    it('returns the result of the computation', () => {
      const id = Identity.of(3)
      const output = id.valueOf()
      expect(output).toBe(3)
    })
  })
})

describe('IdentityTIdentity', () => {
  const IdentityTIdentity = IdentityT(Identity)
  IdentityTIdentity.prototype.valueOf = function() {
    return this.valueOfT().valueOf()
  }

  describe('of', () => {
    it('works', () => {
      const id = IdentityTIdentity.of(1)
      const output = id.valueOf()
      expect(output).toBe(1)
    })
  })

  describe('map', () => {
    it('works', () => {
      const id = IdentityTIdentity.of('a')
      const output = id.map(a => a + 'b').valueOf()
      expect(output).toBe('ab')
    })
  })

  describe('chain', () => {
    it('works', () => {
      const id = IdentityTIdentity.of(2)
      const output = id.chain(a => IdentityTIdentity.of(a * 5)).valueOf()
      expect(output).toBe(10)
    })
  })

  describe('ap', () => {
    it('works', () => {
      const id = IdentityTIdentity.of(3)
      const output = id.ap(IdentityTIdentity.of(R.multiply(7))).valueOf()
      expect(output).toBe(21)
    })
  })

  describe('valueOf', () => {
    it('returns the result of the computation', () => {
      const id = IdentityTIdentity.of(3)
      const output = id.valueOf()
      expect(output).toBe(3)
    })
  })
})
