import { Schema, model, Document } from "mongoose";

export interface IMeterReading extends Document {
  meterType: "Electricity-HT" | "Electricity-LT" | "Water-Main" | "Water-Garden" | "DG-Runtime" | "STP-Flow" | "Other";
  meterName: string;
  location: string;
  unit: string;
  previousReading: number;
  currentReading: number;
  consumption: number;
  readingDate: Date;
  submittedBy: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const MeterReadingSchema = new Schema<IMeterReading>(
  {
    meterType:       { type: String, enum: ["Electricity-HT", "Electricity-LT", "Water-Main", "Water-Garden", "DG-Runtime", "STP-Flow", "Other"], required: true },
    meterName:       { type: String, required: true, trim: true },
    location:        { type: String, trim: true, default: "" },
    unit:            { type: String, required: true },
    previousReading: { type: Number, default: 0 },
    currentReading:  { type: Number, required: true },
    consumption:     { type: Number, default: 0 },
    readingDate:     { type: Date, default: Date.now },
    submittedBy:     { type: String, required: true },
    notes:           { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

MeterReadingSchema.pre("save", function (next) {
  this.consumption = this.currentReading - this.previousReading;
  next();
});

export const MeterReading = model<IMeterReading>("MeterReading", MeterReadingSchema);
