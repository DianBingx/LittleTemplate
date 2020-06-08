
import BaseUIForm from "../../UIFrame/BaseUIForm";
import { UIType } from "../../UIFrame/FormType";
import { UIFormType, UIFormShowMode, UIFormLucenyType } from "../../UIFrame/config/SysDefine";
import { GEventManager, Event_Name } from "../../UIFrame/GEventManager";
import TipManage from "../../UIFrame/TipsManager";
import userData from "../../UIFrame/config/userData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SignUI extends BaseUIForm {

    ClickMaskClose = false;
    UIType = new UIType(UIFormType.PopUp, UIFormShowMode.Independent, UIFormLucenyType.Translucence);

    @property([cc.Node])
    signdays: cc.Node[] = [];

    @property(cc.Button)
    btnSign: cc.Button = null;

    private btnMask: boolean = false;

    onLoad() { }

    start() {
        if (userData.signData[userData.signDay] == 1) {
            this.btnSign.interactable = false;
            this.btnSign.enableAutoGrayEffect = true;
        } else {
            this.btnSign.interactable = true;
            this.btnSign.enableAutoGrayEffect = false;
        }
    }

    init() {
        let signData = userData.signData;
        this.initSignUI(signData);
    }

    initSignUI(signData) {
        let signDay = userData.signDay;
        for (let i = 0; i < signData.length; i++) {
            let item = this.signdays[i];
            let image = item.getChildByName('image').getComponent(cc.Sprite);
            let num = item.getChildByName('number').getComponent(cc.Label);
            let mask = item.getChildByName('mask');
            let Receive_text = item.getChildByName('Receive_text');
            let buqian = item.getChildByName('buqian');
            let jinri = item.getChildByName('jinri');
            jinri.active = false;
            mask.active = false;
            Receive_text.active = false;
            buqian.active = false;
            if (signDay > i) {
                mask.active = true;
                if (signData[i] == 1) {
                    buqian.active = false;
                    Receive_text.active = true;
                } else {
                    buqian.active = true;
                }
            } else if (signDay == i) {
                if (signDay == i) {
                    jinri.active = true;
                    if (signData[i] == 1) {
                        this.btnSign.interactable = false;
                        this.btnSign.enableAutoGrayEffect = true;
                    } else {
                        this.btnSign.interactable = true;
                        this.btnSign.enableAutoGrayEffect = false;
                    }
                }
                if (signData[i] == 1) {
                    mask.active = true;
                    Receive_text.active = true;
                }
            }
        }
    }

    //补签
    onclickEvent_SignAgain(event: Event, customEventData: string) {
        GEventManager.emit(Event_Name.GAME_PLAY_SOUNDS, 'sounds/click');
        if (this.btnMask) {
            return;
        }
        this.btnMask = true;

        let btnId = (Number)(customEventData.substr(-1));
        // this.addItem(configData.rewardData[btnId - 1].itemId, configData.rewardData[btnId - 1].itemValue);
        userData.signData[btnId - 1] = 1;
        userData.setSignData();
        this.init();
        this.showMsgTip("补签成功");
        this.btnMask = false;

        // let _cc: any = cc;
        // _cc.Global.ad.showVideoAd({
        //     key: 'ad', callback: function (str) {
        //         //看完视频回调加
        //         if (str == 'complete') {
        //             //看视频补领取
        //             var btnId = (Number)(customEventData.substr(-1));
        //             this.addItem(configData.rewardData[btnId - 1].itemId, configData.rewardData[btnId - 1].itemValue);
        //             this.isSignAgain = true;
        //             this.isNormalGet = false;
        //             this.getAward(1, btnId);
        //             this.showMsgTip("补签成功");
        //         } else if (str == 'deny') {
        //             this.showMsgTip("补签失败");
        //         } else {
        //             this.showMsgTip("补签失败");
        //         }
        //     }.bind(this)
        // });
    }

    onclickEvent_GetAward() {
        GEventManager.emit(Event_Name.GAME_PLAY_SOUNDS, 'sounds/click');

        if (this.btnMask) {
            return;
        }
        this.btnMask = true;

        // this.addItem(configData.rewardData[this.todayGetBtnId - 1].itemId, configData.rewardData[this.todayGetBtnId - 1].itemValue);
        userData.signData[userData.signDay] = 1;
        userData.lastSignTime = Date.now();
        userData.setSignData();
        this.init();
        let data = {
            type: 1,
            id: 1,
            num: 0,
            call: function () {
                this.btnMask = false;
                this.CloseUIForm();
            }.bind(this)
        };
        GEventManager.emit(Event_Name.GAME_ADD_PROP_UI, data);
        this.btnMask = false;
    }

    addItem(id, num) {
        userData.setItemIdNumber(id, userData.getItemIdByNumber(id) + num);
        GEventManager.emit(Event_Name.GAME_REFRESH_ITEM, null);
    }

    // update (dt) {}

    showMsgTip(tip) {
        TipManage.Instance().create(tip);
    }

    onClickEvent_quitGame() {
        GEventManager.emit(Event_Name.GAME_PLAY_SOUNDS, 'sounds/click');
        this.CloseUIForm();
    }
}
