import express from 'express';
const router = express.Router();

router.get('/gameLanding', (req, res) => {
  res.render('others/gameLanding'); // Render the gameLanding EJS template
});

router.get('/createGame', (req, res) => {
  res.render('others/createGame'); // Render the createGame EJS template
});

router.get('/openGames', (req, res) => {
  res.render('others/openGames');
});

router.get('/profile', (req, res) => {
  res.render('others/profile');
});

router.get('/chat', (req, res) => {
  res.render('others/chat');
});

router.get('/login', (req, res) => {
  res.render('auth/login');
});
export default router;
