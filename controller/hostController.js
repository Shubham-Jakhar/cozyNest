const Home = require("../models/home");
const User = require('../models/user');

exports.getAddHome = (req, res, next) => {
    res.render('host/edit-home', {
        editing: false,
        pageTitle: 'add-home',
        currPage: 'addHome',
        isLoggedIn: req.isLoggedIn,
        user: req.session.user
    });
}

exports.postAddHome = (req, res, next) => {
    
    const { houseName, price, location, rating, description, id } = req.body;
    console.log(req.file);
    if(!req.file){
        res.status(402).send("photo not found");
    }
    const photoUrl = req.file.filename;
    const home = new Home({ houseName, price, location, photoUrl, rating, description });
    home.save().then(() => {
        console.log("data written successfully");
    }).catch((err) => {
        console.log("error while writting", err);
    });
    res.redirect('/host/host-homes');
};

exports.getHostHome = (req, res, next) => {
    Home.find().then(hostHomes => {
        res.render('host/host-homes', {
            hostHomes: hostHomes,
            pageTitle: 'host-homes',
            currPage: 'host-homes',
            isLoggedIn: req.isLoggedIn,
            user: req.session.user
        });
    })
};

exports.getEditHome = (req, res, next) => {
    const homeId = req.params.homeId;
    const editing = req.query.editing === 'true';
    Home.findById(homeId).then(home => {
        res.render('host/edit-home', {
            home: home,
            pageTitle: 'edit-home',
            currPage: 'host-homes',
            editing: editing,
            isLoggedIn: req.isLoggedIn,
            user: req.session.user
        });
    })

}

exports.postEditHome = (req, res, next) => {
    const { id, houseName, price, location, photoUrl, rating, description } = req.body;
    Home.findById(id).then(home => {
        home.houseName = houseName;
        home.price = price;
        home.location = location;
        home.rating = rating;
        home.description = description;
        if(req.file){
            home.photoUrl=photoUrl;
        }
        home.save().then(() => {
            console.log("home updated")
        }).catch(error => {
            console.log("file write error while updating", error)
        });
        res.redirect('/host/host-homes');
    }).catch(error => {
        console.log("error while finding home", error)
    });


};

exports.postDeleteHome = async (req, res, next) => {
    const homeId = req.params.homeId;
    try {
        await Home.findByIdAndDelete(homeId);
        await User.updateMany(
            {},
            { $pull: { favourites: homeId } }
        );
        res.redirect('/host/host-homes');
    } catch (error) {
        console.log("file write error while deleting", error);
        res.redirect('/host/host-homes');
    }
};
