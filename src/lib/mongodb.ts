import { MongoClient } from "mongodb";

// Lazy: wirft erst beim ersten echten Use, damit `next build` ohne URI durchkommt.
const uri = process.env.MONGODB_URI;
const options = {};

let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!uri) {
  clientPromise = Promise.reject(
    new Error("Bitte MONGODB_URI in .env.local setzen"),
  );
} else if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri, options).connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = new MongoClient(uri, options).connect();
}

export default clientPromise;
