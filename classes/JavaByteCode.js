const BufferWithPos = require("../bsto/bufferwpos")
const { BYTE, DWORD, WORD } = require("../bsto/types")
var { readFileSync } = require('fs')
const { PoolReference, PoolReferencePair } = require("../structs/ConstantPool")
const {format} = require('util')
const { fixedLength } = require("../formats")

class OpcodeDefinition {
    mnemonic
    code
    argbytes
    format
    constructor([mnemonic, code, args]) {
        this.mnemonic = mnemonic
        this.code = code
        this.argbytes = + args.substring(0, args.indexOf(':')),
            this.format = args.substring(args.indexOf(':') + 1, args.length)
    }
    toString() {
        return this.mnemonic
    }
}
const opcodeDataBase = {
    mto: {},
    cto: {}
}
JSON.parse(readFileSync(__dirname+'/../bytecodes.json')).forEach(entry => {
    const Opcode = new OpcodeDefinition(entry)
    opcodeDataBase.mto[Opcode.mnemonic] = Opcode
    opcodeDataBase.cto[Opcode.code] = Opcode
})




class JavaByteCode {
    static types = {
        byte: BYTE,
        short: WORD,
        int: DWORD,
        cpb: BYTE,
        cps: WORD
    }
    static Opcode = class Opcode {
        opcode
        adress
        args
        constructor(opcodes, o, ad, ar) {
            this.opcode = o
            this.adress = ad
            this.args = ar
            opcodes.push(this)
        }
        toString() {
            return this.opcode.mnemonic + ' ' + this.args.join(' ')
        }
        static OpcodeArgument = class OpcodeArgument {
            fromcpool
            value
            constructor(passed, v, c, t) {
                this.value = v
                this.fromcpool = c
                this.type = t
                passed.push(this)
            }
            toString() {
                return (this.fromcpool ? '#' : '') + this.value
            }
        }
    }

    static opcodes = opcodeDataBase

    instructions
    bytes
    #pool


    constructor(buf, pool) {
        this.instructions = []
        this.bytes = buf
        this.#pool = pool
        this.reinterpretBytes()

    }

    reinterpretBytes(){
        this.instructions = []
        this.bytes = BufferWithPos(this.bytes)
        while (this.bytes.pos < this.bytes.length) {
            const adress = this.bytes.pos
            const opcode = JavaByteCode.opcodes.cto[new BYTE(this.bytes).value]
            const args = this.parseOpcodeArgs(opcode, adress)
            //allinstructions.push({ mnemonic: curinstruction.mnemonic, code: curinstruction.code, args: args, instructionAddress: instructionAddress })
            new JavaByteCode.Opcode(this.instructions, opcode, adress, args)
        }
    }
    parseOpcodeArgs(opcode, adress) {
        if (!opcode.argbytes) return []
        const args = opcode.format.split(',')
        const passed = []
        var noloop
        args.forEach(argtype => {
            if (noloop) return
            const type = JavaByteCode.types[argtype]
            if (!type) {
                let hex = this.bytes.subarray(this.bytes.pos, adress + opcode.argbytes).toString('hex')
                this.bytes.pos += hex.length
                new JavaByteCode.Opcode.OpcodeArgument(passed, hex, false, false)
                return noloop = true
            }
            new JavaByteCode.Opcode.OpcodeArgument(
                passed,
                new type(this.bytes).value,
                argtype.startsWith('cp'),
                type
            )


        })
        return passed

    }
    toString() {
        return this.instructions.map(inst => {
            var comment = ''
            var argstr = inst.args.map((arg, i) => {
                if (arg.fromcpool) {
                    const { value, name: ctype, type } = this.#pool[arg.value]
                    comment += `\n// ${i + 1}: <${ctype}> `
                    if (ctype == "String")
                        comment += this.#pool[value.value.Index].value
                    else {

                        if (type == PoolReference)
                            comment += this.#pool[value.Index]
                        if (type == PoolReferencePair) {

                            const { value: {value:nat} } = this.#pool[value.value.NameAndTypeIndex]
                            comment += this.#pool[nat.DescriptorIndex].value + '::' + this.#pool[nat.NameIndex].value

                        }
                    }

                }
                return `${arg.fromcpool ? `#${arg.value}` : arg.value} `
            }).join('')
            if(comment)
                argstr += comment+'\n'
            return `${fixedLength(inst.adress,5)}:    ${inst.opcode.mnemonic} ${argstr}\n`
        }).join('')
    }
    format(f) {
        return format(f,this.toString())
    }
}

module.exports = JavaByteCode