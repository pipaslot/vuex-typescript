function startsWith(string, searched) {
    return string.indexOf(searched) == 0;
}
export function getMethodNames(obj) {
    if (!obj)
        return [];
    return Object.getOwnPropertyNames(Object.getPrototypeOf(obj)).filter(function (key) {
        return !startsWith(key, "_") &&
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
        return !startsWith(key, "_");
    });
}
