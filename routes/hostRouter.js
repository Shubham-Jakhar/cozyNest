
const express = require('express');
const hostRouter = express.Router();
const hostController = require('../controller/hostController');

hostRouter.get("/host/add-home", hostController.getAddHome);
hostRouter.post("/host/add-home", hostController.postAddHome);
hostRouter.get("/host/host-homes", hostController.getHostHome);
hostRouter.get("/host/edit-home/:homeId", hostController.getEditHome);
hostRouter.post("/host/edit-home", hostController.postEditHome);
hostRouter.post("/host/delete-home/:homeId", hostController.postDeleteHome);



exports.hostRouter = hostRouter;
