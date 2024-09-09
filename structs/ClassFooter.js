const Struct = require('../bsto/struct')

const {
    WORD
} = require('../bsto/types')
const AttributeInfo = require('./AttributeInfo')

const MemberInfo=require('./MemberInfo')


const ClassHeader2 = Struct.Create({
    AccessFlags:WORD,
    ThisClass:WORD,
    SuperClass:WORD,
    InterfacesCount:WORD,
    Interfaces:['InterfacesCount',WORD],
    FieldsCount:WORD,
    Fields:['FieldsCount',MemberInfo],
    MethodsCount:WORD,
    Methods:['MethodsCount',MemberInfo],
    AttributesCount: WORD,
    Attributes: ['AttributesCount',AttributeInfo]
})


module.exports = ClassHeader2