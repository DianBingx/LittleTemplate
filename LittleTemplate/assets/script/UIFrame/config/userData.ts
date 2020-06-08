import configData from "../../config/configData";

export default class userData {

    static lastScene: string = '';

    //是否第一次进游戏
    static isFirstTime: boolean = true;

    //是否震动
    static vibrationOn: boolean = false;

    static haveAddZm: boolean = false;

    static userItem = [0];
    static level = [1, 1, 1, 1, 1, 1];
    static levelExplain = [0, 0, 0, 0, 0, 0];

    //每日刷新
    static lastLoginTime: number;
    static closeBanner: number;
    static showInsert: number;

    //新手礼包
    static haveNewGiftBag: boolean = true;
    static todayOpenGiftBagTime: number;

    //每日礼包
    static isDayGiftBagBtn: boolean = true;

    //插入广告观看次数
    static addShowInsert() {
        this.showInsert += 1;
        console.log('showInsert::::' + this.showInsert);
        this.saveLocalData();
    }

    //手动关闭Banner
    static addCloseBanner() {
        this.closeBanner += 1;
        console.log('closeBanner::::' + this.closeBanner);
        this.saveLocalData();
    }
    //添加桌面
    static addZm(ahave: boolean = true) {
        this.haveAddZm = ahave;
        this.saveLocalData();
    }

    //获取物品数量
    static getItemIdByNumber(id) {
        return this.userItem[id];
    }

    //设置物品数量
    static setItemIdNumber(id, num) {
        //上限判断
        var id_str = id + "";
        // let limitNum = configData.itemData[id_str]["quantityLimit"];
        // if (num >= limitNum)
        //     num = limitNum;

        this.userItem[id] = num;
        this.saveLocalData();
    }

    //获取关卡等级
    static getLevel(gameType) {
        let l = this.level[gameType];
        if (!l) {
            this.level[gameType] = 1;
            this.saveLocalData();
            return 1;
        }
        return this.level[gameType];
    }

    //设置关卡等级
    static setLevel(type, num) {
        this.level[type] = num;
        this.saveLocalData();
    }

    static getConfigData() {
        for (let i = 0; i < this.userItem.length; i++) {
            var num = configData.itemData[i]["initialNumber"]
            this.setItemIdNumber(i, num);
        }
    }


    static getLocalData() {
        var userData = cc.sys.localStorage.getItem('userData');
        this.isTodayGetSign();
        if (userData) {
            userData = JSON.parse(userData);
            if (userData.userItem) {
                this.userItem = userData.userItem;
            } else {
                this.getConfigData();
            }

            this.level = userData.Level || [1, 1, 1, 1, 1, 1];
            this.levelExplain = userData.levelExplain || [0, 0, 0, 0, 0, 0];
            this.haveAddZm = userData.haveAddZm || false;
            this.lastLoginTime = userData.lastLoginTime || Date.now();
            this.closeBanner = userData.closeBanner || 0;
            this.showInsert = userData.showInsert || 0;
            this.isFirstTime = false;
            this.vibrationOn = userData.vibrationOn || false;
            this.haveNewGiftBag = userData.haveNewGiftBag;
            this.isDayGiftBagBtn = userData.isDayGiftBagBtn;
            this.todayOpenGiftBagTime = userData.todayOpenGiftBagTime || 0;
        } else {

            this.isFirstTime = true;
            // this.userItem = [0,0,0,0];
            this.getConfigData();
            this.level = [1, 1, 1, 1, 1, 1];
            this.levelExplain = [0, 0, 0, 0, 0, 0];
            this.haveAddZm = false;
            this.lastLoginTime = Date.now();
            this.closeBanner = 0;

            this.vibrationOn = false;

            this.haveNewGiftBag = true;
            this.isDayGiftBagBtn = true;
            this.todayOpenGiftBagTime = 0;
        }

        var isnewday: boolean = false;
        var lgtime = new Date(this.lastLoginTime);
        var lyear = lgtime.getFullYear();
        var lmouh = lgtime.getMonth();
        var lday = lgtime.getDay();

        var ngtime = new Date();
        var nyear = ngtime.getFullYear();
        var nmouh = ngtime.getMonth();
        var nday = ngtime.getDay();
        if (nyear > lyear) {
            isnewday = true;
        } else if (nyear == lyear && lmouh > nmouh) {
            isnewday = true;
        } else if (nyear == lyear && lmouh == nmouh && nday > lday) {
            isnewday = true;
        } else {
            isnewday = false;
        }
        if (isnewday) {
            this.closeBanner = 0;
            this.showInsert = 0;
            this.isDayGiftBagBtn = true;
        }

        this.lastLoginTime = Date.now();
        this.saveLocalData();
        console.log("已经玩过的", JSON.stringify(userData));
    }

    static saveLocalData() {
        var userData = {
            userItem: this.userItem,
            Level: this.level,
            levelExplain: this.levelExplain,
            haveAddZm: this.haveAddZm,
            lastLoginTime: this.lastLoginTime,
            closeBanner: this.closeBanner,
            showInsert: this.showInsert,
            vibrationOn: this.vibrationOn,
            haveNewGiftBag: this.haveNewGiftBag,
            isDayGiftBagBtn: this.isDayGiftBagBtn,
            todayOpenGiftBagTime: this.todayOpenGiftBagTime,
        };
        cc.sys.localStorage.setItem('userData', JSON.stringify(userData));
    }

    static saveSigin(dataName, data) {
        cc.sys.localStorage.setItem(dataName, JSON.stringify(data));
    }

    static loadLocalData(dataName) {
        let dataStr = cc.sys.localStorage.getItem(dataName);
        if (dataStr) {
            let data = JSON.parse(dataStr);
            return data;
        }

        return null;
    }

    static signData = [0, 0, 0, 0, 0, 0, 0];
    static signDay = 0;
    static lastSignTime = Date.now();

    static initSign() {
        this.signData = [0, 0, 0, 0, 0, 0, 0];
        this.signDay = 0;
        this.lastSignTime = Date.now();
    }

    static isTodayGetSign() {

        let data = this.loadLocalData("SignData");
        if (!data) {
            this.initSign();
        }
        else {
            this.signData = data.signData;
            this.signDay = data.signDay;
            this.lastSignTime = data.lastSignTime;
        }

        if (this.lastSignTime != 0) {
            let now = new Date();
            let nowYear = now.getFullYear();
            let nowMonth = now.getMonth();
            let nowDate = now.getDate();

            let awardDate = new Date(this.lastSignTime);
            let year = awardDate.getFullYear();
            let month = awardDate.getMonth();
            let date = awardDate.getDate();

            if (nowYear > year) {
                this.initSign();
            } else if (nowYear == year && nowMonth > month) {
                if ((nowMonth - month) > 1) {
                    this.initSign();
                } else {
                    let nowstamp = new Date().getTime();
                    let stamp = new Date(this.lastSignTime).getTime();
                    let diff_socend = (nowstamp - stamp) / 1000;
                    let diff_day = diff_socend / (24 * 3600);
                    diff_day = Math.ceil(diff_day);
                    let sDay = 7 - this.signDay;
                    if (diff_day > sDay) {
                        this.initSign();
                    } else {
                        this.signDay += diff_day;
                    }
                }

            } else if (nowYear == year && nowMonth == month && nowDate > date) {
                let diff_day = nowDate - date;
                this.signDay += diff_day;
            }
        }
        // this.setSignData();
    }

    static setSignData() {
        let signData = {
            signData: this.signData,
            signDay: this.signDay,
            lastSignTime: this.lastSignTime,
        };
        console.log("签到data", JSON.stringify(signData));
        this.saveSigin('SignData', signData);
    }

}
