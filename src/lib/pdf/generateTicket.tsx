"use client";

import EventTicket from "@/components/pdf/EventTicket";
import { Booking, Event, User } from "@prisma/client";
import { pdf } from "@react-pdf/renderer";

export const downloadTicket = async ({
  event,
  user,
  booking,
}: {
  event: Event;
  user: User;
  booking: Booking;
}) => {
  try {
    const blob = await pdf(
      <EventTicket event={event} user={user} booking={booking} />,
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    const eventType = event.category === "MOVIE" ? "Movie" : "Concert";
    link.download = `${event.title.replace(/[^a-zA-Z0-9]/g, "_")}_${eventType}_Ticket.pdf`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return { success: false, error: "Failed to generate PDF ticket" };
  }
};

export const previewTicket = async ({
  event,
  user,
  booking,
}: {
  event: Event;
  user: User;
  booking: Booking;
}) => {
  try {
    const blob = await pdf(
      <EventTicket event={event} user={user} booking={booking} />,
    ).toBlob();

    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);

    return { success: true };
  } catch (error) {
    console.error("Error previewing PDF:", error);
    return { success: false, error: "Failed to preview PDF ticket" };
  }
};
