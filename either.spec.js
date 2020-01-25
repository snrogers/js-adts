import Either, {
  Left,
  Right,
  either,
  fromLeft,
  fromRight,
  zipEithers,
} from './either'


// ----------------------------------------------------------------- //
// Constants and Hlpers
// ----------------------------------------------------------------- //
const noop = () => {}


// ----------------------------------------------------------------- //
// Tests
// ----------------------------------------------------------------- //
describe('Either Monad', () => {
  describe('runEither', () => {
    it('executes the computation within a trivial Either', () => {
      const either = Either.of(5)
      const output = either.runEither()
      expect(output).toBe(5)
    })
  })

  describe('map', () => {
    it('composes a function into the Either\'s computation', () => {
      const either = Either.of(2)
      const mappedEither = either.map(a => a * 3)
      const output = mappedEither.runEither()
      expect(output).toBe(6)
    })
  })

  describe('chain', () => {
    it('composes Right computations', () => {
      const output = Either.of(2)
        .chain(a => Either.of(a * 3))
        .chain(a => Either.of(a * 5))
        .runEither()
      expect(output).toBe(30)
    })

    it('skips past computations when Left', () => {
      const either = Either.of(2)
      const chainedEither = either.chain(a => Either.of(a * 3))
        .chain(a => Either.Left.of(a * 5))
        .chain(a => Either.of(a * 7))
        .chain(a => Either.of(a * 11))
        .chain(a => Either.Left.of(a * 13))
      const output = chainedEither.runEither()
      expect(output).toBe(30)
    })
  })

  describe('ap', () => {
    it('applies a Either<fn> to a Either<value>', () => {
      const valueEither = Either.of(3)
      const fnEither = Either.of(a => a * 11)
      const appedEither = valueEither.ap(fnEither)
      const output = appedEither.runEither()
      expect(output).toBe(33)
    })
  })

  describe('either', () => {
    it('escapes Left after transformation with leftFn', () => {
      const output = either(a => a * 3, noop, Left.of(2))
      expect(output).toBe(6)
    })

    it('escapes Right after transformation with rightFn', () => {
      const output = either(noop, a => a * 3, Right.of(2))
      expect(output).toBe(6)
    })
  })


  describe('fromLeft', () => {
    it('returns a default value from a Right', () => {
      const r = Either.Right.of(5)
      const val = fromLeft('default', r)
      expect(val).toBe('default')
    })

    it('returns the computed value from a Left', () => {
      const l = Either.Left.of(5)
      const val = fromLeft('default', l)
      expect(val).toBe(5)
    })
  })

  describe('fromRight', () => {
    it('returns a default value from a Left', () => {
      const l = Either.Left.of(5)
      const val = fromRight('default', l)
      expect(val).toBe('default')
    })

    it('returns the computed value from a Right', () => {
      const r = Either.Right.of(5)
      const val = fromRight('default', r)
      expect(val).toBe(5)
    })
  })

  describe('zipEithers', () => {
    it('returns Left of inputs if the lists aren\'t the same length', () => {
      const listA = [ Right.of(1) ]
      const listB = [ Right.of(1), Right.of(2) ]

      const output = Either.fromLeft('ERROR', zipEithers(listA, listB))
      expect(output).toEqual([ listA, listB ])
    })

    it('returns a Right of array of arrays of VALUES where both were Right', () => {
      const a = [ Right.of(1), Left.of(2), Right.of(3), Left.of(4), Right.of(5) ]
      const b = [ Right.of(1), Right.of(2), Left.of(3), Left.of(4), Right.of(5) ]

      const output = Either.fromRight('ERROR', zipEithers(a, b))

      expect(output).toEqual([
        [ a[0].runEither(), b[0].runEither() ],
        [ a[4].runEither(), b[4].runEither() ],
      ])
    })
  })
})
