declare global {
  interface Function {
    __mpWrapped?: boolean;
  }
}
export * from './wrapper';
export * from './types';
