import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma Client
const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    // Create a new user
    const { tweet, postedTime } = req.body;
    try {
      const newtweet = await prisma.tweets.create({
        data: { tweet, postedTime },
      });
      res.status(201).json(newtweet);
    } catch (error: unknown) {
      res.status(500).json({ message: "Error creating user", error });
    }
  } else if (req.method === "GET") {
    const { tweet, postedTime } = req.body;
    try {
      const newtweet = await prisma.tweets.create({
        data: { tweet, postedTime },
      });
      res.status(201).json(newtweet);
    } catch (error: unknown) {
      res.status(500).json({ message: "Error creating user", error });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
