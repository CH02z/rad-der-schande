import { Schema, models, model } from "mongoose";

const SpinResultSchema = new Schema({
  loser: { type: String, required: true },
  participants: { type: [String], default: [] },
  spunBy: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default models.SpinResult || model("SpinResult", SpinResultSchema);
