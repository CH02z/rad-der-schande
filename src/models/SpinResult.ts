import { Schema, models, model } from "mongoose";

// Explizite Collection: "schandvolle-daten" (statt Mongoose-Default "spinresults")
const SpinResultSchema = new Schema(
  {
    loser: { type: String, required: true, index: true },
    participants: { type: [String], default: [] },
    spunBy: { type: String, index: true },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { collection: "schandvolle-daten" }
);

export default models.SpinResult || model("SpinResult", SpinResultSchema);
