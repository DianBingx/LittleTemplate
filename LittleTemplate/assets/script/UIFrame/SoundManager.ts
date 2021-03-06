import CocosHelper from "./CocosHelper";

/**
 * 声音管理
 */
export default class SoundManager {
    private static instance: SoundManager = null;
    public static getInstance() {
        if (this.instance == null) {
            this.instance = new SoundManager();
        }
        return this.instance;
    }
    private musicVolume = 0.3;
    private effectVolume = 0.3;
    /** 初始化 */
    public init() {
        let obj = this.getVolumeToLocal();
        if (obj) {
            cc.audioEngine.setMusicVolume(obj.musicVolume);
            cc.audioEngine.setEffectsVolume(obj.effectVolume);
            this.musicVolume = obj.musicVolume;
            this.effectVolume = obj.effectVolume;
        } else {
            this.setSoundVolume(0.3, 0.3);
            this.musicVolume = 0.3;
            this.effectVolume = 0.3;
        }
    }
    /** 播放背景音乐 */
    public async playBackGroundMusic(url: string = 'sound/bgm') {
        if (this.musicVolume == 0) {
            return;
        }
        let sound = await CocosHelper.loadRes(url, cc.AudioClip) as cc.AudioClip;
        cc.audioEngine.playMusic(sound, true);

    }

    /** 播放音效,不用担心会重复loadRes会消耗网络, 有缓存 */
    public async playEffectMusic(url: string) {
        if (!url || url.length === 0) return;
        if (this.effectVolume == 0) {
            return;
        }
        let sound = await CocosHelper.loadRes(url, cc.AudioClip) as cc.AudioClip;
        cc.audioEngine.playEffect(sound, false);
    }

    public stopMusic() {
        cc.audioEngine.stopMusic();
    }

    /** 打开声音 */
    public setSoundVolume(musicVolume?: number, effectVolume?: number) {
        if (musicVolume != undefined) {
            cc.audioEngine.setMusicVolume(musicVolume);
            this.musicVolume = musicVolume;
        }
        if (effectVolume != undefined) {
            cc.audioEngine.setEffectsVolume(effectVolume);
            this.effectVolume = effectVolume;
        }
        this.setVolumeToLocal(cc.audioEngine.getMusicVolume(), cc.audioEngine.getEffectsVolume());
    }

    public setMusicVolume(musicVolume?: number) {
        cc.audioEngine.setMusicVolume(musicVolume);
    }

    /**  */
    public getVolumeToLocal() {
        let objStr = cc.sys.localStorage.getItem("Volume");
        if (!objStr) {
            return null;
        }
        return JSON.parse(objStr);
    }
    /** 保存到本地 */
    public setVolumeToLocal(musicVolume: number, effectVolume: number) {
        let obj = {
            musicVolume: musicVolume,
            effectVolume: effectVolume
        }
        cc.sys.localStorage.setItem("Volume", JSON.stringify(obj));
    }
}