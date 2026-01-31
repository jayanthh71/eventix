# Eventix

A comprehensive event and train booking platform with real-time seat selection, multiple payment methods, and role-based access control.

**By Jayanth Ramesh Kumar** | [Live Demo](https://eventix-bookings.vercel.app)

## Preview
<img width="1456" alt="image" src="https://github.com/user-attachments/assets/b94819ca-4c54-4070-8b48-a474e334f509" />

## Overview

Eventix is a full-stack booking platform built with Next.js 15 that enables users to book movies, concerts, and train tickets. The application features real-time seat selection using WebSockets, secure payment processing through Stripe and wallet integration, automated PDF ticket generation with QR codes, and email delivery. It supports three user roles (Customer, Vendor, Admin) with dedicated dashboards for event management and booking oversight.

## Key Features

### Authentication & Security
- Secure user authentication with bcrypt password hashing and JWT tokens
- DAuth integration for third-party authentication
- Email-based password reset functionality
- Role-based access control (Customer, Vendor, Admin)

### Booking System
- Real-time seat selection with WebSocket synchronization
- Support for movies, concerts, and train bookings
- Dynamic pricing and availability management
- Multiple date and location support for events

### Payment Processing
- Integrated Stripe payment gateway
- Digital wallet system with balance management
- Secure payment intent creation and confirmation
- Transaction history tracking

### Ticket Management
- Automated PDF ticket generation using @react-pdf/renderer
- QR code generation for ticket validation
- Email delivery of tickets via Nodemailer
- QR-based check-in system for event validation

### Dashboards
- **Customer Dashboard**: View bookings, manage profile, track transactions
- **Vendor Dashboard**: Create and manage events, view sales analytics
- **Admin Dashboard**: Full platform oversight, user management, event approval

### Additional Features
- AWS S3 integration for image uploads and storage
- Profile management with avatar upload
- Responsive design with Tailwind CSS
- Optimistic updates with React Query
- PostgreSQL database with Prisma ORM

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **State Management**: React Query (TanStack Query)
- **Type Safety**: TypeScript

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: PostgreSQL with Neon serverless
- **ORM**: Prisma with driver adapters
- **WebSockets**: Socket.io & Express server

### Integrations
- **Payments**: Stripe
- **Email**: Nodemailer
- **File Storage**: AWS S3
- **Authentication**: JWT, DAuth
- **PDF Generation**: @react-pdf/renderer
- **QR Codes**: qrcode library

### Development
- **Package Manager**: pnpm
- **Linting**: ESLint
- **Code Formatting**: Prettier
- **Containerization**: Docker

## Getting Started

### Prerequisites
- Node.js 20 or higher
- pnpm installed globally
- PostgreSQL database (or Neon account)
- AWS S3 bucket
- Stripe account
- Email service credentials

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/eventix.git
cd eventix
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Deployment
FRONTEND_URL="http://localhost:3000"
NEXT_PUBLIC_SERVER_URL="http://localhost:3001"

# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT
JWT_SECRET="your-secret-key-min-32-characters"

# Email
EMAIL_USER="your-email@example.com"
EMAIL_PASS="your-app-password"

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET_NAME="your-bucket-name"

# DAuth
DAUTH_ID="your-dauth-client-id"
DAUTH_SECRET="your-dauth-client-secret"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
```

4. Set up the database
```bash
pnpm prisma migrate dev
pnpm prisma generate
```

5. Run the development server
```bash
pnpm dev
```

6. (Optional) Start the WebSocket server
```bash
cd server
# Follow server setup instructions
```

The application will be available at `http://localhost:3000`
