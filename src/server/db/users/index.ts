import bcrypt from "bcrypt";
import { createHash } from "crypto";
import db from "../connection";
import { REGISTER_SQL } from "./sql";
type User = {
    id: number;
    username: string;
    email: string;
    gravatar: string;
};
const register = async (
    username: string,
    email: string,
    clearTextPassword: string
): Promise<User> => {
    const password = await bcrypt.hash(clearTextPassword, 10);
    const gravatar =
        createHash("sha256").update(email).digest("hex");
    return await db.one(REGISTER_SQL, [username, email, password,
        gravatar]);
};
export default { register };
