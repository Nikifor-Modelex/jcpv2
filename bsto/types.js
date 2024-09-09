class typeBaseClass {
    static length
    constructor(arg1) {
        if (arg1 instanceof Buffer) // if a buffer is provided into constructor, it reads immediately
            this.read(arg1)
    }
    value // deserialized value of the structure
    length() {
        if (this.__proto__.constructor.length !== false) // if structure has static length
            return this.__proto__.constructor.length      // it returns that static length
    }
    read(buffer) {
        buffer.pos += this.length() // quite obvious
    }
    fromValue(value) {
        this.value = value
        return this
    }
    write(buffer) { } // to be implemented

}



class BYTE extends typeBaseClass {
    constructor(a) { super(a) }
    static length = 1
    read(buffer) {
        this.value = buffer[buffer.pos]
        buffer.pos++
    }
    write(buffer) { buffer.push(this.value) }
}

function compileUIntBE(buffer, bytes, value) {
    for (let b = 1; b < bytes + 1; b++) {
        let power = 2 ** (8 * (bytes - b))
        let rem = value % power
        buffer.push((value - rem) / power)
        value = rem
    }
}


class intBaseClass extends typeBaseClass {
    constructor(a) { super(a) }
    static readfunc
    read(buffer) {
        this.value = buffer[this.__proto__.constructor.readfunc](buffer.pos) // reads a specific type of a number based on the readfunc property
        // it is a foreign key to a method in Buffer class
        buffer.pos += this.length()
    }
    write(buffer) { 
        if(this.__proto__.constructor.writefunc){
            let temp=Buffer.alloc(this.length())
            temp[this.__proto__.constructor.writefunc](this.value)
            buffer.push(...temp)
        }
        else compileUIntBE(buffer, this.length(), this.value) 
    }

}

// WORDs of different sizes

class WORD extends intBaseClass {
    static readfunc = 'readUInt16BE'
    static length = 2
    static LE = class WORDLE extends WORD {
        static length = 2
        static readfunc = 'readUInt16LE'
    }
}

class DWORD extends intBaseClass {
    static readfunc = 'readUInt32BE'
    static length = 4
    static LE = class DWORDLE extends DWORD {
        static length = 4
        static readfunc = 'readUInt32LE'
    }
}


class QWORD extends intBaseClass {
    static readfunc = 'readBigUInt64BE'
    static length = 8
    static LE = class DWORDLE extends DWORD {
        static length = 8
        static readfunc = 'readBigUInt64LE'
    }
}

class FLOAT extends intBaseClass {
    static readfunc = 'readFloatBE'
    static writefunc = 'writeFloatBE'

    static length = 4
    static LE = class FLOATLE extends FLOAT {
        static length = 4
        static readfunc = 'readFloatLE'
        static writefunc = 'writeFloatLE'

    }
}

class DOUBLE extends intBaseClass {
    static readfunc = 'readDoubleBE'
    static writefunc = 'writeDoubleBE'
    static length = 8
    static LE = class DOUBLELE extends DOUBLE {
        static length = 8
        static readfunc = 'readDoubleLE'
        static writefunc = 'writeDoubleLE'
    }
}



class stringBaseClass extends typeBaseClass {
    static length = false
    static lengthType = BYTE
    constructor(a) { super(a) }
    length() {
        return this.value.length
    }
    read(buffer) {
        let length = new (this.__proto__.constructor.lengthType)(buffer).value;
        this.value = buffer.subarray(buffer.pos, buffer.pos + length);
        buffer.pos += length
    }
    write(buffer) {
        compileUIntBE(buffer, this.__proto__.constructor.lengthType.length, this.length())
        buffer.push(...this.value)
    }
}


module.exports = {
    typeBaseClass,
    BYTE,
    WORD,
    DWORD,
    QWORD,
    FLOAT,
    DOUBLE,
    stringBaseClass

}