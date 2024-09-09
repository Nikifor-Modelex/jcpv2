const Struct = require('../../bsto/struct')

const {
    WORD,
    DWORD
} = require('../../bsto/types')
const VariableEntry = Struct.Create({
    start_pc: WORD,
    length: WORD,
    name_index: WORD,
    descriptor_index: WORD,
    index:WORD

})


const LocalVariableTable = Struct.Create({
    Length: DWORD,
    Entries: ['Length', VariableEntry],
})


module.exports = LocalVariableTable