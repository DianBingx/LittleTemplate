import userData from "../../UIFrame/config/userData";
import SoundManager from "../../UIFrame/SoundManager";
import configData from "../../config/configData";
import { GEventManager, Event_Name } from "../../UIFrame/GEventManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoginScene extends cc.Component {

    @property(cc.ProgressBar)
    gamepro: cc.ProgressBar = null;

    @property(cc.Label)
    loadtxt: cc.Label = null;

    @property(cc.Node)
    btnStartGame: cc.Node = null;

    @property([cc.SpriteFrame])
    btnSpriteFrame: cc.SpriteFrame[] = [];

    private tpro: number = 0;

    private maskTween: cc.Tween = null;

    onLoad() {
        this.btnStartGame.parent.active = false;
        if (!userData.lastScene) {
            this.gamepro.node.parent.active = true;
            this.startLoad();
        } else {
            this.gamepro.node.parent.active = false;
            this.btnStartGame.parent.active = true;
            this.playBtnTween();
        }

    }

    start() {

    }

    startLoad() {
        this.tpro = 0;
        //获取用户数据
        userData.getLocalData();

        this.tpro += 0.1;

        this.preloadScene('Hall');

        this.loadResPro("sounds");
    }

    loadResPro(url) {
        cc.loader.loadResDir(url, this.loadProgress.bind(this), this.loadComplete.bind(this));
    }

    preloadScene(name) {
        cc.director.preloadScene(name, this.loadProgress.bind(this), this.loadComplete.bind(this));
    }

    loadProgress(completedCount: number, totalCount: number, item: any) {
        // console.log("资源加载中",completedCount,totalCount,item);
    }

    loadComplete(error: Error, resource: any[], urls: string[]) {
        // console.log("资源加载完毕",error,resource,urls);
        this.tpro += 0.45;
    }

    update(dt) {
        if (!this.gamepro.node.parent.active) {
            return;
        }
        if (this.tpro > 1) {
            this.tpro = 1;
        }
        this.changeShowPro();
    }

    changeShowPro() {
        this.loadtxt.string = Math.floor(this.tpro * 100) + "%";
        this.gamepro.progress = this.tpro;
        if (this.tpro >= 1) {
            this.gamepro.node.parent.active = false;
            this.btnStartGame.parent.active = true;
            this.playBtnTween();
            this.node.on(cc.Node.EventType.TOUCH_START, this.onClickEvent_startGame, this);

        }
    }

    playBtnTween() {
        this.maskTween = cc.tween(this.btnStartGame)
            .to(1, { opacity: 0 })
            .to(1, { opacity: 255 })
            .call(() => { this.playBtnTween(); });

        this.maskTween.start();
    }

    onClickEvent_startGame() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onClickEvent_startGame, this);
        this.clickPlayBtnTween();
        userData.lastScene = 'Login';
        cc.director.loadScene("Hall");

    }

    clickPlayBtnTween() {
        this.maskTween.stop();
        this.btnStartGame.opacity = 255;
        let btnTween = cc.tween(this.btnStartGame);
        for (let i = 0; i < 5; i++) {
            btnTween.call(() => {
                let sprit = this.btnStartGame.getComponent(cc.Sprite);
                sprit.spriteFrame = this.btnSpriteFrame[i % 2];
            });
            btnTween.delay(0.1);
        }
        btnTween.start();
    }
}
