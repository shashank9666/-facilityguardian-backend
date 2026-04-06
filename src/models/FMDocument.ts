import { Schema, model, Document } from "mongoose";

export interface IFMDocument extends Document {
  docNumber: string;
  title: string;
  category: "SOP" | "Certificate" | "Permit" | "Policy" | "Manual";
  version: string;
  status: "active" | "expired" | "under_review" | "archived";
  expiryDate?: Date;
  uploadedBy: string;
  uploadedAt: Date;
  tags: string[];
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const FMDocumentSchema = new Schema<IFMDocument>(
  {
    docNumber:   { type: String, required: true, unique: true, uppercase: true, trim: true },
    title:       { type: String, required: true, trim: true },
    category:     { type: String, enum: ["SOP", "Certificate", "Permit", "Policy", "Manual"], required: true },
    version:     { type: String, default: "v1.0" },
    status:      { type: String, enum: ["active", "expired", "under_review", "archived"], default: "active" },
    expiryDate:  { type: Date },
    uploadedBy:  { type: String, required: true },
    uploadedAt:  { type: Date, default: Date.now },
    tags:        [{ type: String, trim: true }],
    description: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export const FMDocument = model<IFMDocument>("FMDocument", FMDocumentSchema);
