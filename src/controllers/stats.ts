import { Request, Response, NextFunction } from "express";
import { Asset } from "../models/Asset";
import { WorkOrder } from "../models/WorkOrder";
import { Incident } from "../models/Incident";
import { Inventory } from "../models/Inventory";
import { Vendor } from "../models/Vendor";
import { Space } from "../models/Space";

export async function getGlobalStats(req: Request, res: Response, next: NextFunction) {
  try {
    const { site, department } = req.query;
    const filter: any = {};
    if (department && department !== "All") filter.department = department;

    // For site filtering, we need to find assets/incidents/WOs in spaces that belong to that site
    let siteSpaceIds: any[] = [];
    if (site && site !== "All") {
      const targetSpaces = await Space.find({ site: String(site) }).select("_id");
      siteSpaceIds = targetSpaces.map(s => s._id);
    }

    const applySiteFilter = (query: any, field: string = "location") => {
      if (siteSpaceIds.length > 0) {
        query[field] = { $in: siteSpaceIds };
      }
      return query;
    };

    const [
      totalAssets, faultyAssets,
      totalWOs, openWOs, criticalWOs, overdueWOs,
      totalIncidents, activeIncidents,
      criticalIncidents, totalInventoryValue,
      lowStockCount, totalCapacity, totalOccupied
    ] = await Promise.all([
      Asset.countDocuments(applySiteFilter({ ...filter })),
      Asset.countDocuments(applySiteFilter({ ...filter, status: "faulty" })),
      WorkOrder.countDocuments(applySiteFilter({ ...filter }, "assetId")), // Simplified
      WorkOrder.countDocuments(applySiteFilter({ ...filter, status: { $in: ["open", "assigned", "in_progress"] } }, "assetId")),
      WorkOrder.countDocuments(applySiteFilter({ ...filter, priority: "critical", status: { $ne: "completed" } }, "assetId")),
      WorkOrder.countDocuments(applySiteFilter({ ...filter, status: { $ne: "completed" }, dueDate: { $lt: new Date() } }, "assetId")),
      Incident.countDocuments(applySiteFilter({ ...filter })),
      Incident.countDocuments(applySiteFilter({ ...filter, status: { $nin: ["resolved", "closed"] } })),
      Incident.countDocuments(applySiteFilter({ ...filter, severity: "critical", status: { $nin: ["resolved", "closed"] } })),
      Inventory.aggregate([{ $group: { _id: null, total: { $sum: { $multiply: ["$quantity", "$unitCost"] } } } }]),
      Inventory.countDocuments({ status: { $ne: "in_stock" } }),
      Space.aggregate([{ $match: site && site !== "All" ? { site: String(site) } : {} }, { $group: { _id: null, total: { $sum: "$capacity" } } }]),
      Space.aggregate([{ $match: site && site !== "All" ? { site: String(site) } : {} }, { $group: { _id: null, total: { $sum: "$occupied" } } }]),
    ]);

    // Trend calculation
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date(); sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [recentWOs, prevWOs] = await Promise.all([
      WorkOrder.countDocuments(applySiteFilter({ ...filter, createdAt: { $gte: thirtyDaysAgo } }, "assetId")),
      WorkOrder.countDocuments(applySiteFilter({ ...filter, createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }, "assetId")),
    ]);

    res.json({
      success: true,
      data: {
        assets: { total: totalAssets, faulty: faultyAssets },
        workOrders: {
          total: totalWOs,
          open: openWOs,
          critical: criticalWOs,
          overdue: overdueWOs,
          trend: prevWOs > 0 ? ((recentWOs - prevWOs) / prevWOs * 100).toFixed(1) : 0
        },
        incidents: { total: totalIncidents, active: activeIncidents, critical: criticalIncidents },
        inventory: { value: totalInventoryValue[0]?.total || 0, lowStock: lowStockCount },
        spaces: {
          capacity: totalCapacity[0]?.total || 0,
          occupied: totalOccupied[0]?.total || 0,
          occupancyRate: totalCapacity[0]?.total > 0 ? (totalOccupied[0]?.total / totalCapacity[0]?.total * 100).toFixed(1) : 0
        }
      }
    });
  } catch (err) { next(err); }
}

export async function getAssetDistribution(req: Request, res: Response, next: NextFunction) {
  try {
    const distribution = await Asset.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    res.json({ success: true, data: distribution });
  } catch (err) { next(err); }
}

export async function getWorkOrderGrowth(req: Request, res: Response, next: NextFunction) {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const growth = await WorkOrder.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json({ success: true, data: growth });
  } catch (err) { next(err); }
}
