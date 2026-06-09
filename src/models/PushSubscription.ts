import { Schema, Types, models, model, type InferSchemaType } from "mongoose";

/**
 * Web-Push-Subscription: ein User kann mehrere Subscriptions haben
 * (z.B. Desktop-Chrome + iPhone-Safari). Eindeutig per endpoint.
 *
 * Bei 410/404 vom Push-Service wird die Subscription automatisch entfernt
 * (siehe lib/push.ts sendPushToUsers).
 */
const PushSubscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    userAgent: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    lastSentAt: { type: Date, default: null },
  },
  { collection: "pushSubscriptions" }
);

PushSubscriptionSchema.index({ userId: 1, endpoint: 1 });

export type PushSubscriptionDoc = InferSchemaType<typeof PushSubscriptionSchema> & {
  _id: Types.ObjectId;
};

export default models.PushSubscription ||
  model("PushSubscription", PushSubscriptionSchema);
