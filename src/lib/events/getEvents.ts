import prisma from "@/lib/prisma";
import { EventCategory } from "@prisma/client";

export default async function getEvents(
  category: EventCategory | "BOTH",
  sortBy: "date" | "createdAt",
  take: number,
) {
  try {
    const events = await prisma.event.findMany({
      where: category === "BOTH" ? {} : { category },
      orderBy: {
        [sortBy]: sortBy === "createdAt" ? "desc" : "asc",
      },
      take: take,
    });
    return events;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}
