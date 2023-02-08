export type Event = {
    clientList: Map<string, Function[]>,
    listen(key: String, fn: Function): void,
    trigger(...args: unknown[]): void
    remove(key: string, fn: Function): void
}

export const event: Event = {
    clientList: new Map<string, Function[]>(),
    listen: function (key: string, fn: Function) {
        let fns = this.clientList.get(key)
        if(!fns) {
            fns = [fn]
            this.clientList.set(key, fns)
        }else {
            fns.push(fn)
        }
    },
    trigger: function (...args: unknown[]) {
        var key = Array.prototype.shift.call(args);
        var fns = this.clientList.get(key);
        if (!fns || fns.length === 0) { // 如果没有绑定对应的消息
            return false;
        }
        for (var i = 0, fn; fn = fns[i++];) {
            fn.apply(this, args); // (2) // arguments 是 trigger 时带上的参数
        }
    },
    remove: function (key: string, fn: Function) {
        var fns = this.clientList.get(key)
        if (!fns) { // 如果 key 对应的消息没有被人订阅，则直接返回
            return false;
        }
        if (!fn) { // 如果没有传入具体的回调函数，表示需要取消 key 对应消息的所有订阅
            fns && (fns.length = 0);
        } else {
            for (var l = fns.length - 1; l >= 0; l--) { // 反向遍历订阅的回调函数列表
                var _fn = fns[l];
                if (_fn === fn) {
                    fns.splice(l, 1); // 删除订阅者的回调函数
                }
            }
        }
    }
};

export const installEvent = function (obj: object) {
    Object.assign(obj, event)
}; 