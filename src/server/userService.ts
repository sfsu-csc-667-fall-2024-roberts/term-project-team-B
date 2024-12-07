import User from './userModel';

export const addUser = async (username: string, password: string, email: string) => {
  const newUser = new User({ username, password, email });
  return await newUser.save();
};

export const removeUser = async (username: string) => {
  return await User.findOneAndDelete({ username });
};
