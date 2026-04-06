import { Router } from "express";
import { body, param, query } from "express-validator";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import * as ctrl from "../controllers/vendors";

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
  ctrl.getVendors,
);

router.get("/:id", authenticate, [param("id").isMongoId(), validate], ctrl.getVendor);

router.post(
  "/",
  authenticate,
  requireRole("manager"),
  [
    body("name").notEmpty().trim().escape(),
    body("email").isEmail().normalizeEmail(),
    body("category").notEmpty().trim(),
    body("contactName").optional().trim().escape(),
    validate,
  ],
  ctrl.createVendor,
);

router.patch(
  "/:id",
  authenticate,
  requireRole("manager"),
  [
    param("id").isMongoId(),
    body("email").optional().isEmail().normalizeEmail(),
    body("rating").optional().isFloat({ min: 0, max: 5 }),
    validate,
  ],
  ctrl.updateVendor,
);

router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  [param("id").isMongoId(), validate],
  ctrl.deleteVendor,
);

export default router;
