import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as ctrl from "../controllers/checklists";

const router = Router();

router.get("/", authenticate, ctrl.getChecklistSubmissions);
router.post("/", authenticate, ctrl.createChecklistSubmission);
router.get("/:id", authenticate, ctrl.getChecklistSubmission);

export default router;
