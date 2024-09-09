const BufferWithPos = require("../bsto/bufferwpos")
const { BYTE } = require("../bsto/types")

const ClassHeader = require("../structs/ClassHeader")
const ClassFooter = require("../structs/ClassFooter")
const { PoolParsers, ConstantPoolElement } = require("../structs/ConstantPool")
class JavaClass {
    Header
    ConstantPool
    Footer
    #buffer

    constructor(buf) {
        this.#buffer = BufferWithPos(buf)

        this.Header = new ClassHeader(this.#buffer).value
        if (this.Header.Signature != 0xCAFEBABE)
            throw new Error("CAFEBABE signature missing")
        // this.Header.ConstantPoolCount

        this.ConstantPool = [null]
        for (let i = 1; i < this.Header.ConstantPoolCount; i++) {
            let tag = new BYTE(this.#buffer).value
            let type = PoolParsers[tag][2]
            if (!type)
                throw new Error("Unknown constant pool element tag: " + tag+" element #"+i)
            new ConstantPoolElement(this.ConstantPool, tag, PoolParsers[tag][1], new type(this.#buffer), type)

        }

        this.Footer = new ClassFooter(this.#buffer).value



    }
    pool(idx, onlyvalue = true) {
        return onlyvalue ? this.ConstantPool[idx].value.value : this.ConstantPool[idx]
    }
    compile() {
        let bytes = []
        this.Header.ConstantPoolCount = this.ConstantPool.length

        new ClassHeader().fromValue(this.Header).write(bytes)

        this.ConstantPool.forEach((Element, i) => {
            if (i == 0) return
            let type = PoolParsers[Element.tag][2]
            bytes.push(Element.tag)
            new type().fromValue(Element.value.value).write(bytes)
        })

        new ClassFooter().fromValue(this.Footer).write(bytes)

        return Buffer.from(bytes)
    }
}

module.exports = JavaClass