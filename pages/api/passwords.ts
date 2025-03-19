// ./pages/api/passwords.ts
import { NextApiRequest, NextApiResponse } from "next";
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const client = new MongoClient(uri);

let db: any; // Store the database connection
async function connectToDatabase() {
  if (!db) {
    await client.connect();
    db = client.db("password-manager");
  }
  return db;
}

const getPasswords = async (userId: string) => {
  const database = await connectToDatabase();
  const collection = database.collection("passwords");
  const passwords = await collection.find({ userId }).toArray();
  // Convert MongoDB _id to id for frontend compatibility
  return passwords.map((password: { _id: { toString: () => any } }) => ({
    ...password,
    id: password._id.toString(), // Convert ObjectId to string
    _id: undefined, // Optionally remove _id to avoid confusion
  }));
};

const addPassword = async (userId: string, passwordData: any) => {
  const database = await connectToDatabase();
  const collection = database.collection("passwords");
  const result = await collection.insertOne({ ...passwordData, userId });
  return {
    ...passwordData,
    id: result.insertedId.toString(), // Return the new document's ID as a string
    userId,
  };
};

const updatePassword = async (userId: string, passwordData: any) => {
  const database = await connectToDatabase();
  const collection = database.collection("passwords");
  const { id, ...updateData } = passwordData;
  const result = await collection.updateOne(
    { _id: new ObjectId(id), userId }, // Match by _id and userId
    { $set: updateData }
  );
  return result.modifiedCount > 0;
};

const deletePassword = async (userId: string, id: string) => {
  const database = await connectToDatabase();
  const collection = database.collection("passwords");
  const result = await collection.deleteOne({
    _id: new ObjectId(id),
    userId,
  });
  return result.deletedCount > 0;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  const userId = req.headers["user-id"] as string;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    switch (method) {
      case "GET":
        const passwords = await getPasswords(userId);
        return res.status(200).json(passwords);

      case "POST":
        const passwordData = req.body;
        const savedPassword = await addPassword(userId, passwordData);
        return res.status(200).json(savedPassword);

      case "PUT":
        const updatedData = req.body;
        const updated = await updatePassword(userId, updatedData);
        if (updated) {
          return res
            .status(200)
            .json({ message: "Password updated successfully" });
        }
        return res.status(404).json({ error: "Password not found" });

      case "DELETE":
        const { id } = req.body;
        if (!id) {
          return res.status(400).json({ error: "Password ID is required" });
        }
        const deleted = await deletePassword(userId, id);
        if (deleted) {
          return res
            .status(200)
            .json({ message: "Password deleted successfully" });
        }
        return res.status(404).json({ error: "Password not found" });

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
