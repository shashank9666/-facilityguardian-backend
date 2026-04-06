import { Request, Response, NextFunction } from "express";
import { Inventory } from "../models/Inventory";

// GET /api/inventory
export async function getInventory(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, category, q, page = "1", limit = "50" } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};
    if (status)   filter.status   = status;
    if (category) filter.category = category;
    if (q)        filter.$text    = { $search: q };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      Inventory.find(filter).sort({ name: 1 }).skip(skip).limit(parseInt(limit)),
      Inventory.countDocuments(filter),
    ]);
    res.json({ success: true, data: items, total, page: parseInt(page) });
  } catch (err) { next(err); }
}

// GET /api/inventory/stats
export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const total = await Inventory.countDocuments();
    const in_stock = await Inventory.countDocuments({ status: "in_stock" });
    const low_stock = await Inventory.countDocuments({ status: "low_stock" });
    const out_of_stock = await Inventory.countDocuments({ status: "out_of_stock" });
    
    // Compute total inventory value using aggregation
    const valueAgg = await Inventory.aggregate([
      { $group: { _id: null, totalValue: { $sum: { $multiply: ["$quantity", "$unitCost"] } } } }
    ]);
    const totalValue = valueAgg[0]?.totalValue || 0;

    res.json({ success: true, data: { total, in_stock, low_stock, out_of_stock, totalValue } });
  } catch (err) { next(err); }
}

// GET /api/inventory/:id
export async function getInventoryItem(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) { res.status(404).json({ success: false, message: "Item not found" }); return; }
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
}

// POST /api/inventory
export async function createInventoryItem(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
}

// PATCH /api/inventory/:id
export async function updateInventoryItem(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) { res.status(404).json({ success: false, message: "Item not found" }); return; }
    Object.assign(item, req.body);
    await item.save(); // triggers pre-save hook for status recalculation
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
}

// PATCH /api/inventory/:id/restock — add quantity
export async function restockItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { quantity } = req.body as { quantity: number };
    if (typeof quantity !== "number" || quantity <= 0) {
      res.status(422).json({ success: false, message: "quantity must be a positive number" });
      return;
    }
    const item = await Inventory.findById(req.params.id);
    if (!item) { res.status(404).json({ success: false, message: "Item not found" }); return; }
    item.quantity += quantity;
    item.lastRestocked = new Date();
    await item.save();
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
}

// DELETE /api/inventory/:id
export async function deleteInventoryItem(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) { res.status(404).json({ success: false, message: "Item not found" }); return; }
    res.json({ success: true, message: "Item deleted" });
  } catch (err) { next(err); }
}
