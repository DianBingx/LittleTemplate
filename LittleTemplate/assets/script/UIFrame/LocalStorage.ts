import SingletonClass from "./SingletonClass";


export default class LocalStorage extends SingletonClass {

    public static instance() {
        return super.instance() as LocalStorage
    }

    private _game_key = 'moming_space_love_'

    public setLocal(key: string, value) {
        try {
            if (typeof value == 'object')
                value = JSON.stringify(value)
            cc.sys.localStorage.setItem(this.str_encrypt(this._game_key + key), this.str_encrypt(value, this._game_key + key))
        } catch (e) {

        }
    }

    public getLocal(key: string, defaultValue?) {
        try {
            let result = cc.sys.localStorage.getItem(this.str_encrypt(this._game_key + key));
            if (result == null) {
                return defaultValue
            }
            result = this.str_decrypt(result, this._game_key + key);

            switch (typeof defaultValue) {
                case 'object': {
                    let ret = defaultValue;
                    try {
                        let parse = JSON.parse(result);
                        if (typeof parse === 'object') {
                            ret = parse;
                        }
                    } catch{

                    }
                    return ret;
                }
                case "boolean": {
                    return (result === "true")
                }
                case "number": {
                    return Number(result) || defaultValue;
                }
            }
            return result
        } catch (e) {
            return defaultValue
        }
    }

	/**
	 * 加密函数
	 * @param str 待加密字符串
	 * @returns {string}
	 */
    private str_encrypt(str: string, pwd: string = this._game_key) {
        let pwd_length = 0;
        for (let index = 0, len = pwd.length; index < len; index++) {
            pwd_length += pwd.charCodeAt(index);
        }

        str = str.toString()
        str += pwd;
        let c = String.fromCharCode(str.charCodeAt(0) + str.length * pwd_length);
        for (let i = 1; i < str.length; i++) {
            c += String.fromCharCode(str.charCodeAt(i) + str.charCodeAt(i - 1));
        }
        return encodeURIComponent(c);
    }

	/**
	 * 解密函数
	 * @param str 待解密字符串
	 * @returns {string}
	 */
    private str_decrypt(str: string, pwd: string = this._game_key) {
        let pwd_length = 0;
        for (let index = 0, len = pwd.length; index < len; index++) {
            pwd_length += pwd.charCodeAt(index);
        }
        str = str.toString()
        str = decodeURIComponent(str);
        let c = String.fromCharCode(str.charCodeAt(0) - str.length * pwd_length);
        for (let i = 1; i < str.length; i++) {
            c += String.fromCharCode(str.charCodeAt(i) - c.charCodeAt(i - 1));
        }
        return c.slice(0, c.length - pwd.length);
    }
}
