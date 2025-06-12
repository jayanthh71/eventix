import UpcomingEvents from "@/components/layout/UpcomingEvents";
import EventCard from "@/components/ui/EventCard";
import { Event } from "@prisma/client";
import Link from "next/link";

export default async function Events() {
  // Temporary hardcoded data
  const movies: Event[] = [
    {
      id: "92c82ccf-c602-4b5b-b0dd-d7cb59ccb284",
      title: "The First Movie",
      description: "This is an amazing movie, pretty cool and long",
      imageUrl: null,
      date: new Date("2025-06-10T18:29:12.119Z"),
      location: "City Center Deira",
      price: 120,
      category: "MOVIE",
      createdAt: new Date("2025-06-11T21:29:47.060Z"),
      updatedAt: new Date("2025-06-11T21:29:47.060Z"),
    },
    {
      id: "92c82ccf-c602-4b5b-b0dd-d7cb59ccb285",
      title: "The Second Movie",
      description: "This is an amazing movie, pretty cool and long",
      imageUrl: null,
      date: new Date("2025-06-10T18:29:12.119Z"),
      location: "LA Maris",
      price: 120,
      category: "MOVIE",
      createdAt: new Date("2025-06-11T21:29:47.060Z"),
      updatedAt: new Date("2025-06-11T21:29:47.060Z"),
    },
    {
      id: "92c82ccf-c602-4b5b-b0dd-d7cb59ccb286",
      title: "The Third Movie",
      description: "This is an amazing movie, pretty cool and long",
      imageUrl: null,
      date: new Date("2025-06-10T18:29:12.119Z"),
      location: "BHELEC Cinema",
      price: 120,
      category: "MOVIE",
      createdAt: new Date("2025-06-11T21:29:47.060Z"),
      updatedAt: new Date("2025-06-11T21:29:47.060Z"),
    },
    {
      id: "92c82ccf-c602-4b5b-b0dd-d7cb59ccb287",
      title: "The Fourth Movie",
      description: "This is an amazing movie, pretty cool and long",
      imageUrl: null,
      date: new Date("2025-06-10T18:29:12.119Z"),
      location: "Dubai Mall",
      price: 120,
      category: "MOVIE",
      createdAt: new Date("2025-06-11T21:29:47.060Z"),
      updatedAt: new Date("2025-06-11T21:29:47.060Z"),
    },
  ];
  const concerts: Event[] = [
    {
      id: "92c82ccf-c602-4b5b-b0dd-d7cb59ccb288",
      title: "The First Concert",
      description: "This is an amazing concert, pretty cool and loud",
      imageUrl: null,
      date: new Date("2025-06-10T18:29:12.119Z"),
      location: "Coca Cola Arena",
      price: 120,
      category: "CONCERT",
      createdAt: new Date("2025-06-11T21:29:47.060Z"),
      updatedAt: new Date("2025-06-11T21:29:47.060Z"),
    },
    {
      id: "92c82ccf-c602-4b5b-b0dd-d7cb59ccb289",
      title: "The Second Concert",
      description: "This is an amazing concert, pretty cool and loud",
      imageUrl: null,
      date: new Date("2025-06-10T18:29:12.119Z"),
      location: "Expo City",
      price: 120,
      category: "CONCERT",
      createdAt: new Date("2025-06-11T21:29:47.060Z"),
      updatedAt: new Date("2025-06-11T21:29:47.060Z"),
    },
    {
      id: "92c82ccf-c602-4b5b-b0dd-d7cb59ccb290",
      title: "The Third Concert",
      description: "This is an amazing concert, pretty cool and loud",
      imageUrl: null,
      date: new Date("2025-06-10T18:29:12.119Z"),
      location: "Coca Cola Arena",
      price: 120,
      category: "CONCERT",
      createdAt: new Date("2025-06-11T21:29:47.060Z"),
      updatedAt: new Date("2025-06-11T21:29:47.060Z"),
    },
    {
      id: "92c82ccf-c602-4b5b-b0dd-d7cb59ccb291",
      title: "The Fourth Concert",
      description: "This is an amazing concert, pretty cool and loud",
      imageUrl: null,
      date: new Date("2025-06-10T18:29:12.119Z"),
      location: "Expo City",
      price: 120,
      category: "CONCERT",
      createdAt: new Date("2025-06-11T21:29:47.060Z"),
      updatedAt: new Date("2025-06-11T21:29:47.060Z"),
    },
  ];

  // const movies = await getEvents(EventCategory.MOVIE, "createdAt", 4);
  // const concerts = await getEvents(EventCategory.CONCERT, "createdAt", 4);

  return (
    <div className="flex w-full flex-col gap-12 p-12">
      <UpcomingEvents />

      <section className="font-anek flex flex-col gap-8 fill-white text-white">
        <div className="flex items-center justify-between">
          <Link
            className="flex items-center text-2xl font-semibold hover:fill-gray-400 hover:text-gray-400"
            href="/movies"
          >
            New Movies
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
            >
              <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
            </svg>
          </Link>
          <Link
            className="flex items-center font-medium hover:fill-gray-400 hover:text-gray-400"
            href="/movies"
          >
            Show all
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
            >
              <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
            </svg>
          </Link>
        </div>
        {movies && movies.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {movies.map((movie) => (
              <EventCard key={movie.id} {...movie} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center text-xl font-semibold">
            No movies found
          </div>
        )}
      </section>

      <section className="font-anek flex flex-col gap-8 fill-white text-white">
        <div className="flex items-center justify-between">
          <Link
            className="flex items-center text-2xl font-semibold hover:fill-gray-400 hover:text-gray-400"
            href="/concerts"
          >
            New Concerts
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
            >
              <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
            </svg>
          </Link>
          <Link
            className="flex items-center font-medium hover:fill-gray-400 hover:text-gray-400"
            href="/concerts"
          >
            Show all
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
            >
              <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
            </svg>
          </Link>
        </div>
        {concerts && concerts.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {concerts.map((concert) => (
              <EventCard key={concert.id} {...concert} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center text-xl font-semibold">
            No concerts found
          </div>
        )}
      </section>
    </div>
  );
}
