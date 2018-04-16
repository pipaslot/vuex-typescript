export function getMethodNames(obj) {
    if (!obj)
        return [];
    return Object.getOwnPropertyNames(Object.getPrototypeOf(obj)).filter(function (key) {
        return !key.startsWith("_") &&
            typeof obj[key] === "function" &&
            key != "constructor";
    });
}
export function getGetterNames(obj) {
    if (!obj)
        return [];
    var prototype = Object.getPrototypeOf(obj);
    return Object.getOwnPropertyNames(prototype).filter(function (key) {
        var descriptor = Object.getOwnPropertyDescriptor(prototype, key);
        return descriptor && typeof descriptor.get === "function";
    });
}
export function getPropertyNames(obj) {
    if (!obj)
        return [];
    return Object.keys(obj).filter(function (key) {
        return !key.startsWith("_");
    });
}
export function defineGetter(obj, key, fn) {
    Object.defineProperty(obj, key, {
        configurable: true,
        enumerable: true,
        get: fn
    });
}
export function defineProperty(obj, key, value) {
    Object.defineProperty(obj, key, {
        configurable: true,
        enumerable: true,
        get: function () {
            return value;
        },
        set: function (val) {
            value = val;
        }
    });
}
