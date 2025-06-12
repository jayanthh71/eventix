import prisma from "@/lib/prisma";
import { EventCategory } from "@prisma/client";

export default async function getEvents(category: EventCategory) {
  try {
    const events = await prisma.event.findMany({
      where: {
        category:
          category === "MOVIE" ? EventCategory.MOVIE : EventCategory.CONCERT,
      },
      orderBy: { date: "asc" },
      take: 4,
    });
    return events;
  } catch (error) {
    console.error("Error fetching events:", error);
  }
}
