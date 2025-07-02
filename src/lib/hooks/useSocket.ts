import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type SeatState = Record<string, string>;
type SeatUpdate = { seatId: string; userId: string | null };

export function useSocket({
  movieId,
  showtime,
  date,
  location,
  userId,
  serverUrl,
}: {
  movieId: string;
  showtime: string;
  date: string;
  location: string;
  userId: string;
  serverUrl: string;
}) {
  const [seats, setSeats] = useState<SeatState>({});
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(serverUrl, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.emit("join-room", { movieId, showtime, date, location, userId });

    socket.on("seat-state", (state: SeatState) => setSeats(state));
    socket.on("seat-update", ({ seatId, userId }: SeatUpdate) => {
      setSeats((prev) => {
        if (userId) return { ...prev, [seatId]: userId };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [seatId]: _, ...rest } = prev;
        return rest;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [movieId, showtime, date, location, userId, serverUrl]);

  const selectSeat = (seatId: string) => {
    socketRef.current?.emit("select-seat", { seatId });
  };
  const unselectSeat = (seatId: string) => {
    socketRef.current?.emit("unselect-seat", { seatId });
  };

  return { seats, selectSeat, unselectSeat };
}
