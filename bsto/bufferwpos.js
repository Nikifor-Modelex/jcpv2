function BufferWithPos(buf,pos=0){
        if(!(buf instanceof Buffer))buf=Buffer.from(buf)
        buf.pos=pos
        buf.readBuffer=(length)=>{
            this.pos+=length
            return BufferWithPos(this.subarray(this.pos-length,this.pos))
        }
        return buf
}

module.exports=BufferWithPos