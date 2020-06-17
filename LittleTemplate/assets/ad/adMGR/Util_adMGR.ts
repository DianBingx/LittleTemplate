
var _globalThis=window||globalThis;
/**随机得到一个可遍历的对象的param*/
var randomObjKey=(o)=>{
    if (typeof o != 'object')
        return o
    let o_key = []
    for (let k in o) {
        o_key.push(k)
    }
    return o_key[Math.floor(Math.random() * o_key.length)]
};
_globalThis.randomObjKey=randomObjKey;
/**随机得到一个可遍历的对象的value*/
var randomObjValue=(o)=>{
    if (typeof o != 'object')
        return o
    let o_key = []
    for (let k in o) {
        o_key.push(k)
    }
    return o[o_key[Math.floor(Math.random() * o_key.length)]]
};
_globalThis.randomObjValue=randomObjValue;
/**创建可选链，并检测路径是否可用*/
var toOptionChain=function(o,...key){
    for(let i=0;i<key.length;i++){
        if(!key[i]||i==key.length-1)
            break;
        if(!o[key[i]])
            o[key[i]]={}
        o=o[key[i]]
    }
    if(JSON.stringify(o) == "{}"||!o){
        return false
    }
    return true
}
_globalThis.toOptionChain=toOptionChain;

/**从数组中选中多个随机元素*/
var randomArrayElemengts=function(array,n,raw=false):Array<any>{
    if(n<1){
        console.log('use other random funcs')
        return []
    }
    let _array=array;
    if(!raw)
    _array=array.concat()
    
    let res=[]
    let l=array.length
    if(n>l)
    return array
    for(let i=n;i>0;i--){
        res.push(_array.splice(~~(Math.random()*l),1)[0]);
        l--
    }
    return res
}
_globalThis.randomArrayElemengts=randomArrayElemengts;

var shuffle=function(arr) {
    let _arr=[...arr]
    let length = _arr.length,
        r      = length,
        rand   = 0;

    while (r) {
        rand = Math.floor(Math.random() * r--);
        [_arr[r], _arr[rand]] = [_arr[rand], _arr[r]];
    }
    return _arr;
}
_globalThis.shuffle=shuffle;
