

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    onLoad() {
        var w = Math.max(cc.winSize.width, cc.winSize.height);
        var h = Math.min(cc.winSize.width, cc.winSize.height);
        var s = w / h;
        var canvas = this.getComponent(cc.Canvas)
        if (s > 1.9) {
            console.log("屏幕 比例超出正规值");
            // canvas.fitHeight = true;
            // canvas.fitWidth = false;
            cc.view.setDesignResolutionSize(720, 1440, cc.ResolutionPolicy.FIXED_WIDTH);
            this.node.y = cc.winSize.height / 2;
            //2.2.1 调用这一行
            // this.node.x = cc.winSize.width / 2;
        }
        else {
            console.log("屏幕 正常比例");
            // canvas.fitHeight = true;
            // canvas.fitWidth = false;
            cc.view.setDesignResolutionSize(720, 1280, cc.ResolutionPolicy.FIXED_HEIGHT);
            this.node.y = cc.winSize.height / 2;
        }
    }
}
