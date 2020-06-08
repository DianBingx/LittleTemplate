import BaseUIForm from "../../UIFrame/BaseUIForm";
import { UIType } from "../../UIFrame/FormType";
import { UIFormType, UIFormShowMode, UIFormLucenyType } from "../../UIFrame/config/SysDefine";
import { GEventManager, Event_Name } from "../../UIFrame/GEventManager";
import TipManage from "../../UIFrame/TipsManager";
import UIManager from "../../UIFrame/UIManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class HallUI extends BaseUIForm {

    ClickMaskClose = false;
    UIType = new UIType(UIFormType.Normal, UIFormShowMode.Normal, UIFormLucenyType.Lucency);

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    onClickEvent_openSign(){
        GEventManager.emit(Event_Name.GAME_PLAY_SOUNDS, 'sounds/click');
        UIManager.GetInstance().ShowUIForms("prefab/hall/SignUI");
    }

    onClickEvent_openSetting(){
        GEventManager.emit(Event_Name.GAME_PLAY_SOUNDS, 'sounds/click');
        UIManager.GetInstance().ShowUIForms("prefab/common/SetUI");
    }

    // update (dt) {}
}
