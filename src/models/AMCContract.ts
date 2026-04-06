import { Schema, model, Document } from "mongoose";

export interface IAMCContract extends Document {
  contractNumber: string;
  title: string;
  vendorName: string;
  category: string;
  scope: string;
  startDate: Date;
  endDate: Date;
  value: number;
  status: "active" | "expiring_soon" | "expired" | "under_renewal";
  renewalAlertDays: number;
  contactPerson: string;
  contactPhone: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const AMCContractSchema = new Schema<IAMCContract>(
  {
    contractNumber:   { type: String, required: true, unique: true, uppercase: true, trim: true },
    title:            { type: String, required: true, trim: true },
    vendorName:       { type: String, required: true, trim: true },
    category:         { type: String, required: true, trim: true },
    scope:            { type: String, trim: true, default: "" },
    startDate:        { type: Date, required: true },
    endDate:          { type: Date, required: true },
    value:            { type: Number, min: 0, default: 0 },
    status:           { type: String, enum: ["active", "expiring_soon", "expired", "under_renewal"], default: "active" },
    renewalAlertDays: { type: Number, default: 60 },
    contactPerson:    { type: String, trim: true, default: "" },
    contactPhone:     { type: String, trim: true, default: "" },
    notes:            { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export const AMCContract = model<IAMCContract>("AMCContract", AMCContractSchema);
