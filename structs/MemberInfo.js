const Struct = require('../bsto/struct')

const {
    WORD
} = require('../bsto/types')

const AttributeInfo = require('./AttributeInfo')
// Field or Method
const MemberInfo = Struct.Create({
    AccessFlags: WORD,
    NameIndex: WORD,
    DescriptorIndex: WORD,
    AttributesCount: WORD,
    Attributes: ['AttributesCount',AttributeInfo]
})


module.exports = MemberInfo