#!/usr/bin/env node
/**
 * FM-Nexus Demo Account Seed Script
 * ------------------------------------
 * Run from the /server directory:
 *   node seed.js
 *
 * Or with a custom MongoDB URI:
 *   MONGODB_URI="mongodb://localhost:27017/fmnexus" node seed.js
 *
 * Demo credentials seeded:
 *   admin@fmnexus.in    / Admin123  (role: admin)
 *   manager@fmnexus.in  / Admin123  (role: manager)
 *   tech1@fmnexus.in    / Admin123  (role: technician)
 *   viewer@fmnexus.in   / Admin123  (role: viewer)
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ─── Load .env if present ────────────────────────────────────────────────────
try { require("dotenv").config(); } catch (_) { /* dotenv is optional */ }

const MONGO_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017/fmnexus";
const SALT_ROUNDS = 12;
const PASSWORD = "Admin@123";

// ─── Minimal User Schema (mirrors server/src/models/User.ts) ─────────────────
const UserSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true, trim: true },
    email:      { type: String, required: true, unique: true, trim: true, lowercase: true },
    password:   { type: String, required: true },
    role:       { type: String, required: true, enum: ["admin", "manager", "technician", "viewer"], default: "viewer" },
    department: { type: String, trim: true, default: "" },
    active:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

// ─── Demo accounts ────────────────────────────────────────────────────────────
const DEMO_USERS = [
  { name: "Rajesh Kumar", email: "admin@fmnexus.in",   role: "admin",       department: "Facility Management" },
  { name: "Priya Sharma", email: "manager@fmnexus.in", role: "manager",     department: "Operations" },
  { name: "Arjun Singh",  email: "tech1@fmnexus.in",   role: "technician",  department: "MEP" },
  { name: "Suresh Babu",  email: "viewer@fmnexus.in",  role: "viewer",      department: "Administration" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seedDemoAccounts() {
  const forceReset = process.argv.includes("--force");

  console.log("🔌 Connecting to MongoDB …");
  await mongoose.connect(MONGO_URI);
  console.log(`✓ Connected: ${MONGO_URI}\n`);

  const hashedPassword = await bcrypt.hash(PASSWORD, SALT_ROUNDS);

  if (forceReset) {
    const emails = DEMO_USERS.map(u => u.email);
    await User.deleteMany({ email: { $in: emails } });
    console.log("🗑  Cleared existing demo accounts (--force)\n");
  }

  let created = 0;
  let updated = 0;

  for (const demo of DEMO_USERS) {
    const exists = await User.findOne({ email: demo.email });

    if (exists) {
      // Reset the password directly in DB (bypasses pre-save double-hash)
      await User.updateOne(
        { email: demo.email },
        { $set: { password: hashedPassword, role: demo.role, active: true } }
      );
      console.log(`🔄 Updated   ${demo.email}  (role: ${demo.role}) — password reset`);
      updated++;
    } else {
      // Insert with pre-hashed password (insertMany bypasses pre-save hook)
      await User.create({ ...demo, password: hashedPassword, active: true });
      console.log(`✅ Created   ${demo.email}  (role: ${demo.role})`);
      created++;
    }
  }

  console.log(`\n─────────────────────────────────────────`);
  console.log(`  ${created} created, ${updated} updated/reset.`);
  console.log(`─────────────────────────────────────────`);
  console.log("\n🔑 Demo Login Credentials:");
  console.log("  ┌─────────────────────────────┬───────────┬──────────┐");
  console.log("  │ Email                       │ Role      │ Password │");
  console.log("  ├─────────────────────────────┼───────────┼──────────┤");
  DEMO_USERS.forEach(u => {
    const emailPad = u.email.padEnd(27);
    const rolePad  = u.role.padEnd(9);
    console.log(`  │ ${emailPad} │ ${rolePad} │ ${PASSWORD}  │`);
  });
  console.log("  └─────────────────────────────┴───────────┴──────────┘");

  await mongoose.disconnect();
  console.log("\n✅ Done.");
}

seedDemoAccounts().catch(err => {
  console.error("\n❌ Seed failed:", err.message);
  process.exit(1);
});
