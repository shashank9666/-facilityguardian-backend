import { Request, Response, NextFunction } from "express";
import { ChecklistSubmission } from "../models/ChecklistSubmission";

export async function getChecklistSubmissions(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, submittedBy } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (category)    filter.category = category;
    if (submittedBy) filter.submittedBy = submittedBy;

    const data = await ChecklistSubmission.find(filter).sort({ submittedAt: -1 });
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function createChecklistSubmission(req: Request, res: Response, next: NextFunction) {
  try {
    const submission = await ChecklistSubmission.create(req.body);
    res.status(201).json({ success: true, data: submission });
  } catch (err) { next(err); }
}

export async function getChecklistSubmission(req: Request, res: Response, next: NextFunction) {
  try {
    const submission = await ChecklistSubmission.findById(req.params.id);
    if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });
    res.json({ success: true, data: submission });
  } catch (err) { next(err); }
}
