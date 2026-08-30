const express  = require("express");
const router = express.Router();
const db = require("../db/queries");

router.get("/", (req, res) => {
    res.redirect("/");
});

router.get("/new", async (req, res) => {
    if (!req.user) return res.redirect("/log-in");
    res.render("messages/form");
});

router.post("/new", async (req, res, next) => {
    if (!req.user) return res.redirect("/log-in");

    const { title, text } = req.body;

    try {
        await db.createMessage(title, text, req.user.id);
        res.redirect("/");
    } catch (err) {
        next(err);
    }
});

router.post("/:id/delete", async (req, res, next) => {
    if (!req.user || !req.user.is_admin) {
        return res.status(403).send("Forbidden");
    }

    try {
        await db.deleteMessage(req.params.id);
        res.redirect("/");
    } catch (err) {
        next(err);
    }
});

module.exports = router;