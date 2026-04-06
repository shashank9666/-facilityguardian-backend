import { Request, Response, NextFunction } from "express";
import { Space } from "../models/Space";

// GET /api/spaces
export async function getSpaces(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const {
      status,
      floor,
      building,
      q,
      page = "1",
      limit = "100",
    } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (floor) filter.floor = floor;
    if (building) filter.building = building;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [spaces, total] = await Promise.all([
      Space.find(filter)
        .sort({ floor: 1, name: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Space.countDocuments(filter),
    ]);
    res.json({ success: true, data: spaces, total, page: parseInt(page) });
  } catch (err) {
    next(err);
  }
}

// GET /api/spaces/:id
export async function getSpace(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const space = await Space.findById(req.params.id);
    if (!space) {
      res.status(404).json({ success: false, message: "Space not found" });
      return;
    }
    res.json({ success: true, data: space });
  } catch (err) {
    next(err);
  }
}

// POST /api/spaces
export async function createSpace(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const space = await Space.create(req.body);
    res.status(201).json({ success: true, data: space });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/spaces/:id
export async function updateSpace(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const space = await Space.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!space) {
      res.status(404).json({ success: false, message: "Space not found" });
      return;
    }
    res.json({ success: true, data: space });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/spaces/:id
export async function deleteSpace(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const space = await Space.findByIdAndDelete(req.params.id);
    if (!space) {
      res.status(404).json({ success: false, message: "Space not found" });
      return;
    }
    res.json({ success: true, message: "Space deleted" });
  } catch (err) {
    next(err);
  }
}
