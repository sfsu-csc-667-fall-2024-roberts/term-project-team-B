import express from 'express';
const router = express.Router();

router.get('/game', (req, res) => {
  res.render('game'); // Render the Game EJS template
});

router.get('/gameLanding', (req, res) => {
  res.render('others/gameLanding'); // Render the Game EJS template
});

export default router;
