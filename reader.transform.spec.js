import Identity from './identity'
import ReaderT from './reader.transform'

describe('ReaderTIdentity Monad', () => {
  const ReaderTIdentity = ReaderT(Identity)
  ReaderTIdentity.prototype.runReader = function(env) {
    return this.runReaderT(env).valueOf()
  }

  describe('runReader', () => {
    it('executes the computation within a trivial ReaderTIdentity', () => {
      const output = ReaderTIdentity.of(5)
        .runReader()
      expect(output).toBe(5)
    })
  })

  describe('map', () => {
    it('composes a function into the ReaderTIdentity\'s computation', () => {
      const output = ReaderTIdentity.of(2)
        .map(a => a * 3)
        .map(a => a * 5)
        .runReader()
      expect(output).toBe(30)
    })
  })

  describe('chain/ask', () => {
    it('exposes `env` within the ReaderTIdentity\'s computation', () => {
      const output = ReaderTIdentity.of(2)
        .chain(a => ReaderTIdentity.ask().map(({ factor }) => a * factor))
        .chain(a => ReaderTIdentity.ask().map(({ factor }) => a * factor))
        .runReader({ factor: 7 })
      expect(output).toBe(98)
    })
  })

  describe('ap', () => {
    it('applies a ReaderTIdentity<fn> to a ReaderTIdentity<value>', () => {
      const output = ReaderTIdentity.of(3)
        .ap(ReaderTIdentity.of(a => a * 11))
        .runReader()
      expect(output).toBe(33)
    })
  })
})
