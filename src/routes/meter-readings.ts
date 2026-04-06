import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as ctrl from "../controllers/meterReadings";

const router = Router();

router.get("/", authenticate, ctrl.getMeterReadings);
router.post("/", authenticate, ctrl.createMeterReading);
router.get("/:id", authenticate, ctrl.getMeterReading);

export default router;
