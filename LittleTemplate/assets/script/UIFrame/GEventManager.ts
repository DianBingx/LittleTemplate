/**
 * @Describe: 全局消息管理(增强版)   先发布, 后订阅一样可以得到对应消息, 需要注意的是, 未订阅前发布的消息会在第一个订阅时销毁
 * 简单来说, 就是发布一个NoListen类型的消息, 如果没有监听者, 那么此消息会被保留, 等到有监听者监听此消息时, 将消息发送给监听者, 然后将Nolisten消息删除
 */
export class GEventManager {
    private static _eventMap: { [key: string]: Array<ElementEvent> } = cc.js.createMap();
    private static _bufferEventMap: { [key: string]: Array<any> } = cc.js.createMap();          // 缓存的消息

    private static clearTimers: Array<ElementTimer> = [];
    private static autoClearTimeNumber = 10;                                   // 定时清理的间隔

    /**
     * 发布一个事件, 对于缓存的消息, 10s还没有被接收, 那么会定时回收
     * @param eventName 
     * @param parameter 
     */
    public static emit(eventName: Event_Name, parameter: any) {
        let array = this._eventMap[eventName];
        if (array === undefined) {
            //现在不需要存入
            return;
            // 将消息存入
            if (this._bufferEventMap[eventName] === undefined) {
                this._bufferEventMap[eventName] = [];
            }
            this._bufferEventMap[eventName].push(parameter);
            // 开始定时清理定时器, 如果不希望开启, 注释下面一行即可
            this.autoClearBufferEvent(eventName);
        }
        for (let i = 0; i < array.length; i++) {
            let element = array[i];
            if (!element) continue;
            element.callback.call(element.target, parameter);
            element.once && array.splice(i, 1) && --i;
        }
    }

    /**
     * 订阅一个事件
     * @param eventName 
     * @param callback 
     * @param target
     */
    public static on(eventName: Event_Name, callback: Function, target: any, once = false) {
        if (this._eventMap[eventName] === undefined) {
            this._eventMap[eventName] = [];
        }
        this._eventMap[eventName].push(new ElementEvent(callback, target, once));

        // 新订阅一个事件, 那么看看是不是有缓存的消息, 发布出去
        if (this._bufferEventMap[eventName] != undefined) {
            for (let i = 0; i < this._bufferEventMap[eventName].length; i++) {
                callback.call(target, this._bufferEventMap[eventName][i]);
            }
            this._bufferEventMap[eventName] = null;
            delete this._bufferEventMap[eventName];
        }
    }
    public static once(eventName: Event_Name, callback: Function, target: any) {
        this.on(eventName, callback, target, true);
    }

    /**
     * 取消监听一个事件
     * @param eventName 
     * @param callback 
     * @param target 
     */
    public static off(eventName: Event_Name, callback: Function, target: any) {
        let array = this._eventMap[eventName];
        if (array === undefined) return;
        for (let i = 0; i < array.length; i++) {
            let element = array[i];
            if (element && element.callback === callback && element.target === target) {
                array.splice(i, 1);
                break;
            }
        }
        if (array.length === 0) {
            this._eventMap[eventName] = null;
            delete this._eventMap[eventName];
        }
    }
    /**
     * 清空一个事件
     * @param eventName 
     */
    public static clear(eventName: Event_Name) {
        this._eventMap[eventName] = null;
        delete this._eventMap[eventName];
    }


    /** 自动清理bufferEventMap中的未接收消息 */
    private static autoClearBufferEvent(eventName: Event_Name) {

        for (const e of this.clearTimers) {
            if (e.eventName === eventName) {         // 当前event已经开启了定时回收
                return;
            }
        }

        let clearTimer = setTimeout(() => {
            clearEvent(eventName);
        }, this.autoClearTimeNumber * 1000);

        this.clearTimers.push(new ElementTimer(eventName, clearTimer));

        let clearEvent = (eventName: Event_Name) => {
            if (!this._bufferEventMap[eventName]) {
                return;
            }
            this._bufferEventMap[eventName] = null;
            delete this._bufferEventMap[eventName];

            for (let i = this.clearTimers.length - 1; i >= 0; i--) {
                if (this.clearTimers[i].eventName === eventName) {
                    this.clearTimers.splice(i, 1);
                }
            }
        };
    }
}

export class ElementEvent {
    callback: Function;
    target: any;
    once: boolean;

    constructor(callback: Function, target: Object, once: boolean) {
        this.callback = callback;
        this.target = target;
        this.once = once;
    }
}

export enum Event_Name {

    //uiInrut
    OPEN_UIINPUT,
    CLOSE_UIINPUT,

    //进入游戏mash
    GAME_PLAY_MASK_ANIM,

    GAME_CLOSE_EXPLAIN_UI,
    //游戏返回大厅
    GAME_RETURN_HALL,
    HALL_CHARACTER_ATTACK,

    //刷新物品
    GAME_REFRESH_ITEM,

    //使用道具
    GAME_USE_ITEM_ADDTIME,
    GAME_USE_ITEM_REBORN,

    //打开结算界面
    GAME_OPEN_WIN_UI,
    GAME_OPEN_LOSE_UI,

    //打开道具获得界面
    GAME_GET_PROP_UI,
    GAME_ADD_PROP_UI,

    //播放声音
    GAME_PLAY_SOUNDS,
    GAME_SET_BGM,
    GAME_SET_MUSIC_VOLUME,

    //新手礼包
    GAME_USE_NEWGIFTBAG,
    GAME_OPEN_NEWGIFTBAG,
    GAME_USE_DAYGIFTBAG,
}

class ElementTimer {
    eventName: Event_Name;
    timer: any

    constructor(evnetName: Event_Name, timer: any) {
        this.eventName = evnetName;
        this.timer = timer;
    }
}