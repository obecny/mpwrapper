import { AnyFunction, Store, WrapperObj } from './types';

const WRAPPED = '__mpWrapped';

const storeWrapper = new WeakMap<AnyFunction, Store>();
const logger = console.error.bind(console);

function noop() {}

export function wrap(
  obj: any,
  name: string,
  userWrapper: AnyFunction
): WrapperObj {
  if (inputsHasErrors(obj, name, userWrapper)) {
    return {
      unwrap: noop,
      wrapped: noop,
    };
  }
  const wrapper = getWrapper(obj, name);
  const store = storeWrapper.get(wrapper);
  let result;
  if (store) {
    result = userWrapper(store.next, name);
    if (typeof result === 'function') {
      store.callbacks.push(result);
    }
  }
  return {
    unwrap: unwrapCallback.bind(undefined, obj, name, result),
    wrapped: result,
  };
}

export function massWrap(
  objs: any | any[],
  names: string[],
  userWrapper: AnyFunction
): WrapperObj[] {
  const results: WrapperObj[] = [];
  if (!objs) {
    logger('must provide one or more modules to patch');
    logger(new Error().stack);
    return results;
  } else if (!Array.isArray(objs)) {
    objs = [objs];
  }

  if (!(names && Array.isArray(names))) {
    logger('must provide one or more functions to wrap on modules');
    return results;
  }
  objs.forEach((obj: any) => {
    names.forEach((name: string) => {
      results.push(wrap(obj, name, userWrapper));
    });
  });
  return results;
}

export function unwrap(obj: any, name: string) {
  const wrapper = obj[name];
  if (wrapper[WRAPPED]) {
    const store = storeWrapper.get(wrapper);
    if (store) {
      defineProperty(obj, name, store.original);
      storeWrapper.delete(wrapper);
    }
  } else {
    logger('function cannot be unwrapped');
  }
}

export function massUnwrap(objs: any | any[], names: string[]) {
  if (!objs) {
    logger('must provide one or more modules to patch');
    logger(new Error().stack);
    return;
  } else if (!Array.isArray(objs)) {
    objs = [objs];
  }

  if (!(names && Array.isArray(names))) {
    logger('must provide one or more functions to unwrap on modules');
    return;
  }

  objs.forEach((obj: any) => {
    names.forEach((name: string) => {
      unwrap(obj, name);
    });
  });
}

function unwrapCallback(obj: any, name: string, result: AnyFunction) {
  const wrapper = obj[name];
  if (typeof result === 'function' && wrapper[WRAPPED]) {
    const store = storeWrapper.get(wrapper);
    if (store) {
      for (let i = 0, j = store.callbacks.length; i < j; i++) {
        if (store.callbacks[i] === result) {
          store.callbacks.splice(i, 1);
          break;
        }
      }
    }
  } else {
    logger('function cannot be unwrapped');
  }
}

function inputsHasErrors(
  obj: any,
  name: string,
  wrapper: AnyFunction
): boolean {
  if (!obj) {
    logger('module cannot be undefined');
    return true;
  }
  if (!obj[name]) {
    logger(`no original function ${name} to wrap`);
    return true;
  }
  if (!wrapper) {
    logger(`no wrapper function, ${new Error().stack}`);
    return true;
  }
  if (!isFunction(obj[name]) || !isFunction(wrapper)) {
    logger('original module and wrapper must be functions');
    return true;
  }
  return false;
}

function createWrapper(obj: any, name: string): AnyFunction {
  const original = obj[name];
  const callbacks: AnyFunction[] = [];
  let i = 0;

  function wrapper(this: any, ...args: any[]) {
    i = 0;
    return next.apply(this, args);
  }

  function next(this: any, ...args: any[]): any {
    i++;
    if (callbacks.length >= i) {
      let result = undefined;
      let error = false;
      try {
        result = callbacks[i - 1].apply(this, args);
      } catch (e) {
        error = true;
        throw e;
      } finally {
        if (error) {
          // continue the loop
          return next();
        }
        return result;
      }
    } else {
      return original.apply(this, args);
    }
  }

  defineProperty(wrapper, WRAPPED, true);

  extendObject(original, next);

  defineProperty(obj, name, wrapper);

  storeWrapper.set(wrapper, {
    callbacks,
    next,
    original,
  });
  return wrapper;
}

function defineProperty(obj: any, name: string, value: any) {
  if (!obj) {
    return;
  }
  const enumerable = !!obj[name] && obj.propertyIsEnumerable(name);
  Object.defineProperty(obj, name, {
    configurable: true,
    enumerable,
    value,
    writable: true,
  });
}

function getWrapper(obj: any, name: string) {
  let wrapper = obj[name];
  if (!wrapper[WRAPPED]) {
    wrapper = createWrapper(obj, name);
  }
  return wrapper;
}

function isFunction(f: AnyFunction) {
  return typeof f === 'function';
}

function extendObject(source: any, destination: any) {
  Object.keys(source).forEach((key: string) => {
    destination[key] = source[key];
  });
}
