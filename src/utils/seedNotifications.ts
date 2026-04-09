import { ServiceRequest } from "../models/ServiceRequest";
import { WorkOrder } from "../models/WorkOrder";
import { User } from "../models/User";
import { Inventory } from "../models/Inventory";
import mongoose from "mongoose";
import { createSystemNotification } from "./notifications";

export async function seedMissingNotifications() {
  try {
    console.log("Seeding missing notifications for existing items...");

    // 1. Service Requests (Notify admins and managers for reported/investigating)
    const serviceRequests = await ServiceRequest.find({ status: { $in: ["reported", "investigating"] } });
    for (const sr of serviceRequests) {
      // Notify both Admins and Managers
      const targetRoles = ["admin", "manager"];
      for (const role of targetRoles) {
        await createSystemNotification({
          role,
          type: "warning",
          title: `Active Service Request: ${sr.title}`,
          message: `${sr.severity} severity · ${sr.requestNumber}`,
          link: "/service-requests",
        });
      }
    }

    // 2. Work Orders (Notify technicians for assigned/in_progress)
    const wos = await WorkOrder.find({ status: { $in: ["assigned", "in_progress"] } });
    for (const wo of wos) {
      if (!wo.assignedTo) continue;

      // Find user by name OR ID
      const user = await User.findOne({ 
        $or: [
          { name: wo.assignedTo },
          { _id: wo.assignedTo.match(/^[0-9a-fA-F]{24}$/) ? wo.assignedTo : new mongoose.Types.ObjectId() }
        ]
      });

      if (user) {
        await createSystemNotification({
          userId: user._id,
          type: "info",
          title: `Task Assigned: ${wo.title}`,
          message: `${wo.priority} priority · ${wo.woNumber}`,
          link: "/my-tasks",
        });
      }
    }

    // 3. Inventory (Notify admins and managers)
    const items = await Inventory.find({ status: { $in: ["low_stock", "out_of_stock"] } });
    for (const item of items) {
      const targetRoles = ["admin", "manager"];
      for (const role of targetRoles) {
        await createSystemNotification({
          role,
          type: item.status === "out_of_stock" ? "error" : "warning",
          title: `${item.status === "out_of_stock" ? "Out of Stock" : "Low Stock"}: ${item.name}`,
          message: `${item.quantity} ${item.unit} remaining`,
          link: "/inventory",
        });
      }
    }

    console.log("Seeding complete.");
  } catch (err) {
    console.error("Failed to seed notifications:", err);
  }
}
