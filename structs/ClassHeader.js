const Struct = require('../bsto/struct')

const {
    WORD,
    DWORD
} = require('../bsto/types')

const ClassHeader1 = Struct.Create({
    Signature: DWORD,
    MinorVersion: WORD,
    MajorVersion: WORD,
    ConstantPoolCount: WORD
})


module.exports = ClassHeader1