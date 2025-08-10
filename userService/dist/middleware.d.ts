import type { Request, Response, NextFunction } from "express";
import { type IUser } from "./model.js";
export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}
export declare const isAuth: (req: Request, res: Response, next: NextFunction) => Promise<any>;
//# sourceMappingURL=middleware.d.ts.map