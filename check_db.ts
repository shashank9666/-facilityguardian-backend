/// <reference types="node" />
import "dotenv/config";

import mongoose from "mongoose";
import { Asset } from "./src/models/Asset";
import { WorkOrder } from "./src/models/WorkOrder";
import { Vendor } from "./src/models/Vendor";
import { Incident } from "./src/models/Incident";
import { Inventory } from "./src/models/Inventory";
import { Space } from "./src/models/Space";
import { PMSchedule } from "./src/models/PMSchedule";
import { User } from "./src/models/User";

const MONGO_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/fmnexus";

async function check() {
  await mongoose.connect(MONGO_URI);
  console.log("✓ Connected to MongoDB");

  const counts = await Promise.all([
    User.countDocuments({}),
    Asset.countDocuments({}),
    WorkOrder.countDocuments({}),
    Vendor.countDocuments({}),
    Incident.countDocuments({}),
    Inventory.countDocuments({}),
    Space.countDocuments({}),
    PMSchedule.countDocuments({}),
  ]);

  console.log({
    users: counts[0],
    assets: counts[1],
    workOrders: counts[2],
    vendors: counts[3],
    incidents: counts[4],
    inventory: counts[5],
    spaces: counts[6],
    pmSchedules: counts[7],
  });

  await mongoose.disconnect();
}

check().catch(console.error);
