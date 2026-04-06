import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import * as ctrl from "../controllers/documents";

const router = Router();

router.get("/", authenticate, ctrl.getDocuments);
router.post("/", authenticate, requireRole("manager"), ctrl.createDocument);
router.patch("/:id", authenticate, requireRole("manager"), ctrl.updateDocument);
router.delete("/:id", authenticate, requireRole("manager"), ctrl.deleteDocument);

export default router;
