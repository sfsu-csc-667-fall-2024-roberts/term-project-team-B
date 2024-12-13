import express from 'express';
const router = express.Router();

router.get('/gameLanding', (req, res) => {
  res.render('game/gameLanding'); // Render the gameLanding EJS template
});

export default router;
