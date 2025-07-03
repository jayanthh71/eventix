import EventTicket from "@/components/pdf/EventTicket";
import TrainTicket from "@/components/pdf/TrainTicket";
import generateQR from "@/lib/events/generateQR";
import prisma from "@/lib/prisma";
import { Booking, Event, Train, User } from "@prisma/client";
import { pdf } from "@react-pdf/renderer";
import fs from "fs";
import nodemailer from "nodemailer";
import path from "path";

async function getSeatsFromBooking(bookingId: string) {
  return await prisma.seat.findMany({
    where: { bookingId },
    select: { row: true, number: true },
    orderBy: [{ row: "asc" }, { number: "asc" }],
  });
}

export default async function generateEmail(
  user: User,
  booking: Booking,
  event?: Event,
  train?: Train,
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let pdfBuffer: Buffer | null = null;
  let filename = "";

  let seatList: { row: string; number: number }[] = [];
  let qrCode = "";
  if (event) {
    seatList = await getSeatsFromBooking(booking.id);
    const qrResult = await generateQR(booking, user, event);
    qrCode = qrResult || "";
  } else if (train) {
    const qrResult = await generateQR(booking, user, undefined, train);
    qrCode = qrResult || "";
  }

  try {
    let ticketComponent;

    if (train) {
      ticketComponent = (
        <TrainTicket
          train={train}
          user={user}
          booking={booking}
          qrCode={qrCode}
        />
      );
      filename = `${train.name.replace(/[^a-zA-Z0-9]/g, "_")}_Train_Ticket.pdf`;
    } else if (event) {
      ticketComponent = (
        <EventTicket
          event={event}
          user={user}
          booking={booking}
          seats={seatList}
          qrCode={qrCode}
        />
      );
      const eventType = event.category === "MOVIE" ? "Movie" : "Concert";
      filename = `${event.title.replace(/[^a-zA-Z0-9]/g, "_")}_${eventType}_Ticket.pdf`;
    }

    if (ticketComponent) {
      const stream = await pdf(ticketComponent).toBuffer();
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      pdfBuffer = Buffer.concat(chunks);
    } else {
    }
  } catch (error) {
    console.error("Failed to generate PDF:", error);
  }

  const isEvent = !!event;
  const type = isEvent
    ? event?.category === "MOVIE"
      ? "Movie"
      : "Concert"
    : "Train";
  const htmlContent = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          @font-face {
            font-family: "Anek Latin";
            src: url("https://fonts.googleapis.com/css2?family=Anek+Latin:wght@400;500;600;700&display=swap");
          }
          body {
            font-family:
              "Anek Latin", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f8fafc;
            line-height: 1.6;
          }
          .container {
            max-width: 750px;
            margin: 0 auto;
            background-color: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          }
          .header {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .logo-section {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
          }
          .logo {
            width: 48px;
            height: 48px;
            margin-right: 15px;
          }
          .brand-name {
            font-family: "Anek Latin", sans-serif;
            font-size: 36px;
            font-weight: 700;
            letter-spacing: -0.5px;
            margin: 0;
          }
          .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 600;
            font-family: "Anek Latin", sans-serif;
            letter-spacing: -0.3px;
          }
          .header p {
            margin: 15px 0 0 0;
            opacity: 0.9;
            font-size: 18px;
            font-family: "Anek Latin", sans-serif;
            font-weight: 400;
          }
          .content {
            padding: 40px;
            font-family: "Anek Latin", sans-serif;
          }
          .content p {
            font-size: 16px;
            color: #374151;
            margin: 16px 0;
          }
          .content h3 {
            font-family: "Anek Latin", sans-serif;
            font-weight: 600;
            font-size: 20px;
          }
          .ticket-details {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 18px 0;
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .detail-label {
            font-weight: 600;
            color: #475569;
            font-family: "Anek Latin", sans-serif;
            font-size: 15px;
            flex: 1;
          }
          .detail-value {
            color: #1e293b;
            font-family: "Anek Latin", sans-serif;
            font-size: 15px;
            font-weight: 500;
            flex: 2;
            text-align: right;
          }
          .price-section {
            background: linear-gradient(135deg, #ecfdf5, #d1fae5);
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            text-align: center;
            border: 2px solid #10b981;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
          }
          .price-section h3 {
            font-family: "Anek Latin", sans-serif;
            font-weight: 600;
            font-size: 18px;
          }
          .price-amount {
            font-size: 32px;
            font-weight: 700;
            color: #059669;
            font-family: "Anek Latin", sans-serif;
            letter-spacing: -0.5px;
          }
          .status-badge {
            display: inline-block;
            background-color: #10b981;
            color: white;
            padding: 6px 16px;
            border-radius: 25px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            font-family: "Anek Latin", sans-serif;
            letter-spacing: 0.5px;
          }
          ul {
            font-family: "Anek Latin", sans-serif;
            font-size: 15px;
            line-height: 1.7;
            color: #374151;
          }
          ul li {
            margin: 8px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-section">
              <img src="cid:logo" alt="Eventix Logo" class="logo" />
              <h2 class="brand-name">Eventix</h2>
            </div>
            <h1>Ticket Confirmation</h1>
            <p>Your ${type} booking is confirmed!</p>
          </div>

          <div class="content">
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>
              Your ${type.toLowerCase()} ticket has been confirmed and is ready. Please find the attached ticket for QR code
            </p>

            <div class="ticket-details">
              <h3 style="margin-top: 0; color: #6366f1">
                ${isEvent ? "Event" : "Train"} Details
              </h3>

              <div class="detail-row">
                <span class="detail-label"
                  >${isEvent ? "Event" : "Train"} Name:</span
                >
                <span class="detail-value"
                  ><strong>${event?.title || train?.name}</strong></span
                >
              </div>

              ${
                event
                  ? `
              <div class="detail-row">
                <span class="detail-label">Category:</span>
                <span class="detail-value"
                  >${event.category === "MOVIE" ? "Movie" : "Concert"}</span
                >
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value"
                  >${new Date(
                    event.category === "MOVIE" ? booking.time : event.date,
                  ).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</span
                >
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value"
                  >${new Date(
                    event.category === "MOVIE" ? booking.time : event.date,
                  ).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}</span
                >
              </div>
              <div class="detail-row">
                <span class="detail-label">Venue:</span>
                <span class="detail-value">${
                  event.category === "MOVIE" ? booking.location : event.location
                }</span>
              </div>
              `
                  : ""
              } ${
                train
                  ? `
              <div class="detail-row">
                <span class="detail-label">Train Number:</span>
                <span class="detail-value">${train.number}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Route:</span>
                <span class="detail-value">${train.from} → ${train.to}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Departure:</span>
                <span class="detail-value"
                  >${new Date(train.departure).toLocaleString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}</span
                >
              </div>
              <div class="detail-row">
                <span class="detail-label">Arrival:</span>
                <span class="detail-value"
                  >${new Date(train.arrival).toLocaleString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}</span
                >
              </div>
              `
                  : ""
              }

              <div class="detail-row">
                <span class="detail-label">Quantity:</span>
                <span class="detail-value">
                  ${booking.quantity} Ticket${booking.quantity > 1 ? "s" : ""}
                  ${
                    seatList.length > 0
                      ? ` (${seatList
                          .map(
                            (seat) =>
                              `${seat.row}-${
                                seat.number -
                                (seat.row === "A"
                                  ? 1
                                  : seat.number > 15
                                    ? 5
                                    : seat.number > 6
                                      ? 3
                                      : 1)
                              }`,
                          )
                          .join(", ")})`
                      : ""
                  }
                </span>
              </div>

              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">${booking.id.toUpperCase()}</span>
              </div>
            </div>

            <div class="price-section">
              <h3 style="margin: 0 0 10px 0; color: #059669">Total Amount Paid</h3>
              <div class="price-amount">Rs. ${booking.totalPrice.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const mailOptions = {
      from: `"Eventix" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Eventix ${type} Ticket Confirmation - ${event?.title || train?.name}`,
      html: htmlContent,
      attachments: [] as Array<{
        filename: string;
        path?: string;
        content?: Buffer;
        contentType?: string;
        cid?: string;
      }>,
    };

    try {
      const logoPath = path.join(process.cwd(), "public", "logo.png");
      if (fs.existsSync(logoPath)) {
        mailOptions.attachments.push({
          filename: "logo.png",
          path: logoPath,
          cid: "logo",
        });
      }
    } catch (logoError) {
      console.error("Failed to attach logo:", logoError);
    }

    if (pdfBuffer && filename) {
      mailOptions.attachments.push({
        filename: filename,
        content: pdfBuffer,
        contentType: "application/pdf",
      });
    }

    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error(`Failed to send email to ${user.email}:`, err);
  }
}
