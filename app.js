require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const initializePassport = require("./config/passport");

const app = express();
initializePassport(passport);

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

const indexRouter = require("./routes/index");
const authRouter = require("./routes/auth");
app.use("/", indexRouter);
app.use("/", authRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));    