const {Schema, model}=require('mongoose')
const Document=new Schema({
_id: String,
 users: Array
})
module.exports=model("Document",Document)