/*
 * Ripped off from fantasydo
 * https://github.com/russellmcc/fantasydo
 */

import { curry } from 'ramda'


export const go = curry((M, generatorFn) => {
  const doing = generatorFn()
  const doRec = v => {
    const a = doing.next(v)
    if (a.done) return M.of(a.value)
    else return a.value.chain(doRec)
  }
  return doRec(null)
})


export const goMulti = curry((M, generatorFn) => {
  const doRec = (v, statesSoFar) => {
    const iter = generatorFn()
    statesSoFar.forEach(it => iter.next(it))
    const a = iter.next(v)
    if (a.done) return M.of(a.value)
    else return a.value.chain(vv =>doRec(vv, statesSoFar.concat(v)))
  }
  return doRec(null, [])
})
