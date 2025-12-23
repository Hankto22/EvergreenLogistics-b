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

## Quick Start

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Build the project**
   ```bash
   pnpm run build
   ```

3. **Initialize the database**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Seed the database**
   ```bash
   tsx scripts/seed.ts
   ```

5. **Run the development server**
   ```bash
   pnpm run dev
   ```

The server will start on `http://localhost:4545`.

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
- `GET /api/me` - Get current user details (authenticated)

### Gallery
- `GET /api/gallery` - Get gallery items (with optional category filter)
- `POST /api/gallery` - Create gallery item (Staff/Admin only)
- `DELETE /api/gallery/:id` - Delete gallery item (Admin only)

### Shipments
- `GET /api/shipments` - Get shipments (filtered by user role)
- `GET /api/shipments/evg/:evgCode` - Track shipment by EVG code (public access)
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

## Practical Examples

### Login with PowerShell curl
```powershell
# Login to get JWT token
$loginResponse = Invoke-RestMethod -Uri "http://localhost:4545/api/login" -Method Post -ContentType "application/json" -Body '{"email":"client@evergreen.com","password":"password123"}'
$token = $loginResponse.token

# Use token for protected endpoints
Invoke-RestMethod -Uri "http://localhost:4545/api/me" -Method Get -Headers @{Authorization="Bearer $token"}
```

### File Upload with JavaScript fetch (Form-Data)
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('category', 'documents');

fetch('http://localhost:4545/api/uploads/cloudinary', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

### Multipart Upload Example
```javascript
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);
formData.append('metadata', JSON.stringify({ description: 'Multiple files upload' }));

fetch('http://localhost:4545/api/uploads/cloudinary', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log('Uploaded files:', data));
```

## User Roles

- **SUPER_ADMIN**: Full system access
- **STAFF**: Can manage gallery and shipments
- **CLIENT**: Can view their shipments and notifications

## UUID Usage

All resource IDs in the API are UUIDs (Universally Unique Identifiers) following the standard RFC 4122 format. When making requests that include IDs (e.g., `/api/shipments/:id`), ensure the ID is a valid UUID string. Invalid UUIDs will result in a `400 Bad Request` error.

## Seeded Data

The database seeding script creates three test users for development and testing:

- **Admin User**: `admin@evergreen.com` / `password123` (Role: SUPER_ADMIN)
- **Client User**: `client@evergreen.com` / `password123` (Role: CLIENT)
- **Staff User**: `staff@evergreen.com` / `password123` (Role: STAFF)

Use these credentials to test authentication and role-based access control.

## Development

- `pnpm run dev` - Start development server with hot reload
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
