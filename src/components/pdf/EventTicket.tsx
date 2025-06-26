import generateQR from "@/lib/events/generateQR";
import { Booking, Event, User } from "@prisma/client";
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

Font.register({
  family: "Anek Latin",
  fonts: [
    {
      src: `${process.cwd()}/public/fonts/AnekLatin-Regular.ttf`,
      fontWeight: "normal",
    },
    {
      src: `${process.cwd()}/public/fonts/AnekLatin-Medium.ttf`,
      fontWeight: "medium",
    },
    {
      src: `${process.cwd()}/public/fonts/AnekLatin-SemiBold.ttf`,
      fontWeight: "semibold",
    },
    {
      src: `${process.cwd()}/public/fonts/AnekLatin-Bold.ttf`,
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Anek Latin",
    fontSize: 12,
    padding: 40,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#6366f1",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  logo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#7c3aed",
    fontFamily: "Anek Latin",
  },
  ticketId: {
    fontSize: 11,
    color: "#374151",
    fontWeight: "medium",
    backgroundColor: "#f3f4f6",
    padding: 8,
    borderRadius: 6,
    fontFamily: "Anek Latin",
  },
  title: {
    fontSize: 24,
    fontWeight: "semibold",
    color: "#111827",
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "Anek Latin",
  },
  ticketContainer: {
    padding: 24,
    marginBottom: 20,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  eventDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  eventLeft: {
    flex: 2,
    paddingRight: 20,
  },
  eventRight: {
    flex: 1,
    alignItems: "flex-start",
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 8,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: "semibold",
    color: "#111827",
    marginBottom: 8,
    letterSpacing: 0.3,
    fontFamily: "Anek Latin",
  },
  eventDescription: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 1.6,
    marginBottom: 12,
    fontFamily: "Anek Latin",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 24,
    gap: 8,
  },
  infoItem: {
    flex: 1,
    minWidth: 120,
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    margin: 4,
  },
  infoLabel: {
    fontSize: 11,
    color: "#6366f1",
    fontWeight: "semibold",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontFamily: "Anek Latin",
  },
  infoValue: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "medium",
    fontFamily: "Anek Latin",
  },
  priceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#ecfdf5",
    borderRadius: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#10b981",
  },
  priceLabel: {
    fontSize: 16,
    color: "#065f46",
    fontWeight: "semibold",
    fontFamily: "Anek Latin",
  },
  priceValue: {
    fontSize: 20,
    color: "#10b981",
    fontWeight: "semibold",
    fontFamily: "Anek Latin",
  },
  qrSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  qrPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderStyle: "dashed",
  },
  qrText: {
    fontSize: 12,
    color: "#374151",
    textAlign: "center",
    fontWeight: "medium",
    fontFamily: "Anek Latin",
  },
});

export default function EventTicket({
  event,
  user,
  booking,
}: {
  event: Event;
  user: User;
  booking: Booking;
}) {
  const eventDateTime = new Date(booking.time);
  const qrCode = generateQR(booking, user, event);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image
              src={`${process.cwd()}/public/logo.png`}
              style={styles.logoImage}
            />
            <Text style={styles.logo}>Eventix</Text>
          </View>
          <Text style={styles.ticketId}>
            Booking ID: {booking.id.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.title}>
          {event.category === "MOVIE" ? "Movie Ticket" : "Concert Ticket"}
        </Text>

        <View style={styles.ticketContainer}>
          <View style={styles.eventDetails}>
            <View style={styles.eventLeft}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDescription}>{event.description}</Text>
            </View>
            <View style={styles.eventRight}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>
                {eventDateTime.toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Venue</Text>
              <Text style={styles.infoValue}>{event.location}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>
                {event.category === "MOVIE" ? "Showtime" : "Time"}
              </Text>
              <Text style={styles.infoValue}>
                {eventDateTime.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>
                {event.category === "MOVIE" ? "Tickets" : "Seats"}
              </Text>
              <Text style={styles.infoValue}>
                {booking.quantity} Ticket{booking.quantity > 1 ? "s" : ""}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Holder</Text>
              <Text style={styles.infoValue}>{user.name}</Text>
            </View>
          </View>

          <View style={styles.priceInfo}>
            <Text style={styles.priceLabel}>Total Amount Paid</Text>
            <Text style={styles.priceValue}>
              Rs. {booking.totalPrice.toFixed(2)}
            </Text>
          </View>

          <View style={styles.qrSection}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image
              src={qrCode}
              style={{
                width: 120,
                height: 120,
                marginBottom: 12,
              }}
            />
            <Text style={styles.qrText}>
              Scan this code at the venue for entry
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
