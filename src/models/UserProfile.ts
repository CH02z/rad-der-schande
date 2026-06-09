import { Schema, Types, models, model, type InferSchemaType } from "mongoose";

/**
 * UserProfile — app-spezifische User-Daten.
 *
 * Bewusst getrennt von der `users` Collection (die der Auth.js-Adapter
 * verwaltet). So bleibt unsere App-Logik unabhängig vom Adapter-Schema
 * und upgrades am Auth-Provider brechen nichts.
 *
 * Identifikation: userId (= users._id). Nicht email — die kann sich
 * im Google-Account ändern.
 */
const UserProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    // Aktive Crew des Users (null = Solo-Modus)
    activeCrewId: {
      type: Schema.Types.ObjectId,
      ref: "Crew",
      default: null,
      index: true,
    },
    preferences: {
      theme: { type: String, enum: ["dark", "light"], default: "dark" },
      muted: { type: Boolean, default: false },
      locale: { type: String, enum: ["de", "en"], default: "de" },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "userProfiles" }
);

UserProfileSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export type UserProfileDoc = InferSchemaType<typeof UserProfileSchema> & {
  _id: Types.ObjectId;
};

export default models.UserProfile ||
  model("UserProfile", UserProfileSchema);
