const Struct = require('../../bsto/struct')

const {
    BYTE,
    WORD,
    typeBaseClass
} = require('../../bsto/types')

const object_variable_info = Struct.Create({
    tag: BYTE,
    offset: WORD
})
const simple_variable_info = Struct.Create({
    tag: BYTE
})

class verification_type_info extends typeBaseClass {

    read(buffer) {
        const info = buffer[buffer.pos]
        var type
        if (info <= 6) type = simple_variable_info
        if (info == 7) type = object_variable_info
        if (info == 8) type = object_variable_info
        this.value = new type(buffer).value
    }
    write(buffer) {
        const info = this.value.tag
        var type
        if (info <= 6) type = simple_variable_info
        if (info == 7) type = object_variable_info
        if (info == 8) type = object_variable_info
        new type().fromValue(this.value).write(buffer)
    }

}
const same_frame = Struct.Create({
    frame_type: BYTE
})
const same_locals_1_stack_item_frame = Struct.Create({
    frame_type: BYTE,
    stack: verification_type_info
})
const append_frame = Struct.Create({
    frame_type: BYTE,
    offset_delta: WORD,
    locals: ['frame_type', verification_type_info, -251]
})
const same_locals_1_stack_item_frame_extended = Struct.Create({
    frame_type: BYTE,
    offset_delta: WORD,
    locals: verification_type_info
})
// const same_frame_extended = Struct.Create({ frame_type: BYTE })
const full_frame = Struct.Create({
    frame_type: BYTE,
    offset_delta: WORD,
    number_of_locals: WORD,
    locals: ['number_of_locals', verification_type_info],
    number_of_stack_items: WORD,
    stack: ['number_of_stack_items', verification_type_info]
})


class StackMapFrame extends typeBaseClass {

    read(buffer) {
        const frame_type = buffer[buffer.pos]
        var type
        if (frame_type <= 254) type = append_frame
        if (frame_type <= 251) type = object_variable_info//250 chop frame
        if (frame_type <= 127) type = same_locals_1_stack_item_frame
        if (frame_type <= 63) type = same_frame

        if (frame_type == 247) type = same_locals_1_stack_item_frame_extended
        // if (frame_type == 251) type = same_frame_extended
        if (frame_type == 255) type = full_frame
        this.value = new type(buffer).value

    }
    write(buffer) {
        const frame_type = this.value.frame_type
        var type
        if (frame_type <= 254) type = append_frame
        if (frame_type <= 251) type = object_variable_info//250 chop frame
        if (frame_type <= 127) type = same_locals_1_stack_item_frame
        if (frame_type <= 63) type = same_frame

        if (frame_type == 247) type = same_locals_1_stack_item_frame_extended
        // if (frame_type == 251) type = same_frame_extended
        if (frame_type == 255) type = full_frame
        new type().fromValue(this.value).write(buffer)
    }

}


const StackMapTable = Struct.Create({
    Length: WORD,
    Entries: ['Length', StackMapFrame],
})



module.exports = {
    StackMapTable,
    verification_type_info,
    same_frame,
    same_locals_1_stack_item_frame,
    same_locals_1_stack_item_frame_extended,
    append_frame,
    full_frame,
    object_variable_info,
    StackMapFrame
}