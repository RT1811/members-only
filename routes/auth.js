const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const pool = require("../db/pool");
const passport = require("passport");
const { body, validationResult } = require("express-validator");

const signUpValidation = [
    body("first_name")
        .trim()
        .notEmpty()
        .withMessage("First name is required"),

    body("last_name")
        .trim()
        .notEmpty()
        .withMessage("Last name is required"),

    body("username")
        .trim()
        .notEmpty()
        .withMessage("Username is required"),

    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),

    body("confirmPassword").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Passwords do not match");
        }

        return true;
    }),
];

router.get("/sign-up", (req, res) => {
    res.render("sign-up-form", { errors: [] });
});

router.post("/sign-up", signUpValidation, async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).render("sign-up-form", {
            errors: errors.array(),
        });
    }

    const {
        first_name,
        last_name,
        username,
        password,
        is_admin,
    } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO public.users
            (first_name, last_name, username, password, is_admin)
            VALUES ($1, $2, $3, $4, $5)`,
            [
                first_name,
                last_name,
                username,
                hashedPassword,
                is_admin === "on",
            ]
        );

        res.redirect("/log-in");
    } catch (err) {
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

router.get("/join", (req, res) => {
    if (!req.user) return res.redirect("/log-in");
    res.render("join-form");
});

router.post("/join", async (req, res, next) => {
    if (!req.user) return res.redirect("/log-in");

    const { passcode } = req.body;

    try {
        if (passcode === process.env.MEMBER_PASSCODE) {
        await pool.query("UPDATE public.users SET membership_status = $1 WHERE id = $2", [
            "member",
            req.user.id,
        ]);
        }
        res.redirect("/");
    } catch (err) {
        next(err);
    }
});

module.exports = router;