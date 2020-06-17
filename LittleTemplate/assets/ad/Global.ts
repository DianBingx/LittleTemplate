// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class Global extends cc.Component {

    onLoad() {
        let _cc: any = cc
        _cc.Global || (_cc.Global = {})
    }

    start() {
        cc.game.addPersistRootNode(this.node)
    }

    update(dt) {
        let _cc: any = cc
        let _pld = _cc.Global.ad.pldAd

        if (_pld.onlineEvent_cd >= 0) {
            _pld.onlineEvent_cd -= dt
            if (_pld.onlineEvent_cd < 0)
                _pld.onlineEventTest()
        }
    }
}
