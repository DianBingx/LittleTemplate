import BaseUIBinder from "./BaseUIBinder";
/*
 * @Last Modified time: 2019-09-26 21:29:27
 */
const {ccclass, property} = cc._decorator;

@ccclass
export default class BaseUIView extends BaseUIBinder {
    private called = false;
    /** 初始化 */
    _preInit() {
        if(this.called) return ;
        super.__preInit();
    }
}