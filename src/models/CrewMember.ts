import { Schema, Types, models, model, type InferSchemaType } from "mongoose";

/**
 * CrewMember — n:m zwischen Users und Crews mit Rolle und Join-Historie.
 *
 * Rollen:
 *  - owner  : Crew-Ersteller. Kann umbenennen/löschen/kicken/Owner übergeben.
 *  - admin  : reserviert für Phase 2 (kann kicken, aber nicht löschen).
 *  - member : Standard. Spielt mit, kann jederzeit verlassen.
 *
 * Soft-Leave via leftAt: erhält die Membership-Historie. Aktive Mitglieder
 * sind solche mit leftAt = null.
 */
const CrewMemberSchema = new Schema(
  {
    crewId: {
      type: Schema.Types.ObjectId,
      ref: "Crew",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member",
      required: true,
    },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date, default: null, index: true },
  },
  { collection: "crewMembers" }
);

// Ein User kann nicht zweimal aktiv im selben Crew sein.
// (Re-Joins legen neuen Eintrag an mit neuem joinedAt — alter hat leftAt gesetzt.)
CrewMemberSchema.index(
  { crewId: 1, userId: 1, leftAt: 1 },
  { unique: true, partialFilterExpression: { leftAt: null } }
);

export type CrewMemberDoc = InferSchemaType<typeof CrewMemberSchema> & {
  _id: Types.ObjectId;
};

export default models.CrewMember ||
  model("CrewMember", CrewMemberSchema);
