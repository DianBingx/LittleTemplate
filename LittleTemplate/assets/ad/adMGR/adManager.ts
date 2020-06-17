
import pldAd from './pldAd'
declare let cc: any;
declare let window: any;
declare let qg: any;
export default class adManager {
    static platId: 'wx' | 'oppo' | 'vivo' | 'swan' | 'tt' | 'qtt' | 'qq';
    static plat: 'wx' | 'qg' | 'swan' | 'tt' | 'qttGame' | 'qq';
    static adId: any;
    static ad: any = {
        banner: {},
        video: {},
        insert: {},
        native: {},
        appBox: {}
    };
    static pldId: any;
    static UVId: any;

    static screen: any;
    static adId_key: any;
    static pldAd: any = pldAd;
    static limit = false;

    static renderShowFuncs: any = {};
    static nativeCallFuncs: any = {};
    static adCallFuncs: any = {
        banner: {},
        video: {},
        insert: {},
        native: {},
        appBox: {}
    }

    static _userClose = true
    static testPlat = undefined

    static init(adId: any, pldId: any, localStorage: any, isQgPlat = undefined) {

        return (async () => {
            console.log('adManager init')

            if (isQgPlat == "oppo")
                this.platId = 'oppo';
            else if (isQgPlat == "vivo")
                this.platId = 'vivo';

            if (window.qg) {
                this.plat = 'qg';
            }
            if (window.qttGame) {
                this.platId = 'qtt';
                this.plat = 'qttGame';
            }
            if (window.wx) {
                this.platId = 'wx';
                this.plat = 'wx';
            }
            if (window.swan) {
                this.platId = 'swan';
                this.plat = 'swan';
            }
            if (window.tt) {
                this.platId = 'tt';
                this.plat = 'tt';
            }

            if (window.qq) {
                this.platId = 'qq';
                this.plat = 'qq';
            }

            !this.testPlat || this.testPlat != 'null' && (this.platId = this.testPlat);
            this.screen = {};
            this.testPlat == 'null' && this.getScreen();
            this.pldId = pldId || console.warn("mediaAdId json文件未找到")
            if (pldId) {

                this.adId = {
                    banner: {},
                    video: {},
                    insert: {},
                    native: {},
                    appBox: {}
                };
                this.UVId = pldId[this.platId].UVId
                await (this.pldAd.init(this, localStorage)).catch(e => console.warn(e))
                    && (this.limit = true);
            }
            else
                this.adId = adId[this.platId]

            this.adId_key = (this.platId == "vivo") && 'posId' || 'adUnitId'

            console.log("adManager init OK", this.adId_key)
        })()
    }
    static getScreen() {
        console.log('getScreen')
        let _plat: any = this.plat
        if (!_plat) return

        let s: any = {}
        // 获取像素比率/密度
        let b = 1;

        if (_plat == 'qttGame') {
            s.W = cc.view.getVisibleSize().width
            s.H = cc.view.getVisibleSize().height
            s.R = cc.view.getDevicePixelRatio()
        } else {
            s = window[_plat].getSystemInfoSync();
            s.W = s.screenWidth;
            s.H = s.screenHeight;
            s.R = s.pixelRatio;
        }
        this.screen = s
        return this.screen
    }


    static showBannerAd({ key = undefined, callback = e => e, style = undefined, styleId = undefined, ctrlKey = undefined }) {
        let _this = this;
        console.log('BannerAd', key);

        let _pld: any = this.pldAd
        if (!_pld.adShow(ctrlKey))
            return callback('fail')
        let _plat: any = this.plat;
        let _platId = this.platId
        if (!this.adId.banner[key]) {
            key = randomObjKey(this.adId.banner);
        }
        let _id: any = randomObjValue(this.adId.banner[key])
        let _key: any = this.adId_key;
        let _ads: any = this.ad.banner
        let _ad: any = _ads[key]
        styleId = 0
        if (styleId !== undefined) {
            style = this.getBannerAdStyle(styleId)
        }

        let setting: any = {
            [_key]: _id,
        }
        style && (setting.style = style)

        //设置广告回调
        !_this.adCallFuncs['banner'][key] && (_this.adCallFuncs['banner'][key] = {})
        let _callbacks = _this.adCallFuncs['banner'][key]

        //广告调用
        if (_plat == "qttGame") {
            window[_plat].showBanner(style)
            callback('complete')
        } else {
            _ad && (
                _ad.offClose && _callbacks.close && (_ad.offClose(_callbacks.close), 1) ||
                _ad.offHide && _callbacks.hide && _ad.offHide(_callbacks.hide),
                _callbacks.error && _ad.offError(_callbacks.error),
                _callbacks.load && _ad.offLoad(_callbacks.load)
            )
            if (_plat == 'tt')
                _ad && _ad.destroy()

            console.log('BannerAd', setting);
            _ad = window[_plat].createBannerAd(setting)

            _callbacks.close = () => { _pld.adClose(ctrlKey) && callback('close') };
            _callbacks.hide = () => _pld.adClose(ctrlKey, true) && callback('close');
            _callbacks.error = (err) => {
                console.warn('banner ad errer', key, err)
                callback('fail')
            };
            _callbacks.load = () => {
                let _show = _ad && _ad.show();
                return _show && _show.then(res => {
                    console.log('banner ad show', key, res);
                    if (_platId == "vivo") {
                        _ads[key] && _ads[key].hide()
                    }

                    _pld.adShow(ctrlKey, true);
                    callback('complete')
                })
                    .catch(_callbacks.error)
            };

            _ad.onClose && _ad.onClose(_callbacks.close, 1) ||
                _ad.onHide && _ad.onHide(_callbacks.hide);
            // _ad.onError(_callbacks.error)

            if (_plat == "qq")
                setTimeout(() => _callbacks.load().then(() => { _ads[key] = _ad }).catch(_callbacks.error), 500)
            else
                _callbacks.load().then(() => { _ads[key] = _ad }).catch(_callbacks.error);



            // 优先检测是否支持onClose() todo test


        }
    }


    static showVideoAd({ key = undefined, callback = res => res, style = {}, ctrlKey = undefined, autoPlay = true }) {
        console.log('video', key);
        let _plat = this.plat;
        let _this = this
        let _pld: any = this.pldAd
        if (!_pld.adShow(ctrlKey))
            return callback('fail')

        if (!this.adId.video[key]) {
            key = randomObjKey(this.adId.video);
        }
        let _id = randomObjValue(this.adId.video[key])

        let _key = this.adId_key;

        let _ads = this.ad.video;
        let _ad = _ads[key];

        //配置createRewardedVideoAd参数
        let setting = {
            [_key]: _id
        }

        //设置回调
        !_this.adCallFuncs['video'][key] && (_this.adCallFuncs['video'][key] = {})
        let _callbacks = _this.adCallFuncs['video'][key]

        //广告逻辑
        if (_plat == "qttGame") {
            window[_plat].showVideo((res) => {
                if (res == 1) {
                    console.log("video ad show", key)
                    return callback('complete')
                } else if (res == 2) {
                    console.log("video ad show", key)
                    return callback('deny')
                } else {
                    console.log("video ad fail", key)
                    return callback('fail')
                }
            }, style)
        } else {
            if (_ad) {
                _callbacks.load && _ad.offLoad(_callbacks.load);
                _callbacks.close && _ad.offClose(_callbacks.close);
                _callbacks.error && _ad.offError(_callbacks.error);
            }

            _ad = _ad || window[_plat].createRewardedVideoAd(setting);
            _ads[key] = _ad

            _callbacks.close = res => {
                console.log("video close", key, res)
                cc.audioEngine.resumeMusic()
                if (res && res.isEnded)
                    return callback('complete')
                else
                    return callback('deny')
            };
            _callbacks.error = err => {
                _this.showToast('暂无广告')
                cc.audioEngine.resumeAll()
                console.warn('video ad errer', key, err);
                return callback('fail')
            };

            _callbacks.load = () => {
                if (!autoPlay)
                    return callback(_ad)
                let _show = _ad && _ad.show()
                _show && _show.then((res) => {
                    cc.audioEngine.pauseAll()
                    console.log('video ad show', key, res)
                }).catch(_callbacks.error)
            };

            _ad.onClose(_callbacks.close)
            _ad.onError(_callbacks.error)

            if (_plat == 'qg') {
                _ad.onLoad(_callbacks.load)
                _ad.load().catch(_callbacks.error)
            } else {
                _ad.load().then(_callbacks.load).catch(_callbacks.error)
            }
        }
    }
    /** 展示插屏广告，在qtt环境下为贴片广告*/
    static showInsertAd({ key = undefined, callback = res => res, style = {}, ctrlKey = undefined }) {
        console.log('screen', key);

        let _pld: any = this.pldAd
        let _plat: any = this.plat;
        if (!_pld.adShow(ctrlKey))
            return callback('fail')
        if (!window[_plat].createInterstitialAd && !window[_plat].showInterstitialAd) {
            console.log(this.plat, '不支持插屏广告')
            return callback('fail')
        }
        if (!this.adId.insert[key]) {
            key = randomObjKey(this.adId.insert);
        }
        let _id: any = randomObjValue(this.adId.insert[key])
        let _key: any = this.adId_key;
        let _ads: any = this.ad.insert
        let _ad: any = _ads[key]
        let _this = this
        let _screen = this.screen

        //配置createRewardedVideoAd参数
        let setting = {}
        //适配广告Id
        setting[_key] = _id
        console.log(setting)

        //设置回调
        !_this.adCallFuncs['insert'][key] && (_this.adCallFuncs['insert'][key] = {})
        let _callbacks = _this.adCallFuncs['insert'][key]

        //广告逻辑

        if (this.platId == "qtt") {
            !style && (style = {
                x: _screen.W / 2 - 200,
                y: _screen.H - 300,
                w: 400,
                h: 200,
                stage_width: _screen.W,
                stage_height: _screen.H
            });
            _ad = _ad || window[_plat].showInterstitialAd(style);
            window[_plat].hideBanner();
            return
        }
        else {
            if (_ad) {
                _callbacks.close && _ad.offClose(_callbacks.close)
                _callbacks.error && _ad.offError(_callbacks.error)
                _callbacks.load && _ad.offLoad(_callbacks.load)
            }

            if (_plat == 'tt')
                _ad && _ad.destroy()

            _ad = window[_plat].createInterstitialAd(setting)
            _ads[key] = _ad

            _callbacks.close = () => (_pld.adClose(ctrlKey), callback('close'));
            _callbacks.error = err => {
                console.warn('screen ad error', key, err), callback('fail')
            };
            _callbacks.load = () => {
                console.log('screen ad load')
                let _show = _ad && _ad.show();
                _show && _show.then(
                    res => {
                        console.log('screen ad show', key, res);
                        _pld.adShow(ctrlKey, true), callback('complete')
                    })
                    .then(() => { _this.hideBannerAd(); })
                    .catch(_callbacks.error)
            }

            _ad.onClose(_callbacks.close)

            // _ad.onError(_callbacks.error)

            if (_plat == 'qg') {
                _ad.onLoad(_callbacks.load)
                _ad.load().catch(_callbacks.error)
            } else {
                _ad.load && _ad.load().then(_callbacks.load).catch(_callbacks.error) || _callbacks.load()
            }

        };
    }

    static cilckNativeAd(key) {
        let _ad = this.ad.native[key]
        //进入广告&&上报点击行为
        _ad.reportAdClick({ adId: _ad.adId })
        console.log("nativeAdCilcked")
    }

    //OPPO原生广告：自己做的广告UI，通过得到的数据动态生成广告，reportAdClick，reportAdShow的数据统计效果到下一次广告更新前只能上报一次
    /** 展示原生广告(oppo/vivo) */
    static showNativeAd({ key, callbackKey = undefined, renderShowKey = undefined, ctrlKey = undefined }) {
        console.log("native ad", key)

        let _this = this;
        let _pld = this.pldAd
        !_this.adCallFuncs['native'][key] && (_this.adCallFuncs['native'][key] = {})
        let _callbacks = _this.adCallFuncs['native'][key]

        let callback = this.nativeCallFuncs[callbackKey] || (res => console.log('native', key, res))
        let renderShow = this.renderShowFuncs[renderShowKey]

        let _platId = this.platId
        if (!window.qg) {
            console.warn('不支持主动调用原生广告!')
            return callback('fail')
        }
        let _pld_res = this.pldAd.adShow(ctrlKey)
        if (!_pld_res)
            return callback('fail');

        let _ids = this.adId.native[key]
        let _id = _ids && _ids[0]
        let _key = this.adId_key
        if (!_id) {
            console.warn('key对应广告id不存在', key);
            return callback('fail')
        }
        let _ads = this.ad.native;
        let _ad = _ads[key]

        if (_ad) {
            if (_platId == 'oppo') {
                _ad.offLoad()
                _ad.offError()
            } else {
                _callbacks.load && _ad.offLoad(_callbacks.load);
                _callbacks.error && _ad.offError(_callbacks.error)
            }
        }

        _ad = qg.createNativeAd({
            [_key]: _id
        })
        _ads[key] = _ad

        _callbacks.error = (res) => {
            console.warn("原生广告加载失败", key, res);
            //todo res = 108 时用下一个ID
            // 这个数据拿不到就拿下一个的，除非拿空了
            if (_ids && _ids.length && res.code == 108) {
                console.warn("原生广告加载 重试");
                _ids.shift();
                _this.showNativeAd({ key: key, callbackKey: callbackKey, renderShowKey: renderShowKey, ctrlKey: ctrlKey })
            }
            return callback('fail');
        }
        _callbacks.load = res => {

            console.log("原生广告加载");
            //onLoad只返回广告数据(对象)而不显示广告,需要自己做广告位
            let _res = res.adList[0];
            if (!_res) {
                console.log('res 获取错误')
                return callback('fail');
            }
            //上报显示广告行为

            _ad.adId = _res.adId;

            //img https=>http
            let str = _res.imgUrlList;
            //http协议得到的URL地址
            str && str[0][4] == "s" && str[0][4].replace("s", "");
            //icon https=>http
            str = _res.icon;
            str && str[4] == "s" && str[4].replace("s", "");
            _res.icon = str;
            let _pld_res = _pld.adShow(ctrlKey, true);

            console.log('_pld_res', _pld_res)
            if (!_pld_res) {
                return
            }
            console.log('_res', _res)

            renderShow && renderShow(_res, _pld_res == 'force');
            _ad.reportAdShow({ adId: _res.adId });
            callback('complete')
            _this.hideBannerAd()
            res.adList.pop();
        }

        _ad.onError(_callbacks.error)
        _ad.onLoad(_callbacks.load)

        if (this.platId == "vivo")
            return
        let _load = _ad && _ad.load()
        _load && _load.catch(_callbacks.error)
    }
    /*注册原生广告渲染方法*/
    static setNativeAdRenderShow(key, f) {
        if (!key) {
            return console.log('setNativeAdRender bad key', key)
        }
        this.renderShowFuncs[key] = f
    }
    /*注册原生广告回调方法*/
    static setNativeAdCallback(key, f) {
        if (!key) {
            return console.log('setNativeAdCallback bad key', key)
        }
        this.nativeCallFuncs[key] = f
    }
    /*拉取原生广告回调方法*/
    static getNativeAdCallback(key) {
        if (!key || !this.nativeCallFuncs[key]) {
            console.log('getNativeAdCallback bad key', key)
            return () => { }
        }
        return this.nativeCallFuncs[key]
    }
    static showToast(str) {
        let _plat = this.plat;
        let opt: any = (this.platId == 'vivo') && { message: str } || { title: str }

        if (this.platId == 'qq')
            opt.icon = 'error'

        if (!opt)
            return
        window[_plat].showToast(opt);
    }

    static showAppBoxAd({ key, callbacks = e => e, ctrlKey = undefined }) {
        console.log('AppBox ad', key)
        let _pld = this.pldAd

        let _id = randomObjValue(this.adId.appBox[key])

        let _ads = this.ad.appBox;
        let _ad = _ads[key]

        !this.adCallFuncs['appBox'][key] && (this.adCallFuncs['appBox'][key] = {})
        let _callbacks = this.adCallFuncs['appBox'][key]

        if (_ad) {
            _callbacks.close && _ad.offClose(_callbacks.close)
            // _callbacks.error&& _ad.offError(_callbacks.error)
            // _callbacks.load&& _ad.offLoad(_callbacks.load)
        }

        _ad = window[this.plat].createAppBox({ adUnitId: _id });

        _callbacks.close = () => _pld.adClose(ctrlKey);
        _callbacks.error = err => {
            console.warn('AppBox ad errer', key, err)
        };
        _callbacks.load = () => {
            _ad.show()
                .then(() => {
                    console.log('AppBox ad show'); _pld.adShow(ctrlKey, true)
                })
                .catch(_callbacks.error)
        }

        _ad.onClose(_callbacks.close)
        // _ad.onError(_callbacks.error)
        // _ad.onLoad(_callbacks.load)

        _ad.load().then(_callbacks.load).catch(_callbacks.error)
    }

    /**得到默认style 部分平台无效*/
    static getBannerAdStyle(id: number) {
        let _screen = this.screen
        let _platId = this.platId
        let style = null;
        let isPortrait = _screen.W < _screen.H
        console.log("styleId", id)
        if (_platId == "qq") {
            if (id === 0) {
                isPortrait ?
                    style = {
                        top: _screen.H - _screen.W / 4,
                        left: 0,
                        width: _screen.W
                    } :
                    style = {
                        top: _screen.H - _screen.W / 8,
                        left: _screen.W / 4,
                        width: _screen.W / 2
                    }
            }
            if (id === 1)
                isPortrait ?
                    style = {
                        top: 0,
                        left: 0,
                        width: _screen.W
                    } :
                    style = {
                        top: 0,
                        left: _screen.W / 4,
                        width: _screen.W / 2
                    }
        } else if (_platId == "tt") {
            //banner style 推荐 width 200   
            if (id === 0)
                style = {
                    width: 200,
                    top: _screen.H - 113,
                    left: _screen.W / 2 - 100
                }
            if (id === 1)
                style = {
                    width: 200,
                    top: 0,
                    left: _screen.W / 2 - 100
                }
        } else if (_platId == 'oppo' || _platId == 'vivo') {
            //banner默认 高度100，宽度700 vivo默认下部居中   
            if (id === 1)
                style = {
                    top: 0,
                    left: (_screen.W - 700) / 4
                };

        } if (_platId == 'qtt') {
            if (id === 1)
                style = {
                    index: 0
                };

        }
        return style
    }
    /**隐藏所有banner广告 不计入用户关闭*/
    static hideBannerAd() {

        let _ad = this.ad.banner

        if (!_ad) {
            console.warn('hideAd fail:no banner ad')
            return;
        }
        this._userClose = false
        try {
            for (let k in _ad) {
                console.log("hide");
                let _hide = _ad[k].hide();

                // oppo平台不会触发下面的逻辑
                _hide && _hide.then(() => {
                    console.log("系统banner广告hide");
                }).catch(err => {
                    console.log("hideAd fail", err);
                })
            }
        } catch (e) {
            console.warn(e)
        } finally {
            this._userClose = true
            return
        }
    }
    /**创建桌面图标*/
    static installShortcut(callback = e => e) {
        console.log("installShortcut");
        window['qg'] && window['qg'].installShortcut({
            success: function () {
                console.log("创建桌面成功");
                // 执行用户创建图标奖励
                callback('success')
            },
            fail: function (err) {
                console.warn("创建桌面失败", err);
                callback('fail')
            },
            complete: function () {
                callback('complete')
            }
        })
    }
    /**判断桌面图标有无创建*/
    static hasShortcutInstalled(callback = e => e) {
        console.log("hasShortcutInstalled");
        window['qg'] && window['qg'].hasShortcutInstalled({
            success: function (res) {
                console.log("hasShortcutInstalled", res);
                // 判断图标未存在时，创建图标
                callback(res.toString())
            },
            fail: function (err) {
                console.warn("寻找快捷方式失败", err);
                callback('fail')
            },
            complete: function () {
                callback('complete')
            }
        })
    }
    static event(key) {
        let _pld = this.pldAd
        let eventId = this.pldId[this.platId] && this.pldId[this.platId]['eventId'] && this.pldId[this.platId]['eventId'][key]
        _pld.eventTest({
            e_id: eventId,
            e_type: "1"
        })
    }
    static eventAd(key, type, res) {
        let _pld = this.pldAd
        let eventId = this.pldId[this.platId] && this.pldId[this.platId]['eventId'] && this.pldId[this.platId]['eventId'][key]
        let list = ['fail', 'complete', 'close'];
        if (type == 'video')
            list = ['fail', 'deny', null, 'complete']

        let n = list.indexOf(res) + 1
        _pld.eventTest({
            e_id: eventId,
            e_type: "2",
            ad_e_type: n
        })
    }
    static onlineEvent() {
        this.pldAd.onlineEvent()
    }
    static adShow(ctrlKey = undefined, show_complete = false) {
        return this.pldAd.adShow(ctrlKey, show_complete)
    }
    static adClose(ctrlKey, countIsUser = false) {
        return this.pldAd.adShow(ctrlKey, countIsUser)
    }
}
