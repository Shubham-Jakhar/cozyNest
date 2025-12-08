const Home = require("../models/home");
const User = require('../models/user');

exports.getHome = (req, res, next) => {
    Home.find().then(registredHome => {
        res.render('store/home', {
            registredHome: registredHome,
            pageTitle: 'airbnb',
            currPage: 'Home',
            isLoggedIn: req.isLoggedIn,
            user: req.session.user
        });
    });
}

exports.bookings = (req, res, next) => {
    res.render('store/bookings', {
        pageTitle: 'bookings',
        currPage: 'bookings',
        isLoggedIn: req.isLoggedIn,
        user: req.session.user
    })
}

exports.favouriteList = async (req, res, next) => {
    const userId = req.session.user._id;
    const user = await User.findById(userId).populate('favourites');
    res.render('store/favourite-list', {
        favouriteHomes: user.favourites,
        pageTitle: 'favourites',
        currPage: 'favourite-list',
        isLoggedIn: req.isLoggedIn,
        user: req.session.user
    });
}

exports.addFavouriteHome = async (req, res, next) => {
    const homeId = req.body.id;
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    if (!user.favourites.includes(homeId)) {
        user.favourites.push(homeId);
        await user.save();
    }
    res.redirect('favourite-list');
}

exports.removeFavouriteHome = async (req, res, next) => {
    const homeId = req.body.id;
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    if (user.favourites.includes(homeId)) {
        user.favourites=user.favourites.filter(fav => fav != homeId);
        await user.save();
    }
    res.redirect('favourite-list');
}

exports.houseDetails = (req, res, next) => {
    const homeId = req.params.homeId;
    Home.findById(homeId).then(homeFound => {
        if (!homeFound) {
            res.redirect("/");
        } else {
            res.render('store/house-details', {
                homeDetails: homeFound,
                pageTitle: 'house details',
                currPage: 'house-details',
                isLoggedIn: req.isLoggedIn,
                user: req.session.user
            })
        }
    })
}



