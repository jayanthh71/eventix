"use client";

import UpcomingEvents from "@/components/layout/UpcomingEvents";
import ErrorMessage from "@/components/ui/ErrorMessage";
import EventCard from "@/components/ui/EventCard";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import TrainCard from "@/components/ui/TrainCard";
import { useConcerts, useMovies, useTrains } from "@/lib/hooks/useData";
import Link from "next/link";

export default function Events() {
  const {
    data: movies = [],
    isLoading: moviesLoading,
    error: moviesError,
  } = useMovies(4);
  const {
    data: concerts = [],
    isLoading: concertsLoading,
    error: concertsError,
  } = useConcerts(4);
  const {
    data: trains = [],
    isLoading: trainsLoading,
    error: trainsError,
  } = useTrains(3);

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
        {moviesLoading ? (
          <LoadingIndicator text="Loading movies..." />
        ) : moviesError ? (
          <ErrorMessage message="Failed to load movies" />
        ) : movies && movies.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {movies.map((movie) => (
              <EventCard key={movie.id} {...movie} />
            ))}
          </div>
        ) : (
          <div className="font-anek flex items-center justify-center text-xl font-semibold text-white">
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
        {concertsLoading ? (
          <LoadingIndicator text="Loading concerts..." />
        ) : concertsError ? (
          <ErrorMessage message="Failed to load concerts" />
        ) : concerts && concerts.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {concerts.map((concert) => (
              <EventCard key={concert.id} {...concert} />
            ))}
          </div>
        ) : (
          <div className="font-anek flex items-center justify-center text-xl font-semibold text-white">
            No concerts found
          </div>
        )}
      </section>

      <section
        id="trains"
        className="font-anek flex flex-col gap-8 fill-white text-white"
      >
        <div className="flex items-center justify-between">
          <Link
            className="flex items-center text-2xl font-semibold hover:fill-gray-400 hover:text-gray-400"
            href="/trains"
          >
            Book Trains
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
            href="/trains"
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
        {trainsLoading ? (
          <LoadingIndicator text="Loading trains..." />
        ) : trainsError ? (
          <ErrorMessage message="Failed to load trains" />
        ) : trains && trains.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trains.map((train) => (
              <TrainCard key={train.id} {...train} />
            ))}
          </div>
        ) : (
          <div className="font-anek flex items-center justify-center text-xl font-semibold text-white">
            No trains found
          </div>
        )}
      </section>
    </div>
  );
}
