declare interface HKT<F,A>{
  _URI: F,
  _A: A
}

declare interface Functor<F> {
  map: <A, B>(f: (a: A) => B, fa: HKT<F, A>) => HKT
}

declare interface Monad implements Functor {
}

declare class State<S> {
  static of: (val: any) => State<S>
}
