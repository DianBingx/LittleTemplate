
import BaseUIForm from "../../UIFrame/BaseUIForm";
import { UIType } from "../../UIFrame/FormType";
import { UIFormType, UIFormShowMode, UIFormLucenyType } from "../../UIFrame/config/SysDefine";
import TipManage from "../../UIFrame/TipsManager";
import UIManager from "../../UIFrame/UIManager";
import { GEventManager, Event_Name } from "../../UIFrame/GEventManager";
import SoundManager from "../../UIFrame/SoundManager";
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
        let obj = SoundManager.getInstance().getVolumeToLocal();
        if (obj) {
            if (obj.effectVolume > 0) {
                this.setBtnStatus(1, true);
            } else {
                this.setBtnStatus(1, false);
            }
            if (obj.musicVolume > 0) {
                this.setBtnStatus(2, true);
            } else {
                this.setBtnStatus(2, false);
            }
        } else {
            SoundManager.getInstance().init();
            this.refushUI();
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
        let obj = SoundManager.getInstance().getVolumeToLocal();
        if (obj) {
            if (obj.effectVolume > 0) {
                this.setBtnStatus(1, false);
                SoundManager.getInstance().setSoundVolume(obj.musicVolume, 0);
            } else {
                this.setBtnStatus(1, true);
                SoundManager.getInstance().setSoundVolume(obj.musicVolume, 0.3);
            }
        }
    }

    onMusicBtnClick() {
        GEventManager.emit(Event_Name.GAME_PLAY_SOUNDS, 'sounds/click');

        let obj = SoundManager.getInstance().getVolumeToLocal();
        if (obj) {
            if (obj.musicVolume > 0) {
                this.setBtnStatus(2, false);
                SoundManager.getInstance().setSoundVolume(0, obj.effectVolume);
            } else {
                this.setBtnStatus(2, true);
                SoundManager.getInstance().setSoundVolume(0.3, obj.effectVolume);
            }
        }
    }

    onVibrationBtnClick() {
        GEventManager.emit(Event_Name.GAME_PLAY_SOUNDS, 'sounds/click');

        let soundOn = userData.vibrationOn;
        userData.vibrationOn = !soundOn;
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
