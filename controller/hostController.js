const Home = require("../models/home");
const User = require('../models/user');
const { v2: cloudinary } = require('cloudinary');
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})
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
    if (!req.file) {
        res.status(402).send("photo not found");
    }
    const buffer = req.file.buffer;
    cloudinary.uploader.upload_stream({ folder: "cozyNest" },
        (err, result) => {
            if (err) {
                console.log("cloudinary upload error", err);
                return res.status(500).send("image upload failed");
            }

            const photoUrl = result.secure_url;
            const home = new Home({ houseName, price, location, photoUrl, rating, description });
            home.save().then(() => {
                console.log("data written successfully");
            }).catch((err) => {
                console.log("error while writting", err);
            });
            res.redirect('/host/host-homes');
        }
    ).end(buffer);
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
        if (req.file) {
            home.photoUrl = photoUrl;
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
