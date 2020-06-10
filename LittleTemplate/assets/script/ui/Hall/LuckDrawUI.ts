
import BaseUIForm from "../../UIFrame/BaseUIForm";
import { UIType } from "../../UIFrame/FormType";
import { UIFormType, UIFormShowMode, UIFormLucenyType } from "../../UIFrame/config/SysDefine";
import { GEventManager, Event_Name } from "../../UIFrame/GEventManager";
import TipManage from "../../UIFrame/TipsManager";
import userData from "../../UIFrame/config/userData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LuckDrawUI extends BaseUIForm {

    ClickMaskClose = false;
    UIType = new UIType(UIFormType.PopUp, UIFormShowMode.Independent, UIFormLucenyType.Translucence);

    @property(cc.Node)
    turntable: cc.Node = null;

    private maxSpeed: number = 8;        //最大速度
    private duration: number = 5;        //减速前旋转时间
    private acc: number = 0.2;           //加速度
    private targetID: number = 0;        //奖励的id   0~5
    private springback: boolean = false; // 旋转结束是否回弹

    private wheelState: number = 0;                 //状态
    private curSpeed: number = 0;
    private spinTime: number = 0;                   //减速前旋转时间
    private gearNum: number = 6;                    //分块
    private defaultAngle: number = 360 / 6 / 2;     //修正默认角度
    private gearAngle: number = 360 / this.gearNum; //每个齿轮的角度
    private finalAngle: number = 0;                 //最终结果指定的角度
    private decAngle: number = 2 * 360;             // 减速旋转两圈

    onLoad() { }

    start() {

    }

    //初始化奖励配置
    init() {
        this.wheelState = 0;
        this.turntable.angle = this.defaultAngle;
    }

    onClickEvent_start() {
        if (this.wheelState !== 0) {
            return;
        }
        this.curSpeed = 0;
        this.spinTime = 0;
        
        this.targetID = 5; //奖励的id   0~5

        this.wheelState = 1;
    }

    update(dt) {
        if (this.wheelState === 0) {
            return;
        }

        cc.log(this.turntable.angle);

        if (this.wheelState == 1) {
            this.spinTime += dt;
            this.turntable.angle = this.turntable.angle + this.curSpeed;
            if (this.curSpeed <= this.maxSpeed) {
                this.curSpeed += this.acc;
            }
            else {
                if (this.spinTime < this.duration) {
                    return;
                }
                cc.log('....开始减速');
                //设置目标角度
                this.finalAngle = 360 - this.targetID * this.gearAngle + this.defaultAngle;
                this.maxSpeed = this.curSpeed;
                if (this.springback) {
                    this.finalAngle += this.gearAngle;
                }
                this.turntable.angle = this.turntable.angle % 360;
                this.wheelState = 2;
            }
        }
        else if (this.wheelState == 2) {
            // cc.log('......减速');
            let curRo = this.turntable.angle;
            let hadRo = curRo - this.finalAngle;
            this.curSpeed = this.maxSpeed * ((this.decAngle - hadRo) / this.decAngle) + 0.2;
            this.turntable.angle = curRo + this.curSpeed;

            if ((this.decAngle - hadRo) <= 0) {
                cc.log('....停止');
                this.wheelState = 0;
                this.turntable.angle = this.finalAngle;
                if (this.springback) {
                    //倒转一个齿轮
                    let act = cc.rotateBy(0.5, -this.gearAngle);
                    let seq = cc.sequence(cc.delayTime(0.3), act, cc.callFunc(this.showRes, this));
                    this.turntable.runAction(seq);
                }
                else {
                    //结束
                    this.showRes();
                }
            }
        }
    }

    showRes() {
        cc.log(this.targetID);
    }

    onClickEvent_quitGame() {
        GEventManager.emit(Event_Name.GAME_PLAY_SOUNDS, 'sounds/click');
        this.CloseUIForm();
    }
}
