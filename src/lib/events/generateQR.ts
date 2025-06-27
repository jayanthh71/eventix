import { Booking, Event, Train, User } from "@prisma/client";
import QRCode from "qrcode";

export default async function generateQR(
  booking: Booking,
  user: User,
  event?: Event,
  train?: Train,
) {
  try {
    const qrData = event
      ? {
          bookingId: booking.id,
          eventId: event.id,
          eventTitle: event.title,
          eventLocation: event.location,
          eventDate: booking.time,
          userName: user.name,
          userEmail: user.email,
          quantity: booking.quantity,
        }
      : train
        ? {
            bookingId: booking.id,
            trainId: train.id,
            trainName: train.name,
            trainNumber: train.number,
            trainTo: train.to,
            trainFrom: train.from,
            trainDeparture: train.departure,
            trainArrival: train.arrival,
            userName: user.name,
            userEmail: user.email,
            quantity: booking.quantity,
          }
        : null;

    const params = new URLSearchParams();
    if (qrData) {
      Object.entries(qrData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, String(value));
        }
      });
    }

    const qrString = `${process.env.FRONTEND_URL || "http://localhost:3000"}/api/bookings/qr?${params.toString()}`;
    const qrCodeDataURL = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: "M",
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      width: 256,
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error("Error generating QR code:", error);
  }
}
