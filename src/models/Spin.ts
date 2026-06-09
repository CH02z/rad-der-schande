import { Schema, Types, models, model, type InferSchemaType } from "mongoose";

/**
 * Spin — ein dokumentiertes Spin-Ergebnis.
 *
 * Scope:
 *  - crewId === null → Solo-Spin (nur für den ausführenden User sichtbar)
 *  - crewId !== null → in einer Crew (sichtbar für alle aktiven Mitglieder)
 *
 * `loser` und `participants` bleiben als freie Strings — die Teilnehmer am
 * Wheel sind nicht zwingend registrierte User. So bleibt das Wheel auch
 * für „Gast"-Namen flexibel.
 */
const SpinSchema = new Schema(
  {
    crewId: {
      type: Schema.Types.ObjectId,
      ref: "Crew",
      default: null,
      index: true,
    },
    spunByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    loser: { type: String, required: true, trim: true, maxlength: 30 },
    participants: { type: [String], default: [] },
    mode: {
      type: String,
      enum: ["classic", "elim"],
      default: "classic",
    },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { collection: "spins" }
);

// Optimiert für die zwei häufigsten Abfragen:
// 1) Crew-Leaderboard:   { crewId, createdAt }
// 2) User-Solo-Leader:   { spunByUserId, crewId: null, createdAt }
SpinSchema.index({ crewId: 1, createdAt: -1 });
SpinSchema.index({ spunByUserId: 1, crewId: 1, createdAt: -1 });

export type SpinDoc = InferSchemaType<typeof SpinSchema> & {
  _id: Types.ObjectId;
};

export default models.Spin || model("Spin", SpinSchema);
