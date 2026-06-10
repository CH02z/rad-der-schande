import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongoose ?? { conn: null, promise: null };
global._mongoose = cached;

export async function dbConnect() {
  // Throw erst beim Use, nicht beim Import — sonst stirbt `next build` ohne Env-Var.
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Bitte MONGODB_URI in .env.local setzen");

  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        // Serverless-tuning: kleiner Pool (jede Lambda-Instanz hält eigenen),
        // schnelles Fail bei Server-Auswahl, Commands nicht puffern.
        maxPoolSize: 10,
        minPoolSize: 0,
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
      })
      .catch((err) => {
        // Fehlgeschlagene Verbindung NICHT cachen → nächster Request darf retryen.
        cached.promise = null;
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
