// Usando a sintaxe de importação ES Modules
import dotenv from 'dotenv';
dotenv.config(); // Carregar variáveis do arquivo .env

import express from 'express';
import { engine } from 'express-handlebars';
import { model, connect } from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import flash from 'connect-flash';
import { join } from 'path';
import { fileURLToPath } from 'url';
import './models/Postagens.js';
const Postagem = model('postagens');
import './models/Categorias.js';
const Categoria = model('categorias');
const Comentario = model('comentarios');
import './models/Comentarios.js';
import configurePassport from './config/auth.js';
import passport from 'passport';
configurePassport(passport);

//import mongoURI from "./config/db.js"; // Importação correta das configurações do MongoDB

// Grupo de Rotas
import admin from './routes/admin.js';
import usuarios from './routes/usuario.js';

// Configuração do app
const app = express();
const PORT = process.env.PORT || 8081;

// Session

app.use(session({
    secret: process.env.SESSION_SECRET || 'segredoSeguro',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 14 * 24 * 60 * 60 // Expiração da sessão em 14 dias
    })
  }));

// PASSPORT - Inicialização
app.use(passport.initialize());
app.use(passport.session());

// Flash
app.use(flash());

// Middleware para mensagens e usuário autenticado
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    res.locals.user = req.user || null;
    next();
});

// Handlebars
app.engine('handlebars', engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// BodyParser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB conectado!"))
    .catch((e) => {
        console.error("❌ Erro ao conectar ao MongoDB:", e);
        process.exit(1); // Encerra o processo se houver erro
    });

// Public - Definindo a pasta pública
const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

app.use(express.static(join(__dirname, 'public')));

// Rotas
app.get('/', async (req, res) => {
    try {
        res.render('usuarios/login');
    } catch (e) {
        res.redirect("/");
    }
});

app.get('/home', async (req, res) => {
    try {
        const postagens = await Postagem.find().lean().sort({ date: -1 });
        res.render('home', { postagens });
    } catch (e) {
        req.flash("error_msg", "Houve um erro ao listar as postagens");
        res.redirect("/");
    }
});

app.get('/postagem/:slug', async (req, res) => {
    try {
        const postagem = await Postagem.findOne({ slug: req.params.slug }).lean();
        if (postagem) {
            res.render('postagem/detalhespostagem', { postagem });
        } else {
            req.flash("error_msg", "Essa postagem não existe");
            res.redirect("/");
        }
    } catch (e) {
        req.flash("error_msg", "Houve um erro ao listar as postagens");
        res.redirect("/");
    }
});

app.get('/categorias', async (req, res) => {
    try {
        const categorias = await Categoria.find().lean();
        res.render('categorias/listarcategorias', { categorias });
    } catch (e) {
        req.flash("error_msg", "Não existem categorias cadastradas");
        res.redirect("/");
    }
});

app.get('/postagens/:slug', async (req, res) => {
    try {
        const categoria = await Categoria.findOne({ slug: req.params.slug }).lean();
        if (categoria) {
            const postagens = await Postagem.find({ categoria: categoria._id }).lean();
            res.render('categorias/postagens', { postagens, categoria });
        } else {
            req.flash("error_msg", "Houve um erro ao listar os posts.");
            res.redirect('/categorias');
        }
    } catch (e) {
        req.flash("error_msg", "Esta categoria não existe");
        res.redirect("/");
    }
});

app.post('/home', async (req, res) => {
    try {        
        // Pegando o usuário autenticado
        if (!req.user) {
            req.flash("error_msg", "Você precisa estar logado para comentar.");
            return res.redirect("/home");
        }

        const usuarioId = req.user._id; // Pega o ID do usuário autenticado
        const postagemId = req.body.id 
        const comentario = req.body.comentario; // Pega a postagem e o comentário do formulário

        // Verifica se a postagem existe
        const postagem = await Postagem.findById(postagemId);
        if (!postagem) {
            req.flash("error_msg", "A postagem não foi encontrada.");
            return res.redirect("/home");
        }

        // Criando o novo comentário
        const novoComentario = new Comentario({
            usuario: usuarioId,
            postagem: postagemId,
            comentario: comentario
        });

        await novoComentario.save();
        req.flash("success_msg", "Comentário adicionado com sucesso.");
        res.redirect(`/postagem/${postagem.slug}`); // Redireciona para a página da postagem

    } catch (error) {
        console.error("Erro ao adicionar comentário:", error);
        req.flash("error_msg", "Erro ao adicionar comentário.");
        res.redirect("/home");
    }
});


app.use('/admin', admin);
app.use('/usuarios', usuarios);



// Outros
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta: ${PORT}`);
});
