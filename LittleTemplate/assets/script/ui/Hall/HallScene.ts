import UIManager from "../../UIFrame/UIManager";
import { GEventManager, Event_Name } from "../../UIFrame/GEventManager";
import SoundManager from "../../UIFrame/SoundManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HallScenes extends cc.Component {

    @property(cc.Node)
    mask: cc.Node = null;

    private scheduleOpen: boolean = false;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
    }

    onEnable() {
        this.registerEvent();
    }

    registerEvent() {
        GEventManager.on(Event_Name.GAME_PLAY_SOUNDS, this.playSounds, this);
        GEventManager.on(Event_Name.GAME_SET_MUSIC_VOLUME, this.setGameMusicVolume, this);
    }

    start() {
        UIManager.GetInstance().ShowUIForms("prefab/hall/HallUI");
    }

    playSounds(str: string) {
        SoundManager.getInstance().playEffectMusic(str);
    }

    setGameMusicVolume() {
        SoundManager.getInstance().setMusicVolume(0.3);
    }

    onDisable() {
        this.offEvent();
    }

    offEvent() {
        GEventManager.off(Event_Name.GAME_PLAY_SOUNDS, this.playSounds, this);
        GEventManager.off(Event_Name.GAME_SET_MUSIC_VOLUME, this.setGameMusicVolume, this);
    }

}
