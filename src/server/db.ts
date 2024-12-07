import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/gamedb')
  .then(() => console.log('Connected to the databse'))
  .catch(err => console.error('Connection error', err));

export default mongoose;
