import { Router } from "express";
import { body, param, query } from "express-validator";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import * as ctrl from "../controllers/inventory";

const router = Router();

router.get(
  "/",
  authenticate,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 200 }),
    query("status").optional().isIn(["in_stock", "low_stock", "out_of_stock"]),
    query("category").optional().isString().trim(),
    query("q").optional().isString().trim().escape(),
    validate,
  ],
  ctrl.getInventory,
);

router.get("/:id", authenticate, [param("id").isMongoId(), validate], ctrl.getInventoryItem);

router.post(
  "/",
  authenticate,
  requireRole("technician"),
  [
    body("name").notEmpty().trim().escape(),
    body("code").optional().trim().escape(),
    body("category").notEmpty().trim(),
    body("quantity").isInt({ min: 0 }),
    body("minQuantity").isInt({ min: 0 }),
    body("unitCost").isFloat({ min: 0 }),
    body("unit").notEmpty().trim(),
    validate,
  ],
  ctrl.createInventoryItem,
);

router.patch(
  "/:id",
  authenticate,
  requireRole("technician"),
  [
    param("id").isMongoId(),
    body("quantity").optional().isInt({ min: 0 }),
    body("unitCost").optional().isFloat({ min: 0 }),
    validate,
  ],
  ctrl.updateInventoryItem,
);

router.patch(
  "/:id/restock",
  authenticate,
  requireRole("technician"),
  [
    param("id").isMongoId(),
    body("quantity").isInt({ min: 1 }),
    validate,
  ],
  ctrl.restockItem,
);

router.delete(
  "/:id",
  authenticate,
  requireRole("manager"),
  [param("id").isMongoId(), validate],
  ctrl.deleteInventoryItem,
);

export default router;
