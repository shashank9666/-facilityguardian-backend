import { Request, Response, NextFunction } from "express";
import { MeterReading } from "../models/MeterReading";

export async function getMeterReadings(req: Request, res: Response, next: NextFunction) {
  try {
    const readings = await MeterReading.find().sort({ readingDate: -1 });
    res.json({ success: true, data: readings });
  } catch (err) { next(err); }
}

export async function createMeterReading(req: Request, res: Response, next: NextFunction) {
  try {
    const reading = await MeterReading.create(req.body);
    res.status(201).json({ success: true, data: reading });
  } catch (err) { next(err); }
}

export async function getMeterReading(req: Request, res: Response, next: NextFunction) {
  try {
    const reading = await MeterReading.findById(req.params.id);
    if (!reading) return res.status(404).json({ success: false, message: "Reading not found" });
    res.json({ success: true, data: reading });
  } catch (err) { next(err); }
}
