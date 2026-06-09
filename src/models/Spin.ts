import { Schema, Types, models, model, type InferSchemaType } from "mongoose";

/**
 * Spin — strukturiert: Participant kann ein registrierter User (userId)
 * oder ein Gast (userId=null) sein. `name` ist immer ein Snapshot zum
 * Zeitpunkt des Spins — falls sich der echte Name später ändert,
 * können wir Stats per userId trotzdem konsistent gruppieren.
 *
 * Scope:
 *  - crewId === null → Solo-Spin (nur für den ausführenden User sichtbar)
 *  - crewId !== null → in einer Crew (sichtbar für alle aktiven Mitglieder)
 */

// Sub-Schema für Participant (Loser ist ein einzelner Participant)
const ParticipantSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: { type: String, required: true, trim: true, maxlength: 30 },
  },
  { _id: false }
);

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
    loser: { type: ParticipantSchema, required: true },
    participants: { type: [ParticipantSchema], default: [] },
    mode: {
      type: String,
      enum: ["classic", "elim"],
      default: "classic",
    },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { collection: "spins" }
);

// Crew-Leaderboard
SpinSchema.index({ crewId: 1, createdAt: -1 });
// Solo-Leaderboard
SpinSchema.index({ spunByUserId: 1, crewId: 1, createdAt: -1 });
// Aggregation by loser-user
SpinSchema.index({ crewId: 1, "loser.userId": 1 });

export type ParticipantDoc = InferSchemaType<typeof ParticipantSchema>;
export type SpinDoc = InferSchemaType<typeof SpinSchema> & {
  _id: Types.ObjectId;
};

export default models.Spin || model("Spin", SpinSchema);
