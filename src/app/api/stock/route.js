import { ObjectId } from "mongodb";
export async function DELETE(request) {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection("stock");
  const { id } = await request.json();
  await collection.deleteOne({ _id: new ObjectId(id) });
  return Response.json({ message: "Item eliminado" });
}
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection("stock");
  const items = await collection.find({}).toArray();
  return Response.json(items);
}

export async function POST(request) {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection("stock");
  const item = await request.json();
  await collection.insertOne(item);
  return Response.json({ message: "Item agregado" });
}
