export type AnyFunction = (...args: any[]) => any;

export interface Store {
  callbacks: AnyFunction[];
  next: AnyFunction;
  original: AnyFunction;
}

export interface WrapperObj {
  unwrap: AnyFunction;
  wrapped: AnyFunction;
}
