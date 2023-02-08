export function flatForEach(ary: unknown[], fn: Function, thisArg?: unknown) {
    ary.forEach((...args) => {
        const element = args[0]
        if(Array.isArray(element)) {
            flatForEach(element, fn, thisArg)
        }else {
            fn.apply(thisArg, args)
        }
    })
}