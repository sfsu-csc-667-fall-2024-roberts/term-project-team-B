import express from 'express';
const router = express.Router();

router.get('/game', (req, res) => {
  res.render('game'); // Render the Game EJS template
});
export default router;
