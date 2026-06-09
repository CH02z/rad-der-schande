import { Schema, Types, models, model, type InferSchemaType } from "mongoose";

/**
 * Crew — eine Gruppe von Spielern mit eigener Schande-Tabelle.
 *
 * Mitgliedschaften liegen in `crewMembers` (n:m), nicht hier embedded:
 *   • Mitgliederliste skaliert ohne das Crew-Dokument zu blasen
 *   • Join-/Leave-Historie bleibt nachvollziehbar
 *   • Rollen pro Crew sind sauber modelliert
 *
 * Soft-Delete via deletedAt — erhält die Spin-Historie auch nach Auflösung.
 */
const CrewSchema = new Schema(
  {
    // Invite-Code, 6 Zeichen, alphanumerisch ohne 0/O/1/I/L
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 6,
      maxlength: 6,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 40,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // Visuelles Branding pro Crew
    emoji: { type: String, default: "🎰", maxlength: 8 },
    accentColor: { type: String, default: "#E8C36A" },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null, index: true },
  },
  { collection: "crews" }
);

CrewSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export type CrewDoc = InferSchemaType<typeof CrewSchema> & {
  _id: Types.ObjectId;
};

export default models.Crew || model("Crew", CrewSchema);
