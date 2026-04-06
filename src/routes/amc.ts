import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import * as ctrl from "../controllers/amcContracts";

const router = Router();

router.get("/", authenticate, ctrl.getAMCContracts);
router.post("/", authenticate, requireRole("manager"), ctrl.createAMCContract);
router.patch("/:id", authenticate, requireRole("manager"), ctrl.updateAMCContract);
router.delete("/:id", authenticate, requireRole("manager"), ctrl.deleteAMCContract);

export default router;
