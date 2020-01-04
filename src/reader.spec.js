import Reader, { ReaderT } from './reader'
import Identity from './identity'


describe('Reader Monad', () => {
  describe('runReader', () => {
    it('executes the computation within a trivial Reader', () => {
      const reader = Reader.of(5)
      const output = reader.runReader()
      expect(output).toBe(5)
    })
  })

  describe('map', () => {
    it('composes a function into the Reader\'s computation', () => {
      const reader = Reader.of(2)
      const mappedReader = reader.map(a => a * 3)
      const output = mappedReader.runReader()
      expect(output).toBe(6)
    })
  })

  describe('chain/ask', () => {
    it('exposes `env` within the Reader\'s computation', () => {
      const reader = Reader.of(2)
      const chainedReader = reader.chain(
        a => Reader.ask().map(
          ({ factor }) => a * factor
        )
      )
      const output = chainedReader.runReader({ factor: 7 })
      expect(output).toBe(14)
    })
  })

  describe('ap', () => {
    it('applies a Reader<fn> to a Reader<value>', () => {
      const valueReader = Reader.of(3)
      const fnReader = Reader.of(a => a * 11)
      const appedReader = valueReader.ap(fnReader)
      const output = appedReader.runReader()
      expect(output).toBe(33)
    })
  })
})


describe('ReaderTIdentity Monad', () => {
  const ReaderTIdentity = ReaderT(Identity)
  ReaderTIdentity.prototype.runReader = (readerRun => {
    return function(env) { return this._fn(env).valueOf() }
  })(ReaderTIdentity.prototype.runReader)

  describe('runReader', () => {
    it('executes the computation within a trivial ReaderTIdentity', () => {
      const reader = ReaderTIdentity.of(5)
      const output = reader.runReader()
      expect(output).toBe(5)
    })
  })

  describe('map', () => {
    it('composes a function into the ReaderTIdentity\'s computation', () => {
      const reader = ReaderTIdentity.of(2)
      const mappedReaderTIdentity = reader.map(a => a * 3)
      const output = mappedReaderTIdentity.runReader()
      expect(output).toBe(6)
    })
  })

  describe('chain/ask', () => {
    it('exposes `env` within the ReaderTIdentity\'s computation', () => {
      const reader = ReaderTIdentity.of(2)
      const chainedReaderTIdentity = reader.chain(
        a => ReaderTIdentity.ask().map(
          ({ factor }) => a * factor
        )
      )
      const output = chainedReaderTIdentity.runReader({ factor: 7 })
      expect(output).toBe(14)
    })
  })

  describe('ap', () => {
    it('applies a ReaderTIdentity<fn> to a ReaderTIdentity<value>', () => {
      const valueReaderTIdentity = ReaderTIdentity.of(3)
      const fnReaderTIdentity = ReaderTIdentity.of(a => a * 11)
      const appedReaderTIdentity = valueReaderTIdentity.ap(fnReaderTIdentity)
      const output = appedReaderTIdentity.runReader()
      expect(output).toBe(33)
    })
  })
})
