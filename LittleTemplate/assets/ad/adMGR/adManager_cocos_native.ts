
const { ccclass, property } = cc._decorator;

@ccclass
export default class adManager_cocos_native extends cc.Component {
    @property(cc.Node)
    banner: cc.Node = null;
    @property(cc.Node)
    insert: cc.Node = null;

    styleId: number = 0
    onLoad() {
        let _cc: any = cc;
        _cc.Global.nativeAdMgr = this
    }
    init() {
        let _cc: any = cc;

        let _this = this
        cc.log("adManager_cocos_native_init")

        let _bannerRender = function (_res, force = false) {

            console.log('_bannerRender')
            let UI_ad = _this.banner;
            let UI_ad_icon = UI_ad.children[1];
            let UI_ad_title = UI_ad.children[3];
            let UI_ad_desc = UI_ad.children[4];

            UI_ad = _this.banner;

            let str = _res.icon
            if (!str) {
                console.log("原生广告banner icon url为空")
                return _cc.Global.ad.getNativeAdCallback('banner')('fail')
            }
            // UI_ad_img.getComponent(cc.Sprite).spriteFrame=str
            cc.loader.load(str, function (err, texture) {

                UI_ad_icon.getComponent('cc.Sprite').spriteFrame = new cc.SpriteFrame(texture);
                UI_ad_title.getComponent('cc.Label').string = _res.title;
                UI_ad_desc.getComponent('cc.Label').string = _res.desc;

                _this.banner.children[2].on(cc.Node.EventType.TOUCH_START, _this.nativeBannerClose, _this)
                _this.banner.children[0].on(cc.Node.EventType.TOUCH_START, _this.nativeBannerClick, _this)

                UI_ad.active = true;

            });
            _cc.Global.ad.hideBannerAd()

        }

        let _bannerCall = function (res) {
            console.log("_bannerCall", res)
            if (res == "fail")
                _cc.Global.ad.showBannerAd({
                    key: 'ad',
                    ctrlKey: 'banner'
                })
            if (res == 'close') {
                _cc.Global.ad.adClose('banner', true)
            }
        };

        let _insertRender = function (_res, force = false) {
            console.log("_insertRender")

            let UI_ad;
            let UI_ad_img;
            let UI_ad_title;
            UI_ad = _this.insert;
            UI_ad_img = UI_ad.children[1].children[0] // ./bg/sprite
            UI_ad_title = UI_ad.children[2] // ./title
            UI_ad_title.children[0].getComponent('cc.Label').string = _res.title

            let str = _res.imgUrlList[0]

            // UI_ad_img.getComponent(cc.Sprite).spriteFrame=str
            if (!str) {
                console.log("原生广告插屏 img url为空")
                return _cc.Global.ad.getNativeAdCallback('insert')('fail')
            }

            UI_ad_img.on(cc.Node.EventType.TOUCH_START, _this.nativeInnerClick, _this);
            UI_ad.children[3].on(cc.Node.EventType.TOUCH_START, _this.nativeInnerClick, _this);
            UI_ad_title.children[1].on(cc.Node.EventType.TOUCH_START, _this.nativeInnerClose, _this);

            //不要再loader.load里进行打点行为!!
            cc.loader.load(str, function (err, texture) {
                UI_ad_img.getComponent('cc.Sprite').spriteFrame = new cc.SpriteFrame(texture);
                console.log('0')
                UI_ad.active = true;
            });
            _cc.Global.ad.hideBannerAd()
            _this.nativeBannerCloseAuto()
        }

        let _insertCall = function (res) {
            console.log("_insertCall", res)
            if (res == "fail")
                _cc.Global.ad.showInsertAd({
                    key: 'ad',
                    ctrlKey: 'insert',
                    callback: () => {
                        if (res == 'close')
                            _cc.Global.ad.showNativeAd({
                                key: 'banner',
                                callbackKey: "banner",
                                renderShowKey: "banner",
                                ctrlKey: 'banner'
                            })
                        if (res == "complete") {
                            _cc.Global.ad.hideBannerAd()
                        }
                    }
                })
            else if (res == "close") {
                _cc.Global.ad.adClose('insert', false)
                _cc.Global.ad.showNativeAd({
                    key: 'banner',
                    callbackKey: "banner",
                    renderShowKey: "banner",
                    ctrlKey: 'banner'
                })
            }
        };
        _cc.Global.ad.setNativeAdRenderShow('banner', _bannerRender);
        _cc.Global.ad.setNativeAdRenderShow('insert', _insertRender);
        _cc.Global.ad.setNativeAdCallback('banner', _bannerCall);
        _cc.Global.ad.setNativeAdCallback('insert', _insertCall);


        if (_cc.Global.ad.screen.W <= 1080)
            this.banner.width = _cc.Global.ad.screen.W
        cc.find('Canvas').getComponent("sdkTest").init()
    }
    nativeBannerClick() {
        let _cc: any = cc
        _cc.Global.ad.cilckNativeAd('banner')
    }
    nativeBannerClose(auto = false) {
        console.log("nativeBannerClose")
        let UI = this.banner;
        let _cc: any = cc
        UI.active = false;

        _cc.Global.ad.getNativeAdCallback('banner')('close');//获取key对应的回调方法
        if (!auto)
            _cc.Global.ad.pldAd.adClose('banner')//向后端上报广告数据
    }
    nativeBannerCloseAuto() {
        this.nativeBannerClose(true)
    }
    nativeInnerClick() {
        let _cc: any = cc
        _cc.Global.ad.cilckNativeAd('insert')
    }
    nativeInnerClose() {
        let _cc: any = cc
        let UI = this.insert;
        UI.active = false;
        _cc.Global.ad.getNativeAdCallback('insert')('close');
        console.log("nativeInnerClose")
    }
    setStyleId(i) {
        return
        this.styleId = i

        let UI_ad = this.banner;

        let UI_ad_widget = UI_ad.getComponent(cc.Widget)
        if (!this.styleId) {
            UI_ad_widget.isAlignBottom = true
            UI_ad_widget.isAlignTop = false
            UI_ad_widget.updateAlignment()
        } else {
            UI_ad_widget.isAlignBottom = false
            UI_ad_widget.isAlignTop = true
            UI_ad_widget.updateAlignment()
        }
    }
    // onDisable(){
    //     this._insert.children[2].off(cc.Node.EventType.TOUCH_START,this.nativeBannerClose,this)// ./X
    //     this._insert.children[1].off(cc.Node.EventType.TOUCH_START,this.nativeBannerClick,this)// ./sprite

    //     this._insert.children[1].children[1].off(cc.Node.EventType.TOUCH_START,this.nativeInnerClose,this)// ./title/X
    //     this._insert.children[2].off(cc.Node.EventType.TOUCH_START,this.nativeInnerClick,this)// ./button
    // }
}



