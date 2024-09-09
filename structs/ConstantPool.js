const Struct = require('../bsto/struct')

const {
    BYTE,
    WORD,
    DWORD,
    FLOAT,
    QWORD,
    DOUBLE,
    stringBaseClass
} = require('../bsto/types')

class Utf8 extends stringBaseClass {
    static lengthType = WORD
    toString() {
        return this.value.toString('utf8')
    }
}


const PoolReference = Struct.Create({
    Index: WORD
})
const PoolReferencePair = Struct.Create({
    Index: WORD,
    NameAndTypeIndex: WORD
})

const NameAndType = Struct.Create({
    NameIndex: WORD,
    DescriptorIndex: WORD
})

const MethodHandle = Struct.Create({
    Kind: BYTE,
    Index: WORD
})

class ConstantPoolElement{
    tag
    name
    value
    #pool
    constructor(p,t,n,v,ty){
        this.tag=t
        this.type=ty
        this.name=n
        this.value=v
        p.push(this)
    }
    toString(){
        return `${this.name}: ${this.value.toString()}`
    }
}

module.exports = {
    Utf8,
    PoolReference,
    PoolReferencePair,
    NameAndType,
    MethodHandle,
    ConstantPoolElement,
    PoolParsers: [
        //[tag,name,class]
        false,
        [1,  'Utf8',                            Utf8],
        false,
        [3,  'Integer',                        DWORD],
        [4,  'Float',                          FLOAT],
        [5,  'Long',                           QWORD],
        [6,  'Double',                        DOUBLE],
        [7,  'ClassInfo',              PoolReference],
        [8,  'String',                 PoolReference],
        [9,  'FieldRef',           PoolReferencePair],
        [10, 'MethodRef',          PoolReferencePair],
        [11, 'InterfaceMethodref', PoolReferencePair],
        [12, 'NameAndType',              NameAndType],
        false,
        false,
        [15, 'MethodHandle',            MethodHandle],
        [16, 'MethodType',             PoolReference],
        false,
        [18, 'InvokeDynamic',      PoolReferencePair]


    ]
}

