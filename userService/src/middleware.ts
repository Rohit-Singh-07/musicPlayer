import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import User, { type IUser } from "./model.js";
import TryCatch from "./TryCatch.js"; 

export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}

export const isAuth = TryCatch(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const token = req.headers.token as string;

        if (!token) {
            res.status(403).json({ message: "Please Login" });
            return;
        }

        const decodedValue = jwt.verify(
            token,
            process.env.JWT_SEC as string
        ) as JwtPayload;

        if (!decodedValue || !decodedValue._id) {
            res.status(403).json({ message: "Invalid Token" });
            return;
        }

        const userId = decodedValue._id;
        const user = await User.findById(userId).select("-password");

        if (!user) {
            res.status(404).json({ message: "User not Found" });
            return;
        }

        req.user = user;
        next();
    }
);
