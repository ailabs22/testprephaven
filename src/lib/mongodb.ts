import { MongoClient } from "mongodb";
import * as functions from "firebase-functions"; 

const GROK_MONGODB_URI = functions.config().mongo.uri;

if (!GROK_MONGODB_URI) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = GROK_MONGODB_URI;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise: Promise<MongoClient>;
    };
    if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri as string);
        globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
} else {
    // In production mode, it's best to not use a global variable.
    if (!uri) {
        throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
    }
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
