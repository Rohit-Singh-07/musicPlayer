import { Document, Model } from "mongoose";
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: string;
    playlist: string[];
}
declare const User: Model<IUser>;
export default User;
//# sourceMappingURL=model.d.ts.map