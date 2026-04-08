import { Router } from "express";
import { body, param } from "express-validator";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import * as ctrl from "../controllers/auth";

const router = Router();

router.post(
  "/register",
  [
    body("name").notEmpty().trim().escape(),
    body("email").isEmail().normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter")
      .matches(/[0-9]/).withMessage("Password must contain a number"),
    body("role").optional().isIn(["admin", "manager", "technician", "viewer"]),
    validate,
  ],
  ctrl.register,
);

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty(),
    validate,
  ],
  ctrl.login,
);

router.get("/me", authenticate, ctrl.getMe);
router.patch("/me", authenticate, ctrl.updateMe);

router.patch(
  "/change-password",
  authenticate,
  [
    body("currentPassword").notEmpty(),
    body("newPassword")
      .isLength({ min: 8 })
      .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter")
      .matches(/[0-9]/).withMessage("Password must contain a number"),
    validate,
  ],
  ctrl.changePassword,
);

router.get("/technicians", authenticate, ctrl.getTechnicians);

// Admin-only user management
router.get("/users", authenticate, requireRole("admin"), ctrl.getUsers);

router.patch(
  "/users/:id",
  authenticate,
  requireRole("admin"),
  [
    param("id").isMongoId(),
    body("name").optional().trim().escape(),
    body("role").optional().isIn(["admin", "manager", "technician", "viewer"]),
    body("active").optional().isBoolean(),
    validate,
  ],
  ctrl.updateUser,
);

router.delete(
  "/users/:id",
  authenticate,
  requireRole("admin"),
  [param("id").isMongoId(), validate],
  ctrl.deleteUser,
);

export default router;
