import express from 'express';
import { addUser, removeUser } from '../userService';
const router = express.Router();

router.get('/login', (req, res) => {
  res.render('auth/login');
});

router.get('/register', (req, res) => {
  res.render('auth/register');
});

router.post('/add-user', async (req, res) => {
  const { username, password, email } = req.body; // Include email
  try {
    const user = await addUser(username, password, email); // Pass email as well
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error adding user' });
  }
});

router.post('/remove-user', async (req, res) => {
  const { username } = req.body;
  try {
    const result = await removeUser(username);
    res.status(200).json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error removing user' });
  }
});

export default router;
