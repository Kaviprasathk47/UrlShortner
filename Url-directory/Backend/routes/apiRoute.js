import express from "express";
import { ResolveAlias } from "../controllers/control.js";

const router = express.Router();

router.get("/resolve/:alias", ResolveAlias);

export default router;
