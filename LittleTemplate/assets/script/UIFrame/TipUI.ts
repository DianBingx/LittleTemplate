
import TipsManager from "./TipsManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TipUI extends cc.Component {

    @property(cc.Node)
    tipLabel: cc.Node = null;


    onLoad() {

    }

    showInfo(tip: string) {
        this.tipLabel.setPosition(new cc.Vec2(0, -300));
        this.tipLabel.getComponent(cc.Label).string = tip;
        let nodeTween = cc.tween(this.tipLabel)
            .to(0.8, { position: cc.v2(0, -150) })
            .call(() => {
                TipsManager.Instance().putNode(this.node)
            });
        nodeTween.start();
    }

    start() {

    }

    // update (dt) {}
}
