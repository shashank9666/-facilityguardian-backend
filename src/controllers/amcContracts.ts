import { Request, Response, NextFunction } from "express";
import { AMCContract } from "../models/AMCContract";

export async function getAMCContracts(req: Request, res: Response, next: NextFunction) {
  try {
    const contracts = await AMCContract.find().sort({ endDate: 1 });
    res.json({ success: true, data: contracts });
  } catch (err) { next(err); }
}

export async function createAMCContract(req: Request, res: Response, next: NextFunction) {
  try {
    const contract = await AMCContract.create(req.body);
    res.status(201).json({ success: true, data: contract });
  } catch (err) { next(err); }
}

export async function updateAMCContract(req: Request, res: Response, next: NextFunction) {
  try {
    const contract = await AMCContract.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!contract) return res.status(404).json({ success: false, message: "Contract not found" });
    res.json({ success: true, data: contract });
  } catch (err) { next(err); }
}

export async function deleteAMCContract(req: Request, res: Response, next: NextFunction) {
  try {
    const contract = await AMCContract.findByIdAndDelete(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: "Contract not found" });
    res.json({ success: true, message: "Contract deleted" });
  } catch (err) { next(err); }
}
