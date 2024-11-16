import express from "express";

const router = express.Router();

router.get("/play", (_request, response) => {
    response.render("games/play", { title: "Play a game" });
});
router.get("/newgame", (_request, response) => {
    response.render("games/newgame", { title: "Create a new game" });
});

export default router;