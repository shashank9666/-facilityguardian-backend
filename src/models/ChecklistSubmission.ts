import { Schema, model, Document, Types } from "mongoose";

export interface IChecklistField {
  id: string;
  label: string;
  type: "text" | "number" | "options";
  value?: string;
  required?: boolean;
  unit?: string;
  options?: string[];
}

export interface IChecklistSubmission extends Document {
  templateId: string;
  templateName: string;
  category: "MEP" | "Fire Safety" | "Housekeeping";
  submittedBy: string;
  submittedAt: Date;
  fields: IChecklistField[];
  notes: string;
  issueCount: number;
}

const ChecklistSubmissionSchema = new Schema<IChecklistSubmission>(
  {
    templateId:   { type: String, required: true },
    templateName: { type: String, required: true },
    category:     { type: String, enum: ["MEP", "Fire Safety", "Housekeeping"], required: true },
    submittedBy:  { type: String, required: true },
    submittedAt:  { type: Date, default: Date.now },
    fields: [
      {
        id:       { type: String, required: true },
        label:    { type: String, required: true },
        type:     { type: String, enum: ["text", "number", "options"], required: true },
        value:    { type: String },
        required: { type: Boolean, default: false },
        unit:     { type: String },
        options:  [{ type: String }],
      }
    ],
    notes:        { type: String, default: "" },
    issueCount:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ChecklistSubmission = model<IChecklistSubmission>("ChecklistSubmission", ChecklistSubmissionSchema);
