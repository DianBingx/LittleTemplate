import BaseUIForm from "../../UIFrame/BaseUIForm";
import { UIType } from "../../UIFrame/FormType";
import { UIFormType, UIFormShowMode, UIFormLucenyType } from "../../UIFrame/config/SysDefine";
import { GEventManager, Event_Name } from "../../UIFrame/GEventManager";
import TipManage from "../../UIFrame/TipsManager";
import SpriteIndex from "../../UIFrame/SpriteIndex";
import configData from "../../config/configData";
import userData from "../../data/userData"
import { Items } from "../../config/gameEnum";
import UIManager from "../../UIFrame/UIManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonUI extends BaseUIForm {

    ClickMaskClose = false;
    UIType = new UIType(UIFormType.PopUp, UIFormShowMode.Independent, UIFormLucenyType.Translucence);

    @property(cc.Label)
    tips: cc.Label = null;

    @property(cc.Node)
    btnImage: cc.Node = null;

    @property(cc.Node)
    btnImage1: cc.Node = null;

    @property(cc.Node)
    btnImage2: cc.Node = null;

    @property(cc.Node)
    closeBtn: cc.Node = null

    uiData: any = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    /**
     * type  0.一个按钮确定  1.两个按钮一个确定，一个取消
     * tips    文字提示
     * determineCall  确定回调
     * cancelCall  取消回调
     * @param data 
     */
    init(data) {
        this.uiData = data;
        console.log(data)
        this.refreshUI();

        this.closeBtn.active = false;
        // this.scheduleOnce(this.showCloseBtn, 3);
    }

    showCloseBtn() {
        this.closeBtn.active = true;
    }

    refreshUI() {
        this.tips.string = this.uiData.tips;
        if (this.uiData.type == 0) {
            this.btnImage.active = true;
            this.btnImage1.active = false;
            this.btnImage2.active = false;
        } else if (this.uiData.type == 1) {
            this.btnImage.active = false;
            this.btnImage1.active = true;
            this.btnImage2.active = true;
        }
    }

    onClickEvent_determine() {
        this.onEventClick_quitGame();
        this.uiData.determineCall && this.uiData.determineCall();
    }

    onClickEvent_cancel() {
        this.onEventClick_quitGame();
        this.uiData.cancelCall && this.uiData.cancelCall();
    }

    showMsgTip(tip: string) {
        TipManage.Instance().create(tip);
    }

    onEventClick_quitGame() {
        GEventManager.emit(Event_Name.GAME_PLAY_SOUNDS, 'sounds/click');
        this.CloseUIForm();
    }
}
