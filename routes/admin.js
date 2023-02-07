const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
const Categoria = mongoose.model('categorias')
require('../models/Postagem');
const Postagem = mongoose.model('postagens');
const {ehAdmin} = require('../helpers/ehAdmin')

router.get('/', ehAdmin, (req, res) => {
    res.render("admin/index")
});

router.get('/posts', ehAdmin, (req, res) => {
    res.send('Página de posts')
});

router.get('/categorias', ehAdmin, (req, res) => {
    Categoria.find().sort({ date: 'DESC' }).lean().then((categorias) => {
        res.render('admin/categorias', { categorias: categorias })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as categorias')
        res.redirect('/admin')
    })
});

router.get('/categorias/add', ehAdmin, (req, res) => {
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', ehAdmin, (req, res) => {
    var erros = [];

    if (!req.body.nome && typeof req.body.nome == undefined || req.body.nome == null || req.body.nome.length <= 0) {
        erros.push({ texto: 'Nome invalido' })
    }

    if (!req.body.slug && typeof req.body.slug == undefined || req.body.slug == null || req.body.nome.length <= 0) {
        erros.push({ texto: 'Slug invalido' })
    }

    if (erros.length > 0) {
        res.render('admin/addcategorias', { erros: erros })
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novaCategoria).save().then(() => {
            req.flash('success_msg', 'Categoria cadastrada com sucesso!')
            res.redirect('/admin/categorias')
        }).catch((e) => {
            req.flash('error_msg', 'Houve um erro ao salvar categoria.')
            res.redirect('/admin/categorias')
        })

    }


})

router.get('/categorias/edit/:id', ehAdmin, (req, res) => {
    Categoria.findOne({ _id: req.params.id }).lean().then((categoria) => {
        res.render('admin/editcategoria', { categoria: categoria })
    }).catch((e) => {
        req.flash('error_msg', 'Categoria não existe')
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/edit', ehAdmin, (req, res) => {

    let erros = [];

    if (!req.body.nome && typeof req.body.nome == undefined || req.body.nome == null || req.body.nome.length == 0 ) {
        erros.push({texto: 'Nome invalido.'})
    }

    if (!req.body.slug && typeof req.body.slug == undefined || req.body.slug == null || req.body.slug.length == 0) {
        erros.push({texto: 'Slug invalido.'})
    }
    if (erros.length > 0) {
        Categoria.findOne({ _id: req.body.id }).lean().then((categoria) => {
            res.render("admin/editcategoria", { categoria: categoria, erros: erros})
        })
        req.flash("error_msg", "Erro ao pegar os dados")
       
    } else {
        Categoria.findOne({ _id: req.body.id })
        .then((categoria) => {
            categoria.nome = req.body.nome;
            categoria.slug = req.body.slug;

            categoria.save().then(() => {
                req.flash('success_msg', 'Categoria editada com sucesso')
                res.redirect('/admin/categorias')
            }).catch((e) => {
                req.flash('error_msg', 'Houve um erro ao editar categoria')
                res.redirect('/admin/categorias')
                console.log(e)
            })
        })
        .catch((error) => {
            req.flash('error_msg', 'Houve um erro interno ao editar categoria: ' + error)
            res.redirect('/admin/categorias')
            console.log(error)
        })
    }    
})

router.post('/categorias/deletar', ehAdmin, (req, res) => {
    Categoria.remove({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Categoria deleta com sucesso');
        res.redirect('/admin/categorias')
    }).catch((error) => {
        req.flash('error_msg', 'Houve um erro ao deletar categoria');
        res.redirect('/admin/categorias')
    })
})

router.get('/postagens/add', ehAdmin, (req, res) => {
    Categoria.find().lean().then((categoria) => {
        res.render('admin/addpostagem', {categoria: categoria})
    }).catch((error) => {
        req.flash('error_msg', 'Houve um erro ao carregar formulario.')
        res.redirect('/admin')
    })
        
})

router.post('/postagens/nova', ehAdmin, (req, res) => {
    let erros = []

    if(req.body.categoria == 0) {
        erros.push({texto: 'Categoria invalida, registre uma categoria'});
    }

    if (erros.length > 0) {
        res.render('admin/addcategorias', { erros: erros })
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', 'Postagem criada com sucesso!');
            res.redirect('/admin/postagens');
        }).catch((e) => {
            req.flash('error_msg', 'Houve um erro durante a criação da postagem');
            res.redirect('/admin/postagens')
        })
    }
})

router.get('/postagens', ehAdmin, (req, res) => {
    Postagem.find().populate('categoria').sort({ data: 'DESC' }).lean().then((postagens) => {
        res.render('admin/postagens', { postagens: postagens })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as postagens')
        res.redirect('/admin')
    })
});

router.get('/postagens/edit/:id', ehAdmin, (req, res) => {

    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
        Categoria.find().lean().then((categoria) => {
            res.render('admin/editpostagens', {categoria: categoria, postagem: postagem})
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao listar as categorias.');
            res.redirect('/admin/postagens')
        })


    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao editar postagem.');
        res.redirect('/admin/postagens')
    })    
})

router.post('/postagens/edit', ehAdmin, (req, res) => {
    Postagem.findOne({_id: req.body.id}).lean().then((postagem) => {
        postagem.titulo = req.body.titulo;
        postagem.slug = req.body.slug;
        postagem.descricao = req.body.descricao;
        postagem.conteudo = req.body.conteudo;
        postagem.categoria = req.body.categoria;

        postagem.save().then(() => {
            req.flash('success_msg', 'Postagem editada com sucesso.');
            res.redirect('/admin/postagens');
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno ao editar postagem.')
            res.redirect('/admin/postagens')
        })
    }).catch((err) => {
        console.log(err)
        req.flash('error_msg', 'Houve um erro ao salvar a edição.')
        res.redirect('/admin/postagens')
    })
})

router.get('/postagens/deletar/:id', ehAdmin, (req, res) => {
    Postagem.remove({_id: req.params.id}).then(() => {
        req.flash('success_msg', 'Postagem deletada!');
        res.redirect('/admin/postagens')
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno');
        res.redirect('/admin/postagens')
    })
})

module.exports = router;