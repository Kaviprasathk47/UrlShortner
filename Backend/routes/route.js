import express from "express";
import { UserDataPost, GetUserData } from "../controllers/control.js";

const router = express.Router();

router.post("/", UserDataPost);
router.get("/:alias", GetUserData);

export default router;
