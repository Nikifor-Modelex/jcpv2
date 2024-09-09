// I will properly comment it later
class Struct {
    constructor(d,...args){
        this.descriptor=d
        this.extra=[...args]
    }
    /**
     * 
     * @param {*} fields 
     * @returns Class
     */
    static Create(fields,methods) {
        var length = 0
        for (var field in fields)
            length += fields[field] instanceof Array ?
                fields[field][1].length * fields[field][0] //data type size x array size
                : fields[field].length

        class CustomStructure extends Struct {
            constructor(arg1) {
                super()
                if (arg1 instanceof Buffer)
                    this.read(arg1)
                for(var method in methods)
                    this[method]=methods[method].bind(this)
            }
            static length = length
            static fields = fields
            static readArray(buffer, count) {
                const arr = []
                for (let i = 0; i < count; i++)
                    arr.push(new this(buffer))
                return arr
            }
            value = {}
            length() {
                return this.__proto__.constructor.length
            }
            read(buffer) {
                var fields = this.__proto__.constructor.fields
                this.value = {}
                for (var field in fields) {
                    if (fields[field] instanceof Array) {
                        this.value[field] = []
                        let l = typeof fields[field][0] == 'string' ?
                            this.value[fields[field][0]]
                            : fields[field][0]

                        if(fields[field][2])l+=fields[field][2]

                        for (var i = 0; i < l; i++) {
                            var type = new fields[field][1]
                            type.read(buffer)
                            this.value[field].push(type.value)
                        }
                    }
                    else {
                        var type = new fields[field]
                        type.read(buffer)
                        this.value[field] = type.value
                    }
                }

            }
            write(buffer = []) {
                let fields = this.__proto__.constructor.fields
                for (var field in fields) {
                    if (this.value[field] instanceof Array) {
                        this.value[field].forEach(value => {
                            let type = new fields[field][1]()
                            type.fromValue(value).write(buffer)
                        })
                    }
                    else {
                        let type = new fields[field]()
                        type.fromValue(this.value[field]).write(buffer)
                    }
                }
            }

            fromValue(value) {
                this.value = value
                return this
            }
        }

        CustomStructure.methods = methods
        

        return CustomStructure
    }
}
module.exports = Struct
