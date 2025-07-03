# Eventix

### By Jayanth Ramesh Kumar

### Live on https://delta-web-t3.vercel.app

## Features

- **User Authentication** (with hashing and jwt)
- **DAuth Integration**
- **Event & Train Booking**
- **Stripe Payments & Wallet**
- **PDF Ticket Generation**
- **QR Code Check-in**
- **Ticket mail delivery**
- **Real-time Seat Selection** (websockets)
- **Admin & Vendor Dashboards**
- **Profile Management**
- **Password Reset**
- **AWS S3 Image Uploads**

## Tech Stack

- **Next.js**
- **React**
- **Tailwind CSS**
- **TypeScript**
- **PostgreSQL**
- **Prisma ORM**
- **pnpm**
- **React Query** (data fetching/caching)
- **Stripe** (payments)
- **React-pdf** (pdf generation)
- **Nodemailer** (email delivery)
- **AWS** (image storage)
- **Socket.io** (websockets)
- **Express** (websocket server)
- **Docker** (server containerization)

## Setup

1. **Clone the repo:**
   ```sh
   git clone https://github.com/jayanthh71/delta-web-t3.git
   cd delta-web-t3
   ```
2. **Install dependencies:**
   ```sh
   pnpm install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in variables
4. **Run database migrations:**
   ```sh
   pnpm exec prisma migrate deploy
   ```
5. **Start the dev server:**
   ```sh
   pnpm dev
   ```
6. **Start the backend server (for realtime seat selection):**
   ```sh
   cd server && pnpm install && pnpm start
   ```
## Preview
<img width="1456" alt="image" src="https://github.com/user-attachments/assets/b94819ca-4c54-4070-8b48-a474e334f509" />

