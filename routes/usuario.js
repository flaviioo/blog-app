import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import bcrypt from 'bcryptjs';

const router = express.Router();
import '../models/Usuarios.js';
const Usuarios = mongoose.model('usuarios');

// Página principal de registros
router.get('/registro', (req, res) => {
    res.render("usuarios/registro");
});

router.post('/registro/novo', (req, res) => {
    let erros = [];

    if (!req.body.nome || req.body.nome.trim().length === 0) {
        erros.push({ texto: "Nome inválido" });
    }
    if (!req.body.email || req.body.email.trim().length === 0) {
        erros.push({ texto: "Email inválido" });
    }
    if (!req.body.senha || req.body.senha.trim().length === 0) {
        erros.push({ texto: "Senha inválida" });
    }
    if (req.body.senha.length < 6) {
        erros.push({ texto: "A senha deve ter pelo menos 6 caracteres." });
    }
    if (req.body.senha !== req.body.senha2) {
        erros.push({ texto: "Senha e confirmar senha diferentes." });
    }

    // Se houver erros, renderiza a página novamente com os erros
    if (erros.length > 0) {
        res.render('usuarios/registro', { erros: erros });
    } else {
        Usuarios.findOne({ email: req.body.email }).lean()
            .then((usuario) => {
                if (usuario) {
                    req.flash("error_msg", "Já existe um usuário com este email");
                    res.redirect("/usuarios/registro");
                } else {
                    // Criptografando a senha antes de salvar
                    bcrypt.hash(req.body.senha, 10, (err, hashedPassword) => {
                        if (err) {
                            req.flash("error_msg", "Erro ao criptografar a senha.");
                            res.redirect("/usuarios/registro");
                        } else {
                            const novoUsuario = new Usuarios({
                                nome: req.body.nome,
                                email: req.body.email,
                                senha: hashedPassword, // Salva a senha criptografada
                            });

                            novoUsuario.save()
                                .then(() => {
                                    req.flash("success_msg", "Usuário cadastrado com sucesso.");
                                    res.redirect("/usuarios/login");
                                })
                                .catch((err) => {
                                    req.flash("error_msg", "Houve um erro ao cadastrar-se.");
                                    res.redirect("/usuarios/registro");
                                });
                        }
                    });
                }
            }).catch((e) => {
                req.flash("error_msg", "Houve um erro interno: " + e);
                res.redirect("/usuarios/registro");
            });
    }
});

router.get('/', (req, res) => {
    res.render("usuarios/login");
});

router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/home',
        failureRedirect: '/', // Corrigindo o redirecionamento para login em caso de falha
        failureFlash: true
    })
);

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success_msg", "Sessão terminada");
        res.redirect("/");
    });
});

// Exportando o roteador
export default router;
