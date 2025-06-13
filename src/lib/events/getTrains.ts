import prisma from "@/lib/prisma";

export default async function getTrains(take: number) {
  try {
    const trains = await prisma.train.findMany({
      orderBy: { departure: "asc" },
      take: take,
    });
    return trains;
  } catch (error) {
    console.error("Error fetching trains:", error);
    return [];
  }
}
