type UserWithPassword = User & {
    password: string;
};
const login = async (email: string, clearTextPassword: string) => {
    const user = await findByEmail(email);
    const isValid = await bcrypt.compare(clearTextPassword,
        user.password);
    if (isValid) {
        return user;
    } else {
        throw new Error("Invalid credentials provided");
    }
};
const findByEmail = (email: string): Promise<UserWithPassword> => {
    return db.one(FIND_BY_EMAIL_SQL, [email]);
};