import { Booking, Event, PaymentMethod, Train } from "@prisma/client";
import Image from "next/image";

type BookingWithIncludes = Booking & {
  event?: Event | null;
  train?: Train | null;
  paymentMethod?: PaymentMethod;
  paymentIntentId?: string | null;
};

export default function TransactionCard({
  transaction,
}: {
  transaction: BookingWithIncludes;
}) {
  return (
    <div className="rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-lg">
              <Image
                src={
                  transaction.event?.imageUrl ||
                  transaction.train?.imageUrl ||
                  (transaction.event?.category === "CONCERT"
                    ? "/concert.jpg"
                    : transaction.event?.category === "MOVIE"
                      ? "/movie.jpg"
                      : transaction.train
                        ? "/train.jpg"
                        : "/concert.jpg")
                }
                alt={
                  transaction.event?.title ||
                  transaction.train?.name ||
                  (transaction.event?.category === "CONCERT"
                    ? "Concert"
                    : transaction.event?.category === "MOVIE"
                      ? "Movie"
                      : transaction.train
                        ? "Train"
                        : "Event")
                }
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-anek text-lg font-bold text-white">
                {transaction.event?.title || transaction.train?.name}
              </h3>
              <p className="font-anek text-sm text-gray-400">
                {transaction.event
                  ? `${transaction.event.location} • ${new Date(transaction.event.date).toLocaleDateString()}`
                  : transaction.train
                    ? `${transaction.train.from} → ${transaction.train.to}`
                    : "Event details"}
              </p>
              <div className="mt-2 flex items-center gap-4">
                <span className="font-anek text-sm text-gray-300">
                  Quantity: {transaction.quantity}
                </span>
                <span
                  className={`font-anek rounded-full px-2 py-1 text-xs font-medium ${
                    transaction.status === "CONFIRMED"
                      ? "bg-green-600/20 text-green-400"
                      : transaction.status === "CANCELLED"
                        ? "bg-red-600/20 text-red-400"
                        : "bg-yellow-600/20 text-yellow-400"
                  }`}
                >
                  {transaction.status}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-anek text-2xl font-bold text-white">
            ₹{transaction.totalPrice.toFixed(2)}
          </div>
          <div className="font-anek text-sm text-gray-400">
            {new Date(transaction.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="mt-1">
            <span
              className={`font-anek inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                transaction.paymentMethod === "STRIPE"
                  ? "bg-blue-600/20 text-blue-400"
                  : "bg-green-600/20 text-green-400"
              }`}
            >
              {transaction.paymentMethod === "STRIPE" ? (
                <>
                  <svg
                    className="h-5 w-5 text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                  </svg>
                  Card
                </>
              ) : (
                <>
                  <svg
                    className="h-5 w-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Wallet
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
