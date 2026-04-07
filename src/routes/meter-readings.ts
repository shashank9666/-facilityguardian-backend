import { Router } from "express";
import { param } from "express-validator";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { validate } from "../middleware/validate";
import * as ctrl from "../controllers/meterReadings";

const router = Router();

router.get("/", authenticate, ctrl.getMeterReadings);
router.post("/", authenticate, ctrl.createMeterReading);
router.get("/:id", authenticate, [param("id").isMongoId(), validate], ctrl.getMeterReading);
router.patch("/:id", authenticate, requireRole("technician"), [param("id").isMongoId(), validate], ctrl.updateMeterReading);
router.delete("/:id", authenticate, requireRole("manager"), [param("id").isMongoId(), validate], ctrl.deleteMeterReading);

export default router;
