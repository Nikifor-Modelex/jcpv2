const BufferWithPos = require("./bsto/bufferwpos");
const { Utf8, ConstantPoolElement, PoolReference, PoolParsers } = require("./structs/ConstantPool");


function GetAttribute(object, name, pool, AttributeStruct,notjustvalue) {
    const attr = object.Attributes.find(attr => pool[attr.NameIndex] + '' == 'Utf8: ' + name)
    if (!attr) return
    if (!AttributeStruct) return BufferWithPos(attr.Info)
    const struct= new AttributeStruct(BufferWithPos(attr.Info))
    
    return notjustvalue?struct:struct.value


}

function PoolItem(jclass, data, ptype) {
    var strindex = -1
    if (ptype == 'Utf8')
        strindex = jclass.ConstantPool.findIndex(entry => entry?.type == ptype ? entry.value + '' == data : false)
    if (strindex == -1) {
        const [tag,ttype,type] = PoolParsers.find(v=>v[1]==ptype)
        new ConstantPoolElement(jclass.ConstantPool, tag, ttype, new type().fromValue(data), type)
        strindex = jclass.ConstantPool.length - 1
    }

    return strindex
}

module.exports = {
    GetAttribute,
    PoolItem
}