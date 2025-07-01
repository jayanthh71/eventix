"use client";

import { Booking } from "@prisma/client";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

interface StripePaymentFormProps {
  amount: number;
  eventId?: string;
  trainId?: string;
  quantity: number;
  time: string;
  location?: string;
  seatIds?: string[];
  onSuccess: (booking: Booking) => void;
  onError: (error: string) => void;
}

function PaymentForm({
  amount,
  eventId,
  trainId,
  quantity,
  time,
  location,
  seatIds,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/bookings/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          amount,
          eventId,
          trainId,
          quantity,
          time,
          location,
          seatIds,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const { clientSecret } = await response.json();

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
          },
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent?.status === "succeeded") {
        const confirmResponse = await fetch("/api/bookings/payments/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            time,
            location,
            seatIds,
          }),
        });

        if (!confirmResponse.ok) {
          throw new Error("Failed to confirm booking");
        }

        const { booking } = await confirmResponse.json();
        onSuccess(booking);
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-3">
          <h3 className="font-anek text-xl font-bold text-white">
            Card Details
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-gray-600/50 bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-4 backdrop-blur-sm">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#FFFFFF",
                    backgroundColor: "transparent",
                    fontFamily: "Anek Latin, system-ui, sans-serif",
                    fontWeight: "500",
                    lineHeight: "24px",
                    "::placeholder": {
                      color: "#9CA3AF",
                    },
                    iconColor: "#9CA3AF",
                  },
                  invalid: {
                    color: "#EF4444",
                    iconColor: "#EF4444",
                  },
                  complete: {
                    color: "#10B981",
                    iconColor: "#10B981",
                  },
                },
              }}
            />
          </div>

          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="font-anek w-full cursor-pointer rounded-xl bg-gradient-to-r from-purple-600/80 to-pink-600/80 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-purple-500/80 hover:to-pink-500/80 focus:ring-2 focus:ring-purple-500/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-5 w-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing Payment...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Pay with Card - ₹{amount.toFixed(2)}
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function StripePaymentForm(props: StripePaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
}
