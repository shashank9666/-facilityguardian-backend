import { Router } from "express";
import * as ctrl from "../controllers/stats";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, ctrl.getGlobalStats);
router.get("/assets", authenticate, ctrl.getAssetDistribution);
router.get("/work-orders", authenticate, ctrl.getWorkOrderGrowth);

export default router;
