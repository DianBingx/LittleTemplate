
enum TestPlat {
    'null' = -1,
    'tt' = -1,
    'qq' = -1,
    'oppo' = -1,
    'vivo' = -1,
    'qtt' = -1,
}
enum TestSwitch {
    'true' = -1,
    'false' = -1,
}
/**COCOS编辑H5广告专用 */
/**
 * 使用说明:
 * 1:放入全局节点中，组件属性引入ad.json(广告Id数据) pldId.json(media/app Id等) ,调用this.init([存入localStorage的对象]).暂用全局变量cc.Global.ad方便调用与测试
 * 2:showBannerAd()、showVideoAd()、showInsertAd()、showNativeAd(),
 *      输入{key, callback,style,ctrlKey}
 *      key：广告标签，native包含banner和insert,其他默认为default
 *      callback:完成广告回调参数，看完视频广告回调callback('complete'),取消视频广告回调callback('deny'),广告调用失败回调callback('fail')
 *      style：广告布局，参考小游戏平台广告需求的style对象
 *      ctrlId:广告位Id，用于调取对应的广告策略配置
 *      如：cc.Global.ad.showBannerAd({key:default,ctrlKey="banner"})
 * 3:oppo/vivo原生广告需要设置renderShow方法 用于在获取原生广告之后渲染并显示自己的原生广告位 关闭按钮 需要调用cc.Global.ad.pldAd.closeAd([广告位Id]),根据得到的广告控制数据实装几率误点
 * 4:游戏启动时需要通过cc.Global.ad.getAdCtrlInterval()、cc.Global.ad.setAdCtrlInterval()
 * 4:如测试报错,参考log中对应平台错误代码,检查json配置是否正确,检查是否联网并确认对应平台的广告规则。测试时 no ad 是正常现象，清理平台缓存,改变手机系统时间等
 */

import adManager from './adManager'
const { ccclass, property } = cc._decorator;

@ccclass
export default class adManager_cocos extends cc.Component {

    @property(cc.JsonAsset)
    sdkSetting: cc.JsonAsset = null;
    
    @property({ type: cc.Enum(TestPlat), tooltip: "设置模拟平台以测试拉取的广告数据，真机测试时设置为null" })
    TEST_PLAT: TestPlat = TestPlat.null
    
    @property({ type: cc.Enum(TestSwitch), tooltip: "设置后台为测试服" })
    TEST_SERVER: TestSwitch = TestSwitch.false
    
    @property({ tooltip: "设置localStorage的键值" })
    storageName: string = "adData"

    // @property(cc.JsonAsset)
    ad: cc.JsonAsset = null;

    adData: any = null;
    limit: boolean;
    
    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        let _cc: any = cc
        console.log('onLoad adMgr')
        _cc.Global || (_cc.Global = {});
        _cc.Global.ad = adManager;
        _cc.Global.adSetting = this;//声明全局变量

        let _data = _cc.sys.localStorage.getItem(this.storageName) && JSON.parse(cc.sys.localStorage.getItem(this.storageName))

        !_data && (_data = {});
        !_data.pldData && (_data.pldData = {});

        this.init(_data)
    }
    /**入口函数 */
    init(localStorage) {
        let _ad = this.ad && this.ad.json;
        let _pldId = this.sdkSetting && this.sdkSetting.json;
        let _this = this;
        let _cc: any = cc
        let _pld = _cc.Global.ad.pldAd
        adManager.testPlat = TestPlat[_this.TEST_PLAT]
        let _start = async () => {//异步完成初始化参数
            let isQgPlat = undefined
            if (cc.sys.platform == (<any>cc.sys).VIVO_GAME || TestPlat[_this.TEST_PLAT] == "vivo")
                isQgPlat = "vivo"
            if (cc.sys.platform == (<any>cc.sys).OPPO_GAME || TestPlat[_this.TEST_PLAT] == "oppo")
                isQgPlat = "oppo"
            /**adManager.init(_ad, _pldId, localStorage, isQgPlat) _pldId为对应pldId.json,localStorage为本地存储，isQgPlat为检测是否为oppo/vivo平台*/
            await adManager.init(_ad, _pldId, localStorage, isQgPlat).then(() => {
                adManager.pldAd.adUpdateCall = () => {
                    _this.adData = localStorage
                    cc.sys.localStorage.setItem(_this.storageName, JSON.stringify(_this.adData))
                    console.log("saveData OK")

                };
                adManager.pldAd.adUpdateCall();

                _this.node.getComponent('adManager_cocos_native').init();//生成原生广告

            }).catch(e => console.warn(e));
        }
        _start()
        console.log('onLoad adMgr OK')
    }
    update(dt) {
        let _pld = adManager.pldAd

        if (_pld.localStorage && _pld.localStorage.pldData) {
            let _data = _pld.localStorage.pldData//开启计时器


            //广告间隔
            for (let k in _data) {
                _data[k] && _data[k].interval_now > 0 && (_data[k].interval_now -= dt)
            }

            // 批量发送请求间隔
            // if(_pld.event_cd>=0){
            //     _pld.event_cd-=dt
            //     if(_pld.event_cd<0)
            //         _pld.requestEvents()
            // }
        }
    }
}
