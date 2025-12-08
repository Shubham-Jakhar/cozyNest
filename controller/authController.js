const { check, validationResult } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcrypt');
exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'login',
        isLoggedIn: false,
        errors: [],
        email: '',
        user: {}
    });
};

exports.postLogin = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email: email });
    if (!user) {
        return res.status(422).render('auth/login', {
            pageTitle: 'login',
            isLoggedIn: false,
            errors: ["user or password is inncorect"],
            email: email,
            user: {}
        });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
        req.session.isLoggedIn = true;
        req.session.user = user;
        res.redirect('/');
    } else {
        return res.status(422).render('auth/login', {
            pageTitle: 'login',
            isLoggedIn: false,
            email: email,
            errors: ["password is inncorect"],
            user: {}
        });
    }
}

exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    })
}

exports.getSignup = (req, res, next) => {
    res.render('auth/signup',
        {
            pageTitle: 'signup',
            errors: [],
            oldInput: { firstName: "", lastName: "", email: "", usertype: "" },
            user: {}
        });
}

exports.postSignup = [
    check('firstName')
        .notEmpty()
        .withMessage('firstname required')
        .trim()
        .isLength({ min: 2 })
        .withMessage('minimum two charcters required in firstname')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('firstname con only contain letters'),

    check('lastName')
        .matches(/^[a-zA-Z\s]*$/)
        .withMessage('lastname con only contain letters'),

    check('email')
        .isEmail()
        .withMessage('enter a valid email')
        .normalizeEmail(),

    check('password')
        .notEmpty()
        .withMessage('password is required')
        .isLength({ min: 8 })
        .withMessage('minimum 8 charcters required in password')
        .matches(/[a-z]/)
        .withMessage('password contains atleast one small charcter')
        .matches(/[A-Z]/)
        .withMessage('password contains atleast one capital charcter')
        .matches(/[!@#$%^&*()]/)
        .withMessage('password contains atleast one special charcter')
        .trim(),

    check('confirmPassword')
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('password not match');
            }
            return true;
        }),

    check('usertype')
        .notEmpty()
        .withMessage('please select usertype'),

    check('terms')
        .notEmpty()
        .withMessage('please accept terms and conditions')
        .custom(value => {
            if (value != 'on') {
                throw new Error('please accept terms and conditions')
            }
            return true;
        }),
    (req, res, next) => {
        const { firstName, lastName, email, password, usertype } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).render('auth/signup', {
                pageTitle: 'signup',
                isLoggedIn: false,
                errors: errors.array().map(err => err.msg),
                oldInput: { firstName, lastName, email, usertype },
                user: {}
            });
        }
        bcrypt.hash(password, 12).then(hashedPassword => {
            const user = new User({ firstName, lastName, email, password: hashedPassword, usertype })
            return user.save();
        }).then(() => {
            res.redirect("/login");
        }).catch(err => {
            console.log(err, "error while registring user in db");
            return res.status(422).render('auth/signup', {
                pageTitle: 'signup',
                isLoggedIn: false,
                errors: [err.msg],
                oldInput: { firstName, lastName, email, usertype },
                user: {}
            });
        })
    }]