import { Schema, model, Document } from "mongoose";

export interface ISpace extends Document {
  name: string;
  type: string;
  site: string;
  floor: string;
  building: string;
  capacity: number;
  occupied: number;
  status: "available" | "occupied" | "maintenance" | "reserved";
  assignedTo?: string;
  lastInspection: Date;
  area: number;
  createdAt: Date;
  updatedAt: Date;
}

const SpaceSchema = new Schema<ISpace>(
  {
    name:           { type: String, required: true, trim: true },
    type:           { type: String, required: true, trim: true },
    site:           { type: String, trim: true, default: "Main Campus" },
    floor:          { type: String, trim: true, default: "" },
    building:       { type: String, trim: true, default: "" },
    capacity:       { type: Number, min: 0, default: 0 },
    occupied:       { type: Number, min: 0, default: 0 },
    status:         { type: String, enum: ["available","occupied","maintenance","reserved"], default: "available" },
    assignedTo:     { type: String, trim: true },
    lastInspection: { type: Date },
    area:           { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

SpaceSchema.index({ name: "text", site: "text", building: "text" });

export const Space = model<ISpace>("Space", SpaceSchema);
