# Evergreen Backend API

A Hono.js backend API for the Evergreen logistics management system.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Gallery Management**: Cloudinary integration for media uploads
- **Shipment Tracking**: Real-time shipment status updates
- **Notifications**: User notification system
- **Rate Limiting**: Request rate limiting for security
- **MSSQL Database**: Microsoft SQL Server integration

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Hono.js
- **Database**: MSSQL
- **Authentication**: JWT
- **File Uploads**: Cloudinary
- **Rate Limiting**: hono-rate-limiter

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd evergreen-backend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration values.

4. **Database Setup**

   This project uses Prisma as the ORM for database interactions, with the schema defined in [`prisma/schema.prisma`](prisma/schema.prisma). The database is Microsoft SQL Server.

   **Prisma Workflow:**

   - The Prisma schema defines the database models and relationships for Users, Shipments, ShipmentEvents, Invoices, GalleryItems, Notifications, MediaUploads, and Otp.

   - After making changes to the schema, generate the Prisma client:

     ```bash
     npx prisma generate
     ```

   - For database schema setup and migrations:

     **Development Environment:**

     1. Create a MSSQL database named `EvergreenDB`.

     2. Initialize the database schema using Prisma migrations:

        ```bash
        npx prisma migrate dev --name init
        ```

        This creates the initial migration based on the current schema and applies it to the database.

     3. Seed the database with initial test data:

        ```bash
        tsx scripts/seed.ts
        ```

        This creates test users (admin, client, staff) using Prisma.

     **Production Environment:**

     1. Ensure the production MSSQL database is created.

     2. Deploy Prisma migrations:

        ```bash
        npx prisma migrate deploy
        ```

        This applies all pending migrations to the production database.

     3. Optionally, run the seed script if initial data is needed (modify [`scripts/seed.ts`](scripts/seed.ts) for production data).

5. **Start the development server**
   ```bash
   pnpm run dev
   ```

The server will start on `http://localhost:4545`

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration

### Gallery
- `GET /api/gallery` - Get gallery items (with optional category filter)
- `POST /api/gallery` - Create gallery item (Staff/Admin only)
- `DELETE /api/gallery/:id` - Delete gallery item (Admin only)

### Shipments
- `GET /api/shipments` - Get shipments (filtered by user role)
- `GET /api/shipments/:shipmentCode` - Track shipment by EVG code (public access)
- `GET /api/shipments/:id` - Get shipment by ID (authenticated)
- `PATCH /api/shipments/:id/status` - Update shipment status (Staff only)

### Shipment Tracking (EVG Code)

Users track shipments using a single public identifier:
```
EVG-XXXXXX
```

Internally, the system supports:
- EVG Code (primary public identifier)
- Bill of Lading
- Container Number

All three identifiers work in the same tracking input field for maximum flexibility.

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read

### Uploads
- `POST /api/uploads/cloudinary` - Upload file to Cloudinary (Staff/Admin only)

### Users
- `GET /api/users` - Get all users (Admin only)

## User Roles

- **SUPER_ADMIN**: Full system access
- **STAFF**: Can manage gallery and shipments
- **CLIENT**: Can view their shipments and notifications

## Development

- `pnpm run dev` - Start development server with hot reload
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
