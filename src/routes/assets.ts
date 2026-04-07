import { Router } from "express";
import { body, param, query } from "express-validator";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import * as ctrl from "../controllers/assets";

const router = Router();

router.get(
  "/",
  authenticate,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 200 }),
    query("status").optional().isString().trim(),
    query("category").optional().isString().trim(),
    query("q").optional().isString().trim().escape(),
    validate,
  ],
  ctrl.getAssets,
);

router.get(
  "/:id",
  authenticate,
  [param("id").isMongoId(), validate],
  ctrl.getAsset,
);

router.post(
  "/",
  authenticate,
  requireRole("technician"),
  [
    body("name").notEmpty().trim().escape(),
    body("code").optional().trim().escape(),
    body("category").notEmpty().trim(),
    body("status").optional().isIn(["operational", "faulty", "maintenance", "decommissioned"]),
    body("location").notEmpty().trim().escape(),
    validate,
  ],
  ctrl.createAsset,
);

router.patch(
  "/:id",
  authenticate,
  requireRole("technician"),
  [
    param("id").isMongoId(),
    body("name").optional().trim().escape(),
    body("status").optional().isIn(["operational", "faulty", "maintenance", "decommissioned"]),
    validate,
  ],
  ctrl.updateAsset,
);

router.delete(
  "/:id",
  authenticate,
  requireRole("manager"),
  [param("id").isMongoId(), validate],
  ctrl.deleteAsset,
);

export default router;
