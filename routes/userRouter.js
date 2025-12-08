const path = require('path');

const express = require('express');
const userRouter = express.Router();
const userController = require('../controller/userController');


userRouter.get("/", userController.getHome);
userRouter.get("/bookings", userController.bookings);
userRouter.get("/favourite-list", userController.favouriteList);
userRouter.post("/favourite-list", userController.addFavouriteHome);
userRouter.post("/remove-favourite", userController.removeFavouriteHome);
userRouter.get("/home/:homeId", userController.houseDetails);

module.exports = userRouter;