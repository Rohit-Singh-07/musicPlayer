import jwt, {} from "jsonwebtoken";
import User, {} from "./model.js";
import TryCatch from "./TryCatch.js";
export const isAuth = TryCatch(async (req, res, next) => {
    const token = req.headers.token;
    if (!token) {
        res.status(403).json({ message: "Please Login" });
        return;
    }
    const decodedValue = jwt.verify(token, process.env.JWT_SEC);
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
});
//# sourceMappingURL=middleware.js.map