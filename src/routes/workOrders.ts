import { Router } from "express";
import { body, param, query } from "express-validator";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import * as ctrl from "../controllers/workOrders";

const router = Router();

router.get(
  "/",
  authenticate,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 200 }),
    query("status").optional().isIn(["open", "assigned", "in_progress", "on_hold", "completed", "cancelled"]),
    query("priority").optional().isIn(["low", "medium", "high", "critical"]),
    query("type").optional().isString().trim(),
    query("q").optional().isString().trim().escape(),
    validate,
  ],
  ctrl.getWorkOrders,
);

router.get(
  "/:id",
  authenticate,
  [param("id").isMongoId(), validate],
  ctrl.getWorkOrder,
);

router.post(
  "/",
  authenticate,
  requireRole("technician"),
  [
    body("title").notEmpty().trim().escape(),
    body("type").notEmpty().isIn(["corrective", "preventive", "inspection", "emergency"]),
    body("priority").notEmpty().isIn(["low", "medium", "high", "critical"]),
    body("assetId").optional().isMongoId(),
    body("assignedTo").optional().trim().escape(),
    validate,
  ],
  ctrl.createWorkOrder,
);

router.patch(
  "/:id",
  authenticate,
  requireRole("technician"),
  [
    param("id").isMongoId(),
    body("status").optional().isIn(["open", "assigned", "in_progress", "on_hold", "completed", "cancelled"]),
    body("priority").optional().isIn(["low", "medium", "high", "critical"]),
    validate,
  ],
  ctrl.updateWorkOrder,
);

router.delete(
  "/:id",
  authenticate,
  requireRole("manager"),
  [param("id").isMongoId(), validate],
  ctrl.deleteWorkOrder,
);

export default router;
