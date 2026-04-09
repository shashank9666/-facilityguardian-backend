import { Router } from "express";
import { body, param, query } from "express-validator";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import * as ctrl from "../controllers/serviceRequests";

const router = Router();

router.get(
  "/",
  authenticate,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 200 }),
    query("status").optional().isString().trim(),
    query("severity").optional().isIn(["low", "medium", "high", "critical"]),
    query("q").optional().isString().trim().escape(),
    validate,
  ],
  ctrl.getServiceRequests,
);

router.get("/:id", authenticate, [param("id").isMongoId(), validate], ctrl.getServiceRequest);

router.post(
  "/",
  authenticate,
  [
    body("title").notEmpty().trim().escape(),
    body("description").notEmpty().trim().escape(),
    body("severity").notEmpty().isIn(["low", "medium", "high", "critical"]),
    body("location").notEmpty().trim().escape(),
    validate,
  ],
  ctrl.createServiceRequest,
);

router.patch(
  "/:id",
  authenticate,
  requireRole("technician"),
  [
    param("id").isMongoId(),
    body("status").optional().isIn(["reported", "investigating", "resolved", "closed"]),
    body("severity").optional().isIn(["low", "medium", "high", "critical"]),
    validate,
  ],
  ctrl.updateServiceRequest,
);

router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  [param("id").isMongoId(), validate],
  ctrl.deleteServiceRequest,
);

export default router;
