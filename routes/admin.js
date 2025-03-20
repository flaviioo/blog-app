import { Router } from 'express'
import { model } from 'mongoose'
const router = Router()
import '../models/Categorias.js'
const Categoria = model('categorias')
import '../models/Postagens.js'
const Postagem = model('postagens')
import acesso from '../helpers/acesso.js'

// Página principal do painel admin
router.get('/', acesso.eAdmin, (req, res) => {
    res.render("admin/postagens")
})

// Página de posts
router.get('/postagens', acesso.eAdmin, (req, res) => {
    Postagem.find().populate('categoria').lean().sort({ date: -1 }).then((postagens) => {
        res.render('admin/postagens', { postagens: postagens })
    }).catch((e) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens")
        res.redirect("/admin")
    })
})

router.get('/postagem/add', acesso.eAdmin, (req, res) => {
    Categoria.find().lean()
        .then((categorias) => {
            res.render("admin/addpostagens", { categorias: categorias })
        }).catch((e) => {
            req.flash("error_msg", "Categoria não existe")
            res.redirect('/admin')
        })
})

router.post('/postagem/nova', acesso.eAdmin, (req, res) => {
    const novaPostagem = new Postagem({
        titulo: req.body.titulo,
        slug: req.body.slug,
        descricao: req.body.descricao,
        conteudo: req.body.conteudo,
        categoria: req.body.categoria,
    })
    novaPostagem.save()
        .then(() => {
            req.flash("success_msg", "Postagem criada com sucesso.");
            res.redirect("/admin/postagens");
        })
        .catch((err) => {
            req.flash("error_msg", "Houve um erro ao criar a postagem.");
            res.redirect("/admin");
        });
})

router.get('/postagem/editar/:id', acesso.eAdmin, (req, res) => {
    Postagem.findOne({ _id: req.params.id })
        .then((postagem) => {
            let post = {
                id: postagem.id,
                titulo: postagem.titulo,
                slug: postagem.slug,
                descricao: postagem.descricao,
                conteudo: postagem.conteudo,
                categoria: postagem.categoria,
            }
            Categoria.findOne({ _id: post.categoria }).then((categoria) => {
                let cat = {
                    id: categoria.id,
                    nome: categoria.nome
                }

                res.render('admin/editarpostagem', { categoria: cat, postagem: post })
            })
        }).catch((e) => {
            req.flash("error_msg", "Essa categoria não existe: ")
            res.redirect('/admin/postagens')
        })

})

router.post('/postagem/atualizar/', acesso.eAdmin, (req, res) => {

    Postagem.findOne({ _id: req.body.id })
        .then((postagem) => {
            postagem.titulo = req.body.titulo
            postagem.slug = req.body.slug
            postagem.descricao = req.body.descricao
            postagem.conteudo = req.body.conteudo
            postagem.categoria = req.body.categoria

            postagem.save()
                .then(() => {
                    req.flash("success_msg", "Postagem editada com sucesso.");
                    res.redirect("/admin/postagens");
                })
                .catch((err) => {
                    req.flash("error_msg", "Houve um erro ao salvar a postagem.");
                    res.redirect("/admin/postagens");
                });
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao editar a postagem.");
            res.redirect("/admin/postagens");
        });
})

router.get('/postagem/deletar/:id', acesso.eAdmin, (req, res) => {
    Postagem.findByIdAndDelete({ _id: req.params.id })
        .then(() => {
            req.flash("success_msg", "Postagem removida com sucesso.");
            res.redirect("/admin/postagens");
        })
        .catch((err) => {
            req.flash("error_msg", "Houve um erro ao remover a postagem.");
            res.redirect("/admin/postagens");
        });
})

// Página de categorias
router.get('/categorias', acesso.eAdmin, (req, res) => {
    Categoria.find().lean().sort({ date: -1 }).then((categorias) => {
        res.render('admin/categorias', { categorias: categorias })
    }).catch((e) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/admin")
    })
})

// Formulário para adicionar categorias
router.get('/categorias/add', acesso.eAdmin, (req, res) => {
    res.render("admin/addcategorias")
})

// Rota para criar nova categoria
router.post('/categorias/nova', acesso.eAdmin, (req, res) => {
    let erros = [];

    if (!req.body.nome || req.body.nome.trim().length === 0) {
        erros.push({ texto: "Nome inválido" });  // A chave deve ser "texto", não {{ texto: "..." }}
    }

    if (!req.body.slug || req.body.slug.trim().length === 0) {
        erros.push({ texto: "Slug inválido" });
    }
    if (req.body.nome.length < 2) {
        erros.push({ texto: "O nome deve ter pelo menos 2 caracteres." });
    }
    // Se houver erros, renderiza a página novamente com os erros
    if (erros.length > 0) {
        res.render('admin/addcategorias', { erros: erros }) // Certifique-se de que "erros" está sendo enviado corretamente
    }
    else {
        // Criando a nova categoria
        const novaCategoria = new Categoria({
            nome: req.body.nome,
            slug: req.body.slug
        });

        novaCategoria.save()
            .then(() => {
                req.flash("success_msg", "Categoria criada com sucesso.");
                res.redirect("/admin/categorias");
            })
            .catch((err) => {
                req.flash("error_msg", "Houve um erro ao salvar a categoria.");
                res.redirect("/admin");
            });
    }
});

router.get('/categorias/editar/:id', acesso.eAdmin, (req, res) => {
    Categoria.findOne({ _id: req.params.id })
        .then((categoria) => {
            let cat = {
                id: categoria.id,
                nome: categoria.nome,
                slug: categoria.slug
            }

            res.render('admin/editarcategoria', { categoria: cat })
        }).catch((e) => {
            req.flash("error_msg", "Essa categoria não existe: ")
            res.redirect('/admin/categorias')
        })

})

router.post('/categorias/atualizar', acesso.eAdmin, (req, res) => {
    Categoria.findOne({ _id: req.body.id })
        .then((categoria) => {

            categoria.nome = req.body.nome;
            categoria.slug = req.body.slug

            categoria.save()
                .then(() => {
                    req.flash("success_msg", "Categoria editada com sucesso.");
                    res.redirect("/admin/categorias");
                })
                .catch((err) => {
                    req.flash("error_msg", "Houve um erro ao salvar a categoria.");
                    res.redirect("/admin/categorias");
                });
        })
        .catch((err) => {
            req.flash("error_msg", "Houve um erro ao editar a categoria.");
            res.redirect("/admin/categorias");
        });
})

router.get('/categorias/deletar/:id', acesso.eAdmin, (req, res) => {
    Categoria.findByIdAndDelete({ _id: req.params.id })
        .then(() => {
            req.flash("success_msg", "Categoria removida com sucesso.");
            res.redirect("/admin/categorias");
        })
        .catch((err) => {
            req.flash("error_msg", "Houve um erro ao remover a categoria.");
            res.redirect("/admin/categorias");
        });
})

export default router;
