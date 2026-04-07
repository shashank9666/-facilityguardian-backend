import { Request, Response, NextFunction } from "express";
import { MeterReading } from "../models/MeterReading";

export async function getMeterReadings(req: Request, res: Response, next: NextFunction) {
  try {
    const { meterType, startDate, endDate } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (meterType) filter.meterType = meterType;
    if (startDate || endDate) {
      filter.readingDate = {};
      if (startDate) (filter.readingDate as Record<string, string>).$gte = startDate;
      if (endDate)   (filter.readingDate as Record<string, string>).$lte = endDate;
    }
    const readings = await MeterReading.find(filter).sort({ readingDate: -1 });
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

export async function updateMeterReading(req: Request, res: Response, next: NextFunction) {
  try {
    const reading = await MeterReading.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!reading) return res.status(404).json({ success: false, message: "Reading not found" });
    res.json({ success: true, data: reading });
  } catch (err) { next(err); }
}

export async function deleteMeterReading(req: Request, res: Response, next: NextFunction) {
  try {
    const reading = await MeterReading.findByIdAndDelete(req.params.id);
    if (!reading) return res.status(404).json({ success: false, message: "Reading not found" });
    res.json({ success: true, message: "Reading deleted" });
  } catch (err) { next(err); }
}
