import { Router } from "express";
import * as ctrl from "../controllers/notifications";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, ctrl.getNotifications);
router.patch("/mark-all-read", authenticate, ctrl.markAllAsRead);
router.patch("/:id/read", authenticate, ctrl.markAsRead);
router.delete("/:id", authenticate, ctrl.deleteNotification);

export default router;
