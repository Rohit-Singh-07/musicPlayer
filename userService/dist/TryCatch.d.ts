import type { Request, Response, NextFunction } from "express";
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;
declare const TryCatch: (handler: AsyncHandler) => AsyncHandler;
export default TryCatch;
//# sourceMappingURL=TryCatch.d.ts.map