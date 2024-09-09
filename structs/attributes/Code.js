const Struct = require('../../bsto/struct')

const {
    BYTE,
    WORD,
    DWORD
} = require('../../bsto/types')
const AttributeInfo = require('../AttributeInfo')

const ExceptionHandler = Struct.Create({
    start_pc: WORD,
    end_pc: WORD,
    handler_pc: WORD,
    catch_type: WORD,

})


const Code = Struct.Create({
    max_stack: WORD,
    max_locals: WORD,
    code_length: DWORD,
    Code: ['code_length', BYTE],
    exception_table_length: WORD,
    exception_table: ['exception_table_length', ExceptionHandler],
    attributes_count:WORD,
    Attributes:['attributes_count',AttributeInfo],
})


module.exports = Code