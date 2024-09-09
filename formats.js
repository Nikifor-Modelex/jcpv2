
function deserealizeDescriptor(descriptor) {
    const parametersEnd = descriptor.indexOf(')')
    const returnDescriptor = descriptor.substring(parametersEnd + 1)
    const parser = deserealizeDescriptor.parsers[returnDescriptor[0]]
    const returns = parser instanceof Function ? parser(returnDescriptor) : parser

    const argsDescriptor = descriptor.substring(1, parametersEnd)
    const args = []
    var pos = 0
    var p, arg
    while (pos < argsDescriptor.length) {
        if (argsDescriptor[pos] != '[') {
            [p, arg] = deserealizeDescriptor.handleNonarray(argsDescriptor, pos)
            args.push(arg)
            pos = p
            continue
        }

        const start = pos
        do pos++
        while (argsDescriptor[pos] == '[' && pos < argsDescriptor.length);
        [p, arg] = deserealizeDescriptor.handleNonarray(argsDescriptor, pos)
        const arrayDescriptor = argsDescriptor.substring(start, pos) + (argsDescriptor[pos]=='L'?`L${arg};`:arg)
        pos = p
        args.push(deserealizeDescriptor.parsers['['](arrayDescriptor))
    }
    //deserealizeDescriptor.parsers[returnDescriptor[0]](returnDescriptor)
    return { returns, args }
}
deserealizeDescriptor.handleNonarray = (argsDescriptor, pos) => {
    if (argsDescriptor[pos] != 'L') {
        return [pos + 1, deserealizeDescriptor.parsers[argsDescriptor[pos]]]
    }

    const start = pos
    do pos++
    while (argsDescriptor[pos] != ';' && pos < argsDescriptor.length)
    return [pos + 1, deserealizeDescriptor.parsers.L(argsDescriptor.substring(start, pos))]

}
deserealizeDescriptor.parsers = {
    'V': 'void',
    'B': 'byte',
    'C': 'char',
    'D': 'double',
    'F': 'float',
    'I': 'int',
    'J': 'long',
    'L': d => d.replace('L', '').replace(';', '').replaceAll('/', '.'),
    'S': 'short',
    'Z': 'boolean',
    '[': d => {

        const parser = deserealizeDescriptor.parsers[d[1]]
        return (parser instanceof Function ? parser(d.substring(1)) : parser) + '[]'
    }
}


function methodSignature(jclass, methodid) {
    const method = jclass.Footer.Methods[methodid]
    const name = jclass.pool(method.NameIndex)
    const { returns, args } = deserealizeDescriptor(
        jclass.pool(method.DescriptorIndex) + ''
    )
    var accessflags = ''
    for (const flag in methodSignature.methodAccessFlags) {
        const binflag = methodSignature.methodAccessFlags[flag]
        if (binflag == (method.AccessFlags & binflag))
            accessflags += flag + ' '
    }


    return `${accessflags}${returns} ${name} (${args.map((type, i) => `${type} arg${i}`).join(', ')})`
}
methodSignature.methodAccessFlags = {
    public: 0x0001,
    private: 0x0002,
    protected: 0x0004,
    static: 0x0008,
    final: 0x0010,
    synchronized: 0x0020,
    bridge: 0x0040,
    varargs: 0x0080,
    native: 0x0100,
    abstract: 0x0400,
    strict: 0x0800,
    synthetic: 0x1000,
}

function ClassName(jc,field='ThisClass') {
    return jc.pool(jc.pool(jc.Footer[field]).Index).toString().replaceAll('/', '.')
}

function fixedLength(num,chars){
    num=''+num
    while (num.length<chars)
        num='0'+num
    return num
}

module.exports = {
    methodSignature,
    deserealizeDescriptor,
    ClassName,
    fixedLength
}