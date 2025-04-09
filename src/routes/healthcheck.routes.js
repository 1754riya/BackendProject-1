import { Router } from "express";
import { HealthCheck } from "../controllers/healthcheck.controller.js";


const router = Router();

router.route("/").get(HealthCheck);

export default router;