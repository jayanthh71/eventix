"use client";

import EventTicketClient from "@/components/pdf/EventTicketClient";
import TrainTicketClient from "@/components/pdf/TrainTicketClient";
import { Booking, Event, Train, User } from "@prisma/client";
import { pdf } from "@react-pdf/renderer";

export const downloadTicket = async ({
  event,
  train,
  user,
  booking,
  seats = [],
}: {
  event?: Event;
  train?: Train;
  user: User;
  booking: Booking;
  seats?: { row: string; number: number }[];
}) => {
  try {
    let ticketComponent;
    let filename;

    if (train) {
      ticketComponent = (
        <TrainTicketClient train={train} user={user} booking={booking} />
      );
      filename = `${train.name.replace(/[^a-zA-Z0-9]/g, "_")}_Train_Ticket.pdf`;
    } else if (event) {
      ticketComponent = (
        <EventTicketClient
          event={event}
          user={user}
          booking={booking}
          seats={seats}
        />
      );
      const eventType = event.category === "MOVIE" ? "Movie" : "Concert";
      filename = `${event.title.replace(/[^a-zA-Z0-9]/g, "_")}_${eventType}_Ticket.pdf`;
    } else {
      return { success: false, error: "No event or train provided" };
    }

    const blob = await pdf(ticketComponent).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

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
  train,
  user,
  booking,
  seats = [],
}: {
  event?: Event;
  train?: Train;
  user: User;
  booking: Booking;
  seats?: { row: string; number: number }[];
}) => {
  try {
    let ticketComponent;

    if (train) {
      ticketComponent = (
        <TrainTicketClient train={train} user={user} booking={booking} />
      );
    } else if (event) {
      ticketComponent = (
        <EventTicketClient
          event={event}
          user={user}
          booking={booking}
          seats={seats}
        />
      );
    } else {
      return { success: false, error: "No event or train provided" };
    }

    const blob = await pdf(ticketComponent).toBlob();

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
