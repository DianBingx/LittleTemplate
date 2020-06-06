

const {ccclass, property} = cc._decorator;

@ccclass
export default class SpriteIndex extends cc.Component {

    @property(cc.SpriteFrame)
    public spriteFrames:cc.SpriteFrame[] = [];
    @property
    public _index:number = 0;
    @property
    get index(){
        return this._index;
    }
    set index(value){
        if(value<0){
            return;
        }
        this._index = value%this.spriteFrames.length;
        let sprite = this.node.getComponent(cc.Sprite);
        sprite.spriteFrame = this.spriteFrames[this._index];
    }

    next(){
        this.index++;
    }
}
