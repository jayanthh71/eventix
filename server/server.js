const cors = require("cors");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const seatState = {};

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join-room", (payload) => {
    const { movieId, showtime, date, location, userId } = payload;
    let combinedShowtimeISO = showtime;
    if (date && showtime) {
      const dateObj = new Date(date);
      const timeObj = new Date(showtime);
      dateObj.setHours(timeObj.getHours(), timeObj.getMinutes(), 0, 0);
      combinedShowtimeISO = dateObj.toISOString();
    }
    const room = `${movieId}_${combinedShowtimeISO}_${location}`;
    socket.join(room);
    socket.data = socket.data || {};
    socket.data.room = room;
    socket.data.userId = userId;
    socket.emit("seat-state", seatState[room] || {});
  });

  socket.on("select-seat", (payload) => {
    const room = socket.data.room;
    const userId = socket.data.userId;
    if (!room) return;
    seatState[room] = seatState[room] || {};
    if (!seatState[room][payload.seatId]) {
      seatState[room][payload.seatId] = userId;
      io.to(room).emit("seat-update", { seatId: payload.seatId, userId });
    }
  });

  socket.on("unselect-seat", (payload) => {
    const room = socket.data.room;
    const userId = socket.data.userId;
    if (!room) return;
    if (seatState[room] && seatState[room][payload.seatId] === userId) {
      delete seatState[room][payload.seatId];
      io.to(room).emit("seat-update", { seatId: payload.seatId, userId: null });
    }
  });

  socket.on("disconnect", () => {
    const room = socket.data.room;
    const userId = socket.data.userId;
    if (room && seatState[room]) {
      Object.entries(seatState[room]).forEach(([seatId, holder]) => {
        if (holder === userId) {
          delete seatState[room][seatId];
          io.to(room).emit("seat-update", { seatId, userId: null });
        }
      });
    }
  });
});

app.get("/", (req, res) => {
  res.send("Socket.IO server is running.");
});

app.post("/api/notify-booking", express.json(), (req, res) => {
  const { room, seatIds } = req.body;
  if (!room || !Array.isArray(seatIds)) {
    console.log("Invalid notify-booking payload", req.body);
    return res.status(400).send("Invalid");
  }
  seatState[room] = seatState[room] || {};
  seatIds.forEach((seatId) => {
    if (seatState[room][seatId]) {
      delete seatState[room][seatId];
    }
  });
  io.to(room).emit("seat-booked", { seatIds });
  res.send("OK");
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
