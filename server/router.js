const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const UsersModel = require('./models/users.model');
const _= require('lodash');
const bcrypt = require('bcryptjs');
const config = require('./config');
const checkAuth = function (req,res,next) {
    passport.authenticate('jwt', {session: false}, (err,decriptToken,jwtError)=>{
        if(jwtError != void(0) || err != void(0)){
            res.render('index.html', {
                title: 'Главная страница',
                login: false
            });
        } else{
            req.user = decriptToken;
            next();
        }
    })(req,res,next);
};
function createToken(body) {
   return jwt.sign(
        body,
        config.jwt.secretOrKey,
       {expiresIn: config.expiresIn}
    )
}
router.get('/', checkAuth,(req, res) => {
    let date = new Date();
    jwt.verify(req.cookies['token'], config.jwt.secretOrKey,function(err, decoded) {
        res.render('index.html', {
            date: date.toLocaleString(),
            title: 'Главная страница',
            login: true,
            name: decoded.username
        });
    });

});
router.get('/login', (req, res) => {
    res.render('login.html', {
        title: 'Авторизация'
    });
});

router.get('/reg', (req, res) => {
    res.render('reg.html', {
        title: 'Регистрация'
    });
});


router.post('/reg', async(req, res)=>{
    try{
        let user = await UsersModel.findOne({username: {$regex: _.escapeRegExp(req.body.r_name), $options: "i"}}).lean().exec();
        if(user !=void(0)){
            res.redirect('/reg');
        } else{
            user = await UsersModel.create({
                username: req.body.r_name,
                password: req.body.r_pass
            });
            const token = createToken({id: user._id, username: user.username});
            res.status(200);
            res.redirect('/login');
        }
    } catch (e){
        console.error("E, register", e);
        res.status(500);
        res.redirect('/reg')
    }
});

router.post('/login', async (req, res)=>{
   try{
       let user = await UsersModel.findOne({username: {$regex: _.escapeRegExp(req.body.l_name), $options: "i"}}).lean().exec();
        if(user != void(0) && bcrypt.compareSync(req.body.l_pass, user.password)) {
            const token = createToken({id: user._id, username: user.username});
            res.cookie('token', token, {
                //httpOnly: true
            });
            res.status(200);
            res.redirect('/')
        }else{
            res.status(400);
            res.redirect('/login')
        }
   } catch(e){
       console.error("E, login" , e);
       res.redirect('/login')
   }
});
router.get('/logout', (req,res)=>{
    res.clearCookie('token');
    res.status(200);
    res.redirect('/login')
});
module.exports = router;
