import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema

const Comentarios = new Schema({
    usuario:{
        type: Schema.Types.ObjectId,
        ref: 'usuarios',
        required: true
    },
    postagem:{
        type: Schema.Types.ObjectId,
        ref: 'postagens',
        required: true
    },
    comentario:{
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

model('comentarios', Comentarios)