import Reader, { ReaderT } from './reader'
import Identity from './identity'


describe('Reader Monad', () => {
  describe('runReader', () => {
    it('executes the computation within a trivial Reader', () => {
      const output = Reader.of(5)
        .runReader()
      expect(output).toBe(5)
    })
  })

  describe('Reader.asks', () => {
    it('gets and transforms the env (it\'s just the constructor', () => {
      const output = Reader.asks(a => a + 'b')
        .map(a => a + 'c')
        .runReader('a')

      expect(output).toBe('abc')
    })
  })

  describe('Reader.local', () => {
    it('maps over the env (profunctor-esque)', () => {
      const output = Reader.of('a')
        .map(a => a + 'b')
        .chain(a => Reader.ask().map(env => a + env))
        .map(a => a + 'd')
        .chain(a => Reader.ask().map(env => a + env))
        .local(env => env + env)
        .runReader('c')

      expect(output).toBe('abccdcc')
    })

    it('only transforms the env up until the next chain statement', () => {
      const output = Reader.of('a')
        .map(a => a + 'b')
        .chain(a => Reader.ask().map(env => a + env))
        .map(a => a + 'd')
        .local(env => env + env)
        .chain(a => Reader.ask().map(env => a + env))
        .runReader('c')

      expect(output).toBe('abccdc')
    })
  })

  describe('Reader.map', () => {
    it('composes a function into the Reader\'s computation', () => {
      const output = Reader.of(2)
        .map(a => a * 3)
        .runReader()
      expect(output).toBe(6)
    })
  })

  describe('Reader.chain/Reader.ask', () => {
    it('exposes `env` within the Reader\'s computation', () => {
      const output = Reader.of(2)
        .chain(a => Reader.ask().map(({ factor }) => a * factor))
        .chain(a => Reader.ask().map(({ factor }) => a * factor))
        .runReader({ factor: 7 })
      expect(output).toBe(98)
    })

    it('accepts a transform function', () => {
      const output = Reader.of('a')
        .chain(a => Reader.ask(e => `-${e}-`).map(e => a + e))
        .chain(a => Reader.ask().map(e => a + e))
        .runReader('b')
      expect(output).toBe('a-b-b')
    })
  })

  describe('Reader.ap', () => {
    it('applies a Reader<fn> to a Reader<value>', () => {
      const output = Reader.of(3)
        .ap(Reader.of(a => a * 11))
        .runReader()
      expect(output).toBe(33)
    })
  })
})


