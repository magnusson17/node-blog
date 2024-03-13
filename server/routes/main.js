const express = require('express');
const router = express.Router();
const Post = require('../models/Post.js');

/**
    * GET
    * HOME
*/
router.get('/', async (req, res) => {
    try {
        const locals = {
            title: "NodeJS Blog",
            description: "Blog created with Node, Express and MongoDB"
        }
        /* quanti elems mostrare per pagina */
        let perPage = 3;
        /* req.query.page sto prendendo la url query "page",
        se essa non è presente do 1 di default */
        let page = req.query.page || 1;
        /* 
        -   aggregate() fun built-in di momgoose, 
            mi permette di aggrgare dati secondo le esigenze che gli specifico 
        
            ordino i risultati aggregati (sort), 
            usando createdAt: -1 metto i più vecchi in cima
        
        -   skip() e limit() son fun built-in di momgoose usate spesso in combo

            skip() specifica quanti doc skippare prima di ritornare i doc restanti in una query result
            limi() limita in num di doc per pagina

        -   exec() per eseguire l'aggregazione
        */
        const data = await Post.aggregate([ { $sort: {createdAt: -1} } ])
        .skip(perPage * page - perPage)
        .limit(perPage)
        .exec();

        /* faccio una query per capire quanti doc ho
        -   countDocuments() fun built-in di mongoose
        */
        const count = await Post.countDocuments();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);

        res.render('index', {
            locals,
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            currentRoute: '/'
        });

    } catch (error) {
        console.log(error);
    }
});

/**
    * GET
    * Post :id
*/
router.get('/post/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await Post.findById({ _id: id });
        const locals = {
            title: data.title,
            description: "Desccrizione post"
        }
        res.render('post', {locals, data, currentRoute: `/post/${id}`});
    } catch(error) {
        console.log(error);
    }
});

/**
    * POST
    * Search term
*/
router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: "Search",
            description: "Desccrizione post"
        }
        let searchInput = req.body.searchInput;
        // elimino i caratteri speciali
        const searchNoSpecial = searchInput.replace(/[^a-zA-Z0-9 ]/g, "");

        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecial, 'i') } },
                { body: { $regex: new RegExp(searchNoSpecial, 'i') } }
            ]
        })
        res.render('search', {locals, data});
    } catch(error) {
        console.log(error);
    }
});

/*
function insertPostData() {
    Post.insertMany([
        {
            title: "Albese",
            body: "numero uno"
        }
    ])
}
insertPostData()
*/
module.exports = router;