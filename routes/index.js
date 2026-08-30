const { Router } = require("express");
const db = require("../db/queries");

const router = Router();

router.get("/", async (req, res, next) => {
    try {
        const messages = await db.getAllMessages();

        res.render("index", { messages });
    } catch (err) {
        next(err);
    }
});

module.exports = router;