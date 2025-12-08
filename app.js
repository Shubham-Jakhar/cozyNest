require('dotenv').config();
const express = require('express');
const app = express();
const session = require('express-session');
const mongodbStore = require('connect-mongodb-session')(session);

const userRouter = require('./routes/userRouter');
const { hostRouter } = require('./routes/hostRouter');
const rootDir = require('./utils/pathUtils');
const path = require('path');
const { default: mongoose } = require('mongoose');
const { authRouter } = require('./routes/authRouter');
const multer = require('multer')
const DB_PATH = process.env.DBPATH;




app.set('view engine', 'ejs');
app.set('views', 'views');

const store= new mongodbStore({
    uri: DB_PATH,
    collection:'session'
})

const randomString=(length)=>{
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null, path.join(rootDir, 'public', 'upload'));
    },
    filename:(req,file,cb)=>{
        cb(null,randomString(12)+'-'+file.originalname);
    }
})
const multerOption={
    storage
}
app.use(express.urlencoded());
app.use(multer(multerOption).single('photoUrl'));
app.use(express.static(path.join(rootDir, "public")));
app.use("/upload",express.static(path.join(rootDir,"upload")));
app.use("/host/upload",express.static(path.join(rootDir,"upload")));

app.use(session({
    secret:"shubham jakhar",
    resave: false,
    saveUninitialized: true,
    store: store
}));
app.use((req, res , next)=>{
    req.isLoggedIn=req.session.isLoggedIn;
    next();
})
app.use(authRouter);
app.use(userRouter);
app.use("/host",(req, res, next)=>{
    if(req.isLoggedIn){
        next();
    } else{
        res.redirect("/login");
    }
})
app.use(hostRouter);


app.use((req, res, next) => {
    res.status(404).send("<h1>LOL!   404</h1>");
});


const PORT = 3000;
mongoose.connect(DB_PATH).then(() => {
    app.listen(PORT, () => {
        console.log(`server is running on http://localhost:${PORT}`);
    })
}).catch(error => {
    console.log("error while connecting mongoose", error);
})