
import BaseUIForm from "../../UIFrame/BaseUIForm";
import { UIType } from "../../UIFrame/FormType";
import { UIFormType, UIFormShowMode, UIFormLucenyType } from "../../UIFrame/config/SysDefine";
import TipManage from "../../UIFrame/TipsManager";
import UIManager from "../../UIFrame/UIManager";
import { GEventManager, Event_Name } from "../../UIFrame/GEventManager";
import SoundManager from "../../UIFrame/SoundManager";
import SpriteIndex from "../../UIFrame/SpriteIndex";
import userData from "../../UIFrame/config/userData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SetUI extends BaseUIForm {

    ClickMaskClose = false;
    UIType = new UIType(UIFormType.PopUp, UIFormShowMode.Independent, UIFormLucenyType.Translucence);

    @property(cc.Sprite)
    soundNode: cc.Sprite = null;

    @property(cc.Sprite)
    musicNode: cc.Sprite = null;

    @property(cc.Sprite)
    vibrationNode: cc.Sprite = null;

    @property([cc.SpriteFrame])
    musicNodeSF: cc.SpriteFrame[] = [];

    @property([cc.SpriteFrame])
    soundNodeSF: cc.SpriteFrame[] = [];

    @property([cc.SpriteFrame])
    vibrationNodeSF: cc.SpriteFrame[] = [];

    private uiType: number = 0;

    onLoad() {
    }

    start() {
    }

    init(data: number = 0) {
        this.uiType = data;
        this.refushUI();

        // this.scheduleOnce(this.openAd, 0.2);
    }


    refushUI() {
        for (let i = 0; i < 3; i++) {
            let isOn = userData.getSwitchOn(i + 1);
            this.setBtnStatus(i + 1, isOn);
        }
    }

    setBtnStatus(id, isOn) {
        let index = 0;
        if (isOn) index = 1;
        if (id == 1) {
            this.soundNode.spriteFrame = this.soundNodeSF[index];
        } else if (id == 2) {
            this.musicNode.spriteFrame = this.musicNodeSF[index];
        } else if (id == 3) {
            this.vibrationNode.spriteFrame = this.vibrationNodeSF[index];
        }
    }

    onSoundBtnClick() {
        GEventManager.emit(Event_Name.GAME_PLAY_SOUNDS, 'sounds/click');
        let soundOn = userData.getSwitchOn(1);
        userData.setSwitchOn(!soundOn, 1);
        let index = !soundOn ? 1 : 0;
        this.soundNode.spriteFrame = this.soundNodeSF[index];
    }

    onMusicBtnClick() {
        GEventManager.emit(Event_Name.GAME_PLAY_SOUNDS, 'sounds/click');

        let soundOn = userData.getSwitchOn(2);
        userData.setSwitchOn(!soundOn, 2);
        let index = !soundOn ? 1 : 0;
        this.musicNode.spriteFrame = this.musicNodeSF[index];

        if (!soundOn) {
            //播放音乐
            SoundManager.getInstance().playBackGroundMusic();
        } else {
            //关闭
            SoundManager.getInstance().stopMusic();
        }
    }

    onVibrationBtnClick() {
        GEventManager.emit(Event_Name.GAME_PLAY_SOUNDS, 'sounds/click');

       let soundOn = userData.getSwitchOn(3);
        userData.setSwitchOn(!soundOn, 3);
        let index = !soundOn ? 1 : 0;
        this.vibrationNode.spriteFrame = this.vibrationNodeSF[index];
    }

    onClickEvent_quitGame() {
        this.onCloseBtnClick();
    }

    onCloseBtnClick() {
        GEventManager.emit(Event_Name.GAME_PLAY_SOUNDS, 'sounds/click');
        this.CloseUIForm();

        // let _cc: any = cc;
        // _cc.Global.nativeAdMGR.nativeInnerClose();
    }

    openAd() {
        let _cc: any = cc;
        _cc.Global.ad.showNativeAd({ key: 'insert', callbackKey: "insert", renderShowKey: "insert", ctrlKey: 'insert' });
    }

    onEnable() {
        this.registerEvent();
    }

    registerEvent() {

    }

    update(dt) {
    }

    showMsgTip(tip: string) {
        TipManage.Instance().create(tip);
    }

    onDisable() {
        this.offEvent();
    }

    offEvent() {
    }

    onDestroy() { }
}
