const Struct = require('../bsto/struct')

const {
    BYTE,
    WORD,
    DWORD
} = require('../bsto/types')

const AttributeInfo = Struct.Create({
    NameIndex:WORD,
    Length:DWORD,
    Info:['Length',BYTE]
})


module.exports = AttributeInfo