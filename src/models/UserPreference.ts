import { Schema, models, model } from "mongoose";

// Pro User: Theme + Sound-Mute. Identifikation via E-Mail aus der Session.
const UserPreferenceSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    theme: { type: String, enum: ["dark", "light"], default: "dark" },
    muted: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "spieler-einstellungen" }
);

UserPreferenceSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default models.UserPreference || model("UserPreference", UserPreferenceSchema);
