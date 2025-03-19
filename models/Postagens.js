import { Schema as _Schema, model } from 'mongoose'
const Schema = _Schema

const Postagem = new Schema({
    titulo: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },
    categoria: {
        type: Schema.Types.ObjectId, //relacionamento com collection Categorias
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

model('postagens', Postagem)