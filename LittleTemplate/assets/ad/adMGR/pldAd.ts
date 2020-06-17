import * as Fly_wx from './module/wx'
let pldAd ={
    /**
     * 请求后台，进行数据初始化，flyio跨平台请求
     * @param {*} platId 平台名 
     * @param {*} plat  平台命名空间
     * @param {*} pldId  媒体数据
     */
    ctrlData:{

    },
    url:'https://backend.efunent.com/index.php/',
    /** 对应平台存储的localStorage 数据对象
    * 使用对象属性pldData
    * pldData.devId 手机设备号
    */
    localStorage:undefined,
    adUpdateCall:Function,
    isWX:false,
    eventData:{},
    event_cd:10,
    onlineEvent_cd:0,
    onlineEvent:1,

    async init(adMGR,localStorage) {
        let _cc:any=cc
        console.log('pldAd init');
        _cc=cc;
        if(_cc.Global.adSetting.TEST_SERVER=='true'){
            this.url='https://test.efunent.com/index.php/'
        }

        this.adMGR=adMGR
        this.localStorage=localStorage
        localStorage||(console.warn("init admanager时需要引用对应平台localStorage"),localStorage={})
        localStorage["pldData"]||(localStorage["pldData"]={})

        this.onlineEvent_cd=5
        
        this.platId=adMGR.platId
        this.plat=adMGR.plat
        
        let _platId=this.platId
        console.log("进入了",this.platId)

        this.pldId=adMGR.pldId[_platId]


        if (window["wx"])
            this.isWX=true;
        await this.flyioInit().catch(e=>console.warn(e));
        this.getAdDaily();
        await this.UV().catch(e=>console.warn(e));

        
        console.log('pldAd init OK')
        return true
    },

    async flyioInit(){
        let _window:any=window
        this._fly;
        let _this=this
        if(this.isWx){
            this._fly = new Fly_wx()
        }else{
            this._fly = _window.fly
        }

        let url=this.url+'getMixSDKNew?uniqid='+this.pldId.mediaId+'&devid=test'; //广告数据包
        console.log("flyio init",url)
        await this._fly.get(url).then((response)=>{
            let _resData = _this.getResponseData(response)
            let _adData=this.adMGR.adId;
    
            if(response.data.code ==200){ 
                // resData.enc[0].adid    //激励视频
                // resData.ban[0].adid   //banner
                // resData.ins[0].adid    //插屏
                console.log("getMixSDKNew 200")
                let _resKey=["ins","ban","enc","nativeBan","nativeIns","appBox"]
                let _localKey=["insert","banner","video","native","native","appBox"]
                for (let i = 0; i < _resKey.length; i++) {
                    let adKey = (i == 3 && "banner") || (i == 4 && "insert") || "ad";
                    if (_resData[_resKey[i]] && _resData[_resKey[i]].length){
                        
                        for (let j in _resData[_resKey[i]]) {
                            let _adData_raw = _resData[_resKey[i]][j].adid;
                            let _adData_point=_adData[_localKey[i]]
                            // console.log(_adData[_localKey[i]],adKey,_adData_point[adKey])
                            _adData_point[adKey]||(_adData_point[adKey]=[]);
                            _adData_point[adKey][j] = _adData_raw;//banner1 banner2
                        }
                    }
                }
                console.log('_adData', _adData)
            }else{
                console.warn("数据服务器错误",response.data)
            }
        }).catch(e=>console.warn(e))


        for(let k in this.pldId.ctrlId){
            let v=this.pldId.ctrlId[k]
            if(!v)
                continue
            let url=this.url+'getNewSwitch?id='+v +"&version=2S";; //广告数据包
            await this._fly.get(url).then((response)=>{ //获取开关数据
                console.log('response openID')
                let _resData = _this.getResponseData(response)

                let _ctrl=this.ctrlData;
                let _local=this.localStorage.pldData
                if(response.data.code ==200){ 
                    _ctrl[k]={..._resData}; 
                    _local[k]||(_local[k]={})
                }else{
                    console.warn("数据服务器错误",response.data)
                }
            }).catch(e=>console.warn(e))
        }
    },
    async UV(){ //做uv统计
        let devId =this.getData('devId')
        let _this=this

        if(!this.localStorage.pldData.devId){ //先判断有没有这个值，如果有的话就直接返回
            devId = this.randomString(20)//会替换
            this.setData('devId',devId)
        }
        
        let url = this.url+"getLySDK?mediaid="+this.adMGR.UVId + "&devid="+devId||"testId"
        // for test//let url = this.url+"getLySDK?mediaid="+this.adMGR.UVId + "&devid="+devId

        console.log("UV",url)
        //上传 活跃用户
        await this._fly.get(url).then((response)=>{
            let _resData = _this.getResponseData(response)
            console.log('getLySDK',200)
        }).catch(e=>console.warn(e))
    },
    /**上报数据 test
     *  todo_futher:增加 输入data， 合并非重要请求 */
    async eventTest({e_id,e_type=undefined,ad_e_type=undefined,callback=(res)=>{console.log('200',res)}}){
        console.log(e_id,e_type,ad_e_type)
        let devId =this.getData('devId')
        let _this=this
        let url = this.url+"eventStatistics?event_id="
            +e_id+(e_type&&("&event_type="+e_type)||'')+(ad_e_type!==undefined&&("&type="+ad_e_type)||'') + "&devid="+(devId||"testId")
        // for test//let url = this.url+"getLySDK?mediaid="+this.adMGR.UVId + "&devid="+devId

        console.log("UVevent",e_id,e_type,ad_e_type)
        console.log("UVevent",url)
        //上传 活跃用户
        await this._fly.get(url).then((response)=>{
            let _resData = _this.getResponseData(response)
            
            callback(_resData)
        }).catch(e=>console.warn(e))
        
    },
    async onlineEventTest(){
        let devId =this.getData('devId')
        let _this=this
        let url = this.url+"onlineStatistics?sdkswitch_id="
            +this.adMGR.UVId+"&devid="+devId+"&type="+this.onlineEvent;
        this.onlineEvent=2
        this.onlineEvent_cd=5
        // for test//let url = this.url+"getLySDK?mediaid="+this.adMGR.UVId + "&devid="+devId

        console.log("onlineEventTest",url)
        //上传 活跃用户
        await this._fly.get(url).then((response)=>{
            let _resData = _this.getResponseData(response)
            console.log('onlineEventTest_response',_resData)
        }).catch(e=>console.warn(e))
        
    },

    async setEvent(data:{}){
        for(let k in data){
            this.eventData[k]=data[k]
        }
    },
    async requestEvents(){
        return 
        let devId =this.getData('devId')
        let _this=this
        for (let k in this.eventData) {
            let url
            // let url = "https://test.efunent.com/index.php/getLySDK?event_id="
            //     + e_id + e_type && ("&event_type" + e_type) + ad_e_type && ("&type" + ad_e_type) + "&devid=" + devId
            // for test//let url = this.url+"getLySDK?mediaid="+this.adMGR.UVId + "&devid="+devId
            console.log("UVevent", url)
            //上传 活跃用户
            this._fly.get(url).then((response) => {
                let _resData = _this.getResponseData(response)
                console.log('200',_resData)
            }).catch(e => console.warn(e))
        }
        this.event_cd=10
    },
    getResponseData(req){
        let _resData = req.data.data||req.data;

        if( _resData[0]=="{"){
            req.data=JSON.parse(_resData)
            _resData=req.data.data
        }
        return _resData
    },
    randomString(len) { //随机生成字符串
        　　let leng = len || 32;
        　　var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnoprstwxyz123456789';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1 todo?****/
        　　var maxPos = chars.length;
        　　var pwd = '';
        　　for (let i = 0; i < leng; i++) {
        　　　　pwd += chars.charAt(Math.floor(Math.random() * maxPos));
        　　}
        　　return pwd;
    },

    adShow(ctrlKey=undefined,show_complete=false){
        if(!ctrlKey)
        return true
        let _local=this.localStorage["pldData"][ctrlKey]
        if(!_local)
        return true
        console.log('adShow',ctrlKey,show_complete)

        let _ctrl=this.ctrlData[ctrlKey]
        let rand=Math.random()
        if(!_ctrl||
            _ctrl.is_free||
            _ctrl.is_hide||
            _ctrl.show_limit>0&&_local.show>=_ctrl.show_limit||
            _ctrl.close_counts>0&&_local.close>=_ctrl.close_counts||
            _ctrl.show_rate&&_local.show_rate<rand||
            _ctrl.interval>0&&_local.interval_now>0)
            
            {
                console.log('广告限制',ctrlKey,
                _ctrl,!_ctrl&&'ctrlId error'||
                _ctrl.is_free&&'isFree'||
                _ctrl.is_hide&&'isHide'||
                _ctrl.show_limit>0&&_local.show>=_ctrl.show_limit&&'show_limit'||
                _ctrl.close_counts>0&&_local.close>=_ctrl.close_counts&&'close_counts'||
                _ctrl.show_rate&&_local.show_rate<rand&&'random'||
                _ctrl.interval>0&&_local.interval_now>0&&'interval')
                return false
            }
            console.log(_local)
        if(show_complete){
            _local.show++;
            _local.interval_now=_ctrl.interval;
            this.adUpdateCall();
            if(_ctrl.rate>Math.random()){
                return 'force'
            }
        }
        return true
    },
    adClose(ctrlKey,countIsUser=false){
        if(!ctrlKey||countIsUser&&this.adMGR._userClose)
        return this.adMGR._userClose
        console.log('adClose',ctrlKey)
        let _local=this.localStorage["pldData"][ctrlKey]
        if(!_local)
        return this.adMGR._userClose
        _local.close++
        this.adUpdateCall();
        return this.adMGR._userClose
    },
    getAdDaily(){
        console.log("getAdDaily")
        let _local = this.localStorage["pldData"]
        let _ctrl = this.ctrlData

        let _update = false
        if (_local.timestep) {
            if (Date.now() - _local.timestep > 3600 * 24 * 1000) {
                _update = true;
            }
            console.log("_update",_update)
            
        }
        if (_update||!_local.timestep) {
            console.log('getAdDaily update')
            for (let k in _ctrl) {
                _local[k].show = 0;
                _local[k].close = 0;
                _local[k].interval_now = 0
            }
            _local.timestep = Date.now() - Date.now() % (3600 * 24 * 1000)
        }
    },
    getData(key=undefined){

        if(key)
        return this.localStorage["pldData"][key]
        else
        return this.localStorage["pldData"]
    },
    setData(key=undefined,value){
        if(key)
            this.localStorage["pldData"][key]=value
        else
            this.localStorage["pldData"]=value

    }
};

export default pldAd;

