import express from "express";

const router = express.Router();

router.get("/", (_request, response) => {
    response.render("root", {name: "Team 6"});
});

export default router;