export function getMethodNames(obj: any): string[] {
  if (!obj) return [];
  return Object.getOwnPropertyNames(Object.getPrototypeOf(obj)).filter(
    key =>
      !key.startsWith("_") &&
      typeof obj[key] === "function" &&
      key != "constructor"
  );
}

export function getGetterNames(obj: any): string[] {
  if (!obj) return [];
  const prototype = Object.getPrototypeOf(obj);
  return Object.getOwnPropertyNames(prototype).filter(key => {
    let descriptor = Object.getOwnPropertyDescriptor(prototype, key);
    return descriptor && typeof descriptor.get === "function";
  });
}

export function getPropertyNames(obj: any): string[] {
  if (!obj) return [];
  return Object.keys(obj).filter(key => {
    return !key.startsWith("_");
  });
}

export function defineGetter(obj: any, key: string, fn: () => any) {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    get: fn
  });
}
export function defineProperty(obj: any, key: string, value: any) {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    get() {
      return value;
    },
    set(val) {
      value = val;
    }
  });
}