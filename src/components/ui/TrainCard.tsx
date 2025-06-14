import { Train } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

export default function TrainCard(train: Train) {
  return (
    <Link
      href={`/trains/${train.id}`}
      className="rounded-lg bg-black transition-transform select-none hover:scale-105 hover:drop-shadow-lg"
    >
      <Image
        src={train.imageUrl || "/train.jpg"}
        alt={train.name}
        width={300}
        height={200}
        className="h-48 w-full rounded-t-lg object-cover"
      />
      <div className="font-anek p-4 text-white">
        <h3 className="text-lg font-semibold">{train.name}</h3>
        <p className="text-sm font-medium text-gray-500">{train.number}</p>
        <p className="text-center text-sm font-medium text-gray-400">
          {Math.floor(
            (new Date(train.arrival).getTime() -
              new Date(train.departure).getTime()) /
              (1000 * 60 * 60),
          )}
          h{" "}
          {Math.floor(
            ((new Date(train.arrival).getTime() -
              new Date(train.departure).getTime()) %
              (1000 * 60 * 60)) /
              (1000 * 60),
          )}
          m
        </p>
        <div className="flex items-center justify-between">
          <div className="text-left">
            <div className="text-sm font-bold">{train.from.split("-")[0]}</div>
            <div className="text-xs text-gray-400">
              {new Date(train.departure).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </div>
          </div>
          <div className="mx-3 flex flex-1 items-center">
            <div className="h-0.5 w-full bg-gray-500"></div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold">{train.to.split("-")[0]}</div>
            <div className="text-xs text-gray-400">
              {new Date(train.arrival).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <p className="mt-2 font-bold">₹{train.price.toFixed(2)}</p>
          <p className="mt-2 text-sm font-medium text-gray-500">
            {new Date(train.departure).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </Link>
  );
}
