
const { ccclass, property } = cc._decorator;

@ccclass
export default class LocalStorageData {

    private static instance: LocalStorageData = null;

    public static Instance(): LocalStorageData {
        if (this.instance == null) {
            this.instance = new LocalStorageData();
        }
        return this.instance;
    }

    private userData: any = {
        id: 0,
        name: '666',
        head: '',
        gold: 0,
        astronaut: 0,
    };

    private galaxyData: Array<any> = [];

    setUserData() {
        localStorage.setItem("userData", JSON.stringify(this.userData));
    }

    getUserData() {
        let userData = localStorage.getItem("userData");
        if (userData) {
            this.userData = userData;
        }
    }

    setTypeData(type: string, data: any) {
        this.userData.type = data;
    }

    getGalaxyData() {
        let userData = localStorage.getItem("GalaxyData");
        if (userData) {
            this.userData = userData;
        }
    }

    setGalaxyData() {
        localStorage.setItem("GalaxyData", JSON.stringify(this.galaxyData));
    }

    getIdByGalaxyData(id: number) {
        return this.galaxyData[id];
    }

    setIdByGalaxyData(id: number, data: any) {
        this.galaxyData[id] = data;
    }

}
