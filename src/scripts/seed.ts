import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Asset } from "../models/Asset";
import { WorkOrder } from "../models/WorkOrder";
import { Vendor } from "../models/Vendor";
import { Incident } from "../models/Incident";
import { Inventory } from "../models/Inventory";
import { Space } from "../models/Space";
import { PMSchedule } from "../models/PMSchedule";
import { User } from "../models/User";

const MONGO_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/fmnexus";

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✓ Connected to MongoDB");

  // Clear collections
  await Promise.all([
    User.deleteMany({}),
    Asset.deleteMany({}),
    WorkOrder.deleteMany({}),
    Vendor.deleteMany({}),
    Incident.deleteMany({}),
    Inventory.deleteMany({}),
    Space.deleteMany({}),
    PMSchedule.deleteMany({}),
  ]);
  console.log("✓ Collections cleared");

  // Users
  const users = await User.insertMany([
    { name: "Rajesh Kumar",  email: "admin@fmnexus.in",   password: await bcrypt.hash("Admin123", 12), role: "admin",      active: true },
    { name: "Priya Sharma",  email: "manager@fmnexus.in", password: await bcrypt.hash("Admin123", 12), role: "manager",    active: true },
    { name: "Arjun Singh",   email: "tech1@fmnexus.in",   password: await bcrypt.hash("Admin123", 12), role: "technician", active: true },
    { name: "Meena Patel",   email: "tech2@fmnexus.in",   password: await bcrypt.hash("Admin123", 12), role: "technician", active: true },
    { name: "Suresh Babu",   email: "viewer@fmnexus.in",  password: await bcrypt.hash("Admin123", 12), role: "viewer",     active: true },
  ]);
  console.log(`✓ Seeded ${users.length} users`);

  // Assets
  const assets = await Asset.insertMany([
    { name: "Carrier AHU-01",      code: "AHU-001", category: "HVAC",        status: "operational", location: "Building A - Basement", manufacturer: "Carrier",    model: "42NQV020M8",    purchaseDate: new Date("2020-03-15"), value: 285000,  warrantyExpiry: new Date("2025-03-15"), nextMaintenance: new Date("2024-09-01") },
    { name: "Otis Elevator-01",    code: "ELV-001", category: "Elevator",    status: "operational", location: "Building A - Core",     manufacturer: "Otis",       model: "Gen2 Comfort",  purchaseDate: new Date("2019-06-01"), value: 1200000, warrantyExpiry: new Date("2024-06-01"), nextMaintenance: new Date("2024-07-15") },
    { name: "Generator DG-01",     code: "GEN-001", category: "Electrical",  status: "maintenance", location: "Building A - Terrace",  manufacturer: "Cummins",    model: "C150D5",        purchaseDate: new Date("2021-01-10"), value: 450000,  warrantyExpiry: new Date("2026-01-10"), nextMaintenance: new Date("2024-06-30") },
    { name: "Fire Pump FP-01",     code: "FP-001",  category: "Fire Safety", status: "operational", location: "Building A - Ground",   manufacturer: "Grundfos",   model: "CR45-2",        purchaseDate: new Date("2020-08-20"), value: 180000,  warrantyExpiry: new Date("2025-08-20"), nextMaintenance: new Date("2024-08-20") },
    { name: "CCTV NVR-01",         code: "NVR-001", category: "IT",          status: "operational", location: "Security Room",         manufacturer: "Hikvision",  model: "DS-96128NI-I16",purchaseDate: new Date("2022-02-14"), value: 95000,   warrantyExpiry: new Date("2025-02-14"), nextMaintenance: new Date("2024-10-01") },
    { name: "Water Pump WP-02",    code: "WP-002",  category: "Plumbing",    status: "faulty",      location: "Building B - Basement", manufacturer: "Kirloskar",  model: "STAR-1+",       purchaseDate: new Date("2018-11-05"), value: 35000,   warrantyExpiry: new Date("2021-11-05"), nextMaintenance: new Date("2024-11-05") },
  ]);
  console.log(`✓ Seeded ${assets.length} assets`);

  // Vendors
  const vendors = await Vendor.insertMany([
    { name: "TechCool HVAC Solutions", contactPerson: "Vikram Nair",   email: "vikram@techcool.in",   phone: "+91-9876543210", category: "HVAC",        rating: 4.5, onTimeDelivery: 92, status: "active", contractStart: new Date("2023-01-01"), contractEnd: new Date("2025-12-31"), slaResponseTime: 4,  address: "123, Industrial Area, Pune" },
    { name: "ElectroPro Services",     contactPerson: "Anita Joshi",   email: "anita@electropro.in",  phone: "+91-9988776655", category: "Electrical",  rating: 4.2, onTimeDelivery: 88, status: "active", contractStart: new Date("2023-06-01"), contractEnd: new Date("2025-05-31"), slaResponseTime: 6,  address: "45, MIDC, Nagpur" },
    { name: "SafeGuard Fire Systems",  contactPerson: "Deepak Gupta",  email: "deepak@safeguard.in",  phone: "+91-9112233445", category: "Fire Safety", rating: 4.8, onTimeDelivery: 96, status: "active", contractStart: new Date("2022-04-01"), contractEnd: new Date("2024-03-31"), slaResponseTime: 2,  address: "78, Ring Road, Hyderabad" },
    { name: "LiftMaster Elevators",    contactPerson: "Ramesh Pillai", email: "ramesh@liftmaster.in", phone: "+91-9443322110", category: "Elevator",    rating: 3.9, onTimeDelivery: 82, status: "active", contractStart: new Date("2023-03-01"), contractEnd: new Date("2026-02-28"), slaResponseTime: 8,  address: "22, Anna Salai, Chennai" },
  ]);
  console.log(`✓ Seeded ${vendors.length} vendors`);

  // Work Orders (woNumber, requestedBy and dueDate are required)
  const workOrders = await WorkOrder.insertMany([
    { woNumber: "WO-2024-001", title: "AHU-01 Filter Replacement",     type: "preventive",  priority: "medium",   status: "open",        assetId: assets[0]._id, location: "Basement",     assignedTo: "Arjun Singh",  requestedBy: "Rajesh Kumar",  dueDate: new Date(Date.now() + 86400000 * 3),  description: "Monthly filter replacement and belt inspection", auditLog: [{ action: "created", performedBy: "Rajesh Kumar", timestamp: new Date(Date.now() - 86400000 * 2) }] },
    { woNumber: "WO-2024-002", title: "Elevator-01 Quarterly Service", type: "preventive",  priority: "high",     status: "in_progress", assetId: assets[1]._id, location: "Building A",   assignedTo: "Meena Patel",  requestedBy: "Priya Sharma",  dueDate: new Date(Date.now() + 86400000 * 7),  description: "Q3 scheduled maintenance", startedAt: new Date(Date.now() - 3600000), auditLog: [{ action: "created", performedBy: "Priya Sharma", timestamp: new Date(Date.now() - 86400000 * 5) }, { action: "status → in_progress", performedBy: "Meena Patel", timestamp: new Date(Date.now() - 3600000) }] },
    { woNumber: "WO-2024-003", title: "Generator DG-01 Oil Change",    type: "corrective",  priority: "high",     status: "on_hold",     assetId: assets[2]._id, location: "Terrace",      assignedTo: "Arjun Singh",  requestedBy: "Arjun Singh",   dueDate: new Date(Date.now() + 86400000 * 2),  description: "Engine oil change and filter service", auditLog: [{ action: "created", performedBy: "Arjun Singh", timestamp: new Date(Date.now() - 86400000 * 7) }, { action: "status → on_hold", performedBy: "Priya Sharma", timestamp: new Date(Date.now() - 86400000) }] },
    { woNumber: "WO-2024-004", title: "Fire Pump Annual Test",         type: "inspection",  priority: "critical", status: "completed",   assetId: assets[3]._id, location: "Ground Floor", assignedTo: "Meena Patel",  requestedBy: "Priya Sharma",  dueDate: new Date(Date.now() - 86400000 * 8),  description: "Annual statutory fire pump test", startedAt: new Date(Date.now() - 86400000 * 10), completedAt: new Date(Date.now() - 86400000 * 9), auditLog: [{ action: "created", performedBy: "Priya Sharma", timestamp: new Date(Date.now() - 86400000 * 12) }, { action: "status → completed", performedBy: "Meena Patel", timestamp: new Date(Date.now() - 86400000 * 9) }] },
    { woNumber: "WO-2024-005", title: "CCTV Camera Realignment",       type: "corrective",  priority: "low",      status: "open",        assetId: assets[4]._id, location: "Security Room",assignedTo: "Arjun Singh",  requestedBy: "Rajesh Kumar",  dueDate: new Date(Date.now() + 86400000 * 14), description: "Adjust NVR-01 camera angles after renovation", auditLog: [{ action: "created", performedBy: "Rajesh Kumar", timestamp: new Date() }] },
  ]);
  console.log(`✓ Seeded ${workOrders.length} work orders`);

  // Incidents (incidentNumber is required)
  const incidents = await Incident.insertMany([
    { incidentNumber: "INC-2024-001", title: "Water Leakage in Server Room", severity: "high",     status: "investigating", location: "3rd Floor - Server Room", category: "Plumbing",    description: "Water dripping from cooling unit", reportedBy: "Suresh Babu",  timeline: [{ action: "reported", performedBy: "Suresh Babu", timestamp: new Date(Date.now() - 3600000 * 5) }, { action: "status → investigating", performedBy: "Arjun Singh", timestamp: new Date(Date.now() - 3600000 * 4) }] },
    { incidentNumber: "INC-2024-002", title: "Power Fluctuation Wing B",     severity: "critical", status: "resolved",      location: "Building B - Wing B",    category: "Electrical",  description: "Frequent power trips affecting workstations", reportedBy: "Priya Sharma", resolvedAt: new Date(Date.now() - 86400000), timeline: [{ action: "reported", performedBy: "Priya Sharma", timestamp: new Date(Date.now() - 86400000 * 2) }, { action: "status → resolved", performedBy: "Rajesh Kumar", timestamp: new Date(Date.now() - 86400000) }] },
    { incidentNumber: "INC-2024-003", title: "Elevator Stuck Between Floors", severity: "high",    status: "closed",        location: "Building A - Elevator",  category: "Elevator",    description: "Elevator stalled between G and 1st floor", reportedBy: "Suresh Babu",  resolvedAt: new Date(Date.now() - 86400000 * 3), timeline: [{ action: "reported", performedBy: "Suresh Babu", timestamp: new Date(Date.now() - 86400000 * 4) }, { action: "status → closed", performedBy: "Priya Sharma", timestamp: new Date(Date.now() - 86400000 * 3) }] },
  ]);
  console.log(`✓ Seeded ${incidents.length} incidents`);

  // Inventory (uses 'code' not 'sku', and schema fields)
  const inventory = await Inventory.insertMany([
    { code: "HVF-2025-01", name: "HVAC Filter 20x25x1",   category: "HVAC Spares",    quantity: 24, minQuantity: 10, maxQuantity: 50,  unitCost: 450,   unit: "Pcs", location: "Store A - Shelf 1", supplierName: "TechCool HVAC Solutions" },
    { code: "LUB-5L-001",  name: "Lubricant Oil (5L)",    category: "Consumables",    quantity: 8,  minQuantity: 5,  maxQuantity: 20,  unitCost: 1200,  unit: "Can", location: "Store A - Shelf 2", supplierName: "ElectroPro Services" },
    { code: "MCB-32A-SP",  name: "MCB 32A Single Pole",   category: "Electrical",     quantity: 3,  minQuantity: 10, maxQuantity: 50,  unitCost: 380,   unit: "Pcs", location: "Store B - Rack 1",  supplierName: "ElectroPro Services" },
    { code: "FE-4KG-001",  name: "Fire Extinguisher 4kg", category: "Fire Safety",    quantity: 12, minQuantity: 6,  maxQuantity: 24,  unitCost: 1800,  unit: "Pcs", location: "Store B - Rack 2",  supplierName: "SafeGuard Fire Systems" },
    { code: "ELV-CBL-01",  name: "Elevator Cable Wire",   category: "Elevator Parts", quantity: 0,  minQuantity: 2,  maxQuantity: 10,  unitCost: 25000, unit: "Rol", location: "Store A - Shelf 3", supplierName: "LiftMaster Elevators" },
    { code: "LED-4FT-001", name: "LED Tube Light 4ft",    category: "Electrical",     quantity: 45, minQuantity: 20, maxQuantity: 100, unitCost: 280,   unit: "Pcs", location: "Store B - Rack 3",  supplierName: "ElectroPro Services" },
  ]);
  console.log(`✓ Seeded ${inventory.length} inventory items`);

  // Spaces — multiple sites
  const spaces = await Space.insertMany([
    // --- HQ Campus ---
    { site: "HQ Campus", name: "Main Lobby",        floor: "Ground", building: "Block A", type: "Conference",  status: "occupied",    capacity: 50,  occupied: 35, area: 1200 },
    { site: "HQ Campus", name: "Conference Hall A", floor: "1",      building: "Block A", type: "Conference",  status: "available",   capacity: 20,  occupied: 0,  area: 450 },
    { site: "HQ Campus", name: "Open Office 1A",    floor: "1",      building: "Block A", type: "Workstation", status: "occupied",    capacity: 80,  occupied: 72, area: 2000 },
    { site: "HQ Campus", name: "Board Room",        floor: "5",      building: "Block A", type: "Conference",  status: "reserved",    capacity: 30,  occupied: 0,  area: 600 },
    { site: "HQ Campus", name: "Server Room",       floor: "3",      building: "Block A", type: "Utility",     status: "maintenance", capacity: 5,   occupied: 2,  area: 200 },
    { site: "HQ Campus", name: "Cafeteria",         floor: "Ground", building: "Block B", type: "Cafeteria",   status: "occupied",    capacity: 100, occupied: 60, area: 3000 },
    { site: "HQ Campus", name: "Gym & Wellness",    floor: "Ground", building: "Block B", type: "Recreation",  status: "available",   capacity: 40,  occupied: 12, area: 1500 },
    { site: "HQ Campus", name: "Parking Level B1",  floor: "B1",     building: "Block A", type: "Parking",     status: "occupied",    capacity: 120, occupied: 98, area: 5000 },
    // --- North Site ---
    { site: "North Site", name: "Reception",         floor: "Ground", building: "Tower 1", type: "Conference",  status: "available",   capacity: 15,  occupied: 0,  area: 300 },
    { site: "North Site", name: "Training Room 1",   floor: "2",      building: "Tower 1", type: "Conference",  status: "occupied",    capacity: 40,  occupied: 32, area: 800 },
    { site: "North Site", name: "Open Office 2A",    floor: "2",      building: "Tower 1", type: "Workstation", status: "occupied",    capacity: 60,  occupied: 55, area: 1400 },
    { site: "North Site", name: "Storage Room N1",   floor: "B1",     building: "Tower 1", type: "Storage",     status: "available",   capacity: 0,   occupied: 0,  area: 400 },
    { site: "North Site", name: "Electrical Room",   floor: "B1",     building: "Tower 1", type: "Utility",     status: "maintenance", capacity: 2,   occupied: 1,  area: 150 },
    // --- South Campus ---
    { site: "South Campus", name: "Auditorium",        floor: "Ground", building: "Wing A", type: "Conference",  status: "available",   capacity: 300, occupied: 0,  area: 8000 },
    { site: "South Campus", name: "Labs Block",        floor: "1",      building: "Wing B", type: "Workstation", status: "occupied",    capacity: 50,  occupied: 45, area: 2200 },
    { site: "South Campus", name: "Visitor Parking",   floor: "Ground", building: "Wing A", type: "Parking",     status: "occupied",    capacity: 80,  occupied: 52, area: 3500 },
    { site: "South Campus", name: "Canteen",           floor: "Ground", building: "Wing B", type: "Cafeteria",   status: "occupied",    capacity: 80,  occupied: 35, area: 1800 },
  ]);
  console.log(`✓ Seeded ${spaces.length} spaces`);

  // PM Schedules
  const pmSchedules = await PMSchedule.insertMany([
    {
      title: "AHU Monthly Inspection",
      assetId: assets[0]._id,
      assetName: "Carrier AHU-01",
      frequency: "monthly",
      nextDue: new Date(Date.now() + 86400000 * 5),
      assignedTo: "Arjun Singh",
      status: "active",
      checklist: [
        { task: "Check and clean filters",         completed: false },
        { task: "Inspect drive belts for wear",     completed: false },
        { task: "Check refrigerant levels",         completed: false },
        { task: "Lubricate fan bearings",           completed: false },
        { task: "Verify thermostat calibration",    completed: false },
      ],
    },
    {
      title: "Elevator Quarterly Service",
      assetId: assets[1]._id,
      assetName: "Otis Elevator-01",
      frequency: "quarterly",
      nextDue: new Date(Date.now() - 86400000 * 3),
      assignedTo: "Meena Patel",
      status: "overdue",
      checklist: [
        { task: "Inspect and lubricate guide rails", completed: false },
        { task: "Test emergency stop function",      completed: false },
        { task: "Check rope tension and condition",  completed: false },
        { task: "Test door opening/closing force",   completed: false },
        { task: "Verify overload protection",        completed: false },
        { task: "Test emergency lighting",           completed: false },
      ],
    },
    {
      title: "Generator Annual Service",
      assetId: assets[2]._id,
      assetName: "Generator DG-01",
      frequency: "annual",
      nextDue: new Date(Date.now() + 86400000 * 45),
      assignedTo: "Arjun Singh",
      status: "active",
      lastCompleted: new Date(Date.now() - 86400000 * 320),
      checklist: [
        { task: "Change engine oil and filter",      completed: false },
        { task: "Replace air filter",                completed: false },
        { task: "Replace fuel filter",               completed: false },
        { task: "Check battery electrolyte",         completed: false },
        { task: "Perform 60-minute load test",       completed: false },
        { task: "Inspect alternator connections",    completed: false },
        { task: "Check exhaust system",              completed: false },
      ],
    },
  ]);
  console.log(`✓ Seeded ${pmSchedules.length} PM schedules`);

  console.log("\n✅ Seed complete!");
  console.log("\nTest credentials:");
  console.log("  Admin:      admin@fmnexus.in     / Admin@123");
  console.log("  Manager:    manager@fmnexus.in   / Admin@123");
  console.log("  Technician: tech1@fmnexus.in     / Admin@123");
  console.log("  Viewer:     viewer@fmnexus.in    / Admin@123");

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
