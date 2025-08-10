import express from "express";
import { loginUser, registerUser, userProfile } from "./controller.js";
import { isAuth } from "./middleware.js";
const router = express.Router();
router.post("/user/register", registerUser);
router.post("/user/login", loginUser);
router.get("/user/profile", isAuth, userProfile);
export default router;
//# sourceMappingURL=route.js.map