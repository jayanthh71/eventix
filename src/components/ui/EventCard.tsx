import { Event, EventCategory } from "@prisma/client";
import Image from "next/image";

export default function EventCard(event: Event) {
  return (
    <div className="cursor-pointer rounded-lg bg-black transition-transform select-none hover:scale-105 hover:drop-shadow-lg">
      <Image
        src={
          event.imageUrl || event.category === EventCategory.MOVIE
            ? "/movie.jpg"
            : "/concert.jpg"
        }
        alt={event.title}
        width={300}
        height={200}
        className="h-48 w-full rounded-t-lg object-cover"
      />
      <div className="font-anek p-4 text-white">
        <h3 className="text-lg font-semibold">{event.title}</h3>
        <p className="text-sm text-gray-500">{event.location}</p>
        <div className="flex justify-between">
          <p className="mt-2 font-bold">₹{event.price.toFixed(2)}</p>
          <p className="mt-2 text-sm text-gray-500">
            {new Date(event.date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
