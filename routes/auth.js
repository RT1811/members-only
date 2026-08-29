const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const pool = require("../db/pool");
const passport = require("passport");

router.get("/sign-up", (req, res) => {
    res.render("sign-up-form");
});

router.post("/sign-up", async (req, res, next) => {
    const { first_name, last_name, username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            "INSERT INTO users (first_name, last_name, username, password) VALUES ($1, $2, $3, $4)",
            [first_name, last_name, username, hashedPassword]
        );
        res.redirect("/log-in");
    } catch(err) {
        next(err);
    }
});

router.get("/log-in", (req, res) => {
    res.render("log-in-form");
});

router.post(
    "/log-in",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/log-in",
    })
);

router.post("/log-out", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect("/");
    });
});

module.exports = router;