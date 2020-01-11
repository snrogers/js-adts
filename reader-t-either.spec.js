import ReaderTEither, { either, fromLeft, fromRight } from './reader-t-either'

const noop = () => {}

describe('ReaderTEither Monad (Reader Tests)', () => {
  describe('runReaderTEither', () => {
    it('executes the computation within a trivial ReaderTEither', () => {
      const reader = ReaderTEither.of(5)
      const output = reader.runReaderTEither()
      expect(output).toBe(5)
    })
  })

  describe('map', () => {
    it('composes a function into the ReaderTEither\'s computation', () => {
      const output = ReaderTEither.of(2)
        .map(a => a * 3)
        .runReaderTEither()
      expect(output).toBe(6)
    })
  })

  describe('chain/ask', () => {
    it('exposes `env` within the ReaderTEither\'s computation', () => {
      const output = ReaderTEither.of(2)
        .chain(a => ReaderTEither.ask().map(({ factor }) => a * factor))
        .chain(a => ReaderTEither.ask().map(({ factor }) => a * factor))
        .runReaderTEither({ factor: 7 })
      expect(output).toBe(98)
    })
  })

  describe('ap', () => {
    it('applies a ReaderTEither<fn> to a ReaderTEither<value>', () => {
      const valueReader = ReaderTEither.of(3)
      const fnReader = ReaderTEither.of(a => a * 11)
      const appedReader = valueReader.ap(fnReader)
      const output = appedReader.runReaderTEither()
      expect(output).toBe(33)
    })
  })
})

describe('ReaderTEither Monad (Either Tests)', () => {
  describe('runReaderTEither', () => {
    it('executes the computation within a trivial Either', () => {
      const either = ReaderTEither.of(5)
      const output = either.runReaderTEither()
      expect(output).toBe(5)
    })
  })

  describe('map', () => {
    it('composes a function into the ReaderTEither\'s computation', () => {
      const either = ReaderTEither.of(2)
      const mappedEither = either.map(a => a * 3)
      const output = mappedEither.runReaderTEither()
      expect(output).toBe(6)
    })
  })

  describe('chain', () => {
    it('composes Right computations', () => {
      const output = ReaderTEither.of(2)
        .chain(a => ReaderTEither.of(a * 3))
        .chain(a => ReaderTEither.of(a * 5))
        .runReaderTEither()
      expect(output).toBe(30)
    })

    it('skips past computations when Left', () => {
      const either = ReaderTEither.of(2)
      const chainedEither = either.chain(a => ReaderTEither.of(a * 3))
        .chain(a => ReaderTEither.Left.of(a * 5))
        .chain(a => ReaderTEither.of(a * 7))
        .chain(a => ReaderTEither.of(a * 11))
        .chain(a => ReaderTEither.Left.of(a * 13))
      const output = chainedEither.runReaderTEither()
      expect(output).toBe(30)
    })
  })

  describe('ap', () => {
    it('applies a ReaderTEither<fn> to a ReaderTEither<value>', () => {
      const valueEither = ReaderTEither.of(3)
      const fnEither = ReaderTEither.of(a => a * 11)
      const appedEither = valueEither.ap(fnEither)
      const output = appedEither.runReaderTEither()
      expect(output).toBe(33)
    })
  })

  describe('either', () => {
    it('escapes Left after transformation with leftFn', () => {
      const output = either(
        a => a * 3,
        noop,
        {},
        ReaderTEither.Left.of(2)
      )
      expect(output).toBe(6)
    })

    it('escapes Right after transformation with rightFn', () => {
      const output = either(
        noop,
        a => a * 3,
        {},
        ReaderTEither.Right.of(2)
      )
      expect(output).toBe(6)
    })
  })

  describe('fromLeft', () => {
    it('returns a default value from a Right', () => {
      const r = ReaderTEither.Right.of(5)
      const val = fromLeft('default', {}, r)
      expect(val).toBe('default')
    })

    it('returns the computed value from a Left', () => {
      const l = ReaderTEither.Left.of(5)
      const val = fromLeft('default', {}, l)
      expect(val).toBe(5)
    })
  })

  describe('fromRight', () => {
    it('returns a default value from a Left', () => {
      const l = ReaderTEither.Left.of(5)
      const val = fromRight('default', {}, l)
      expect(val).toBe('default')
    })

    it('returns the computed value from a Right', () => {
      const r = ReaderTEither.Right.of(5)
      const val = fromRight('default', {}, r)
      expect(val).toBe(5)
    })
  })
})
