export default class SingletonClass {
    protected constructor() { }
    private static _ins: SingletonClass;
    public static instance() {
        if (!this._ins) {
            this._ins = new this;
        }
        return this._ins;
    }
}