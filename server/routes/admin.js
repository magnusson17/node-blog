const express = require('express');
const router = express.Router();
const Post = require('../models/Post.js');
const User = require('../models/User.js');
// criptare/decriptare password
const bcrypt = require('bcrypt');
// un aiuto per i cookies
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

/**
 * 
 * Check Login
*/
const authMiddle = (req, res, next) => {
    // prendo i cookies del browser
    const token = req.cookies.token;
    if(!token) {
        return res.status(401).json({ message: 'Non autorizzato' });
    }
    try {
        /* verifichiamo il jwt con il secret
        che abbiamo settato in .env */
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch(error) {
        res.status(401).json({ message: 'Non autorizzato'});
    }
};

/**
 * GET
 * Admin - Login Page
*/
/* se io vado nel URL "/admin" succede quanto segue */
router.get('/admin', async (req, res) => {
    try {
        const locals = {
            title: "Admin",
            description: "Admin pannel"
        }
        /* renderizzo login.ejs (qua comporrò il body)
        e gli assegno come layout "adminLayout" (qua stamperò il body) */
        res.render('admin/login', { locals, layout: adminLayout });
    } catch(error) {
        console.log(error);
    }
});

/**
 * POST
 * Admin - Check Login
 */
router.post('/admin', async (req, res) => {
    try {
        const { username, password } = req.body;
        /* controllo se lo user è disponibile
        cercando nel DB */
        const user = await User.findOne({ username });
        if(!user) {
            return res.status(401).json({ message: 'invalid credentials' })
        }
        /* controllo la pass */
        const isPassValid = await bcrypt.compare(password, user.password);
        if(!isPassValid) {
            return res.status(401).json({ message: 'invalid credentials' })
        }
        /* salvo un token per i cookies
        prima lo creo */
        const token = jwt.sign({ userId: user._id }, jwtSecret);
        /* poi lo salvo nei cookies */
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard');
    } catch(error) {
        console.log(error);
    }
});

/**
 * GET
 * Admin - Dashboard
 */
router.get('/dashboard', authMiddle, async (req, res) => {
    const locals = {
        title: "Dashboard",
        description: "Dashboard page"
    }
    try {
        const data = await Post.find()
        res.render('admin/dashboard', { locals, data, layout: adminLayout });
    } catch(error) {
        console.log(error);
    }
});

/**
 * GET
 * Admin - Go to pag add post
 */
router.get('/add-post', authMiddle, async (req, res) => {
    const locals = {
        title: "Add post",
        description: "Add post"
    }
    try {
        const data = await Post.find()
        res.render('admin/add-post', { locals, data, layout: adminLayout });
    } catch(error) {
        console.log(error);
    }
});

/**
 * POST
 * Admin - Add post
 */
router.post('/add-post', authMiddle, async (req, res) => {
    try {
        console.log(req.body);
        try {
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body
            });
            await Post.create(newPost);
            res.redirect('/dashboard');
        } catch(error) {
            console.log(error);
        }
    } catch(error) {
        console.log(error);
    }
});

/**
 * GET
 * Admin - Pag edit post
 */
router.get('/edit-post/:id', authMiddle, async (req, res) => {
    try {
        const locals = {
            title: "Edit post",
            description: "Edit post"
        }
        const data = await Post.findOne({ _id: req.params.id });
        res.render('admin/edit-post', { locals, data, layout: adminLayout });
    } catch(error) {
        console.log(error);
    }
});

/**
 * PUT
 * Admin - Edit post
 */
router.put('/edit-post/:id', authMiddle, async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updateAt: Date.now()
        });
        res.redirect(`/edit-post/${req.params.id}`);
    } catch(error) {
        console.log(error);
    }
});

/**
 * POST
 * Admin - Register
 */
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        // incripto la pass
        const hashededPass = await bcrypt.hash(password, 10);
        // creo l'user usando il model User creato prima
        try {
            /* con User.create sto usando il codice in User.js
            per creare un user, passo i dati necessari in User.js
            pass e user */
            const user = await User.create({ username, password: hashededPass });
            res.status(201).json({ message: "User created!", user});
        } catch (error) {
            if(error.code === 11000) {
                res.status(409).json({ message: "User already in use"});
            }
            res.status(500).json({ message: "Internal server error"});
        }
    } catch(error) {
        console.log(error);
    }
});

/**
 * DELETE
 * Admin - Delete post
 */
router.delete('/delete-post/:id', authMiddle, async (req, res) => {
    try {
        await Post.deleteOne({ _id: req.params.id });
        res.redirect('/dashboard');
    } catch(error) {
        console.log(error);
    }
});

/**
 * GET
 * Admin - logout
 */
router.get('/logout', async (req, res) => {
    // devo togliere i cookies che mi fanno restare loggato
    res.clearCookie('token');
    // faccio redirect a pag a piacere
    res.redirect('/');
});

module.exports = router;