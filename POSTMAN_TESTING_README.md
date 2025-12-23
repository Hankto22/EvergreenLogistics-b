# Evergreen Logistics API - Postman Testing Guide

## ✅ Server Status: RUNNING

**Great news!** The server is now running successfully on `http://localhost:4545`

## Prerequisites

Before testing the API, ensure you have the following set up:

1. **Node.js and pnpm**: Install Node.js (v18+) and pnpm package manager
2. **SQL Server**: Ensure SQL Server is running locally or accessible
3. **Environment Variables**: Copy `.env.example` to `.env` and configure:
   - Database connection details (DB_USER, DB_PASSWORD, DB_SERVER, etc.)
   - JWT_SECRET for token signing
   - Cloudinary credentials (for file uploads)
   - Email configuration (for notifications)

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Initialize Database**:
   ```bash
   # Run database schema initialization
   pnpm tsx scripts/init-db.ts
   ```

3. **Start the Development Server**:
   ```bash
   pnpm run dev
   ```
   The server should start on `http://localhost:4545`

4. **Import the Collection**:
    - Open Postman
    - Click "Import" button
    - Select "File" tab
    - Choose `Evergreen_Logistics_API.postman_collection.json`
    - Click "Import"

5. **Configure Environment Variables**:
    - The collection uses these variables:
      - `baseUrl`: `http://localhost:4545` ✅ (server confirmed running)
      - `authToken`: Automatically set after login
      - `userId`: Set this manually after creating a user (for testing individual user operations)
      - `shipmentId`: Set after creating a shipment
      - `currentUserId`: For user-specific operations

6. **Create Environment in Postman** (Optional):
    - Click "Environments" in left sidebar
    - Click "Create Environment"
    - Name it "Evergreen Logistics"
    - Add variables: `baseUrl`, `authToken`, `userId`, `shipmentId`, `currentUserId`
    - Set initial values as needed

7. **Start Testing**:
    - Begin with the "Health Check" endpoint to verify connectivity
    - Then proceed with user registration and login

## Complete API Endpoints

### Authentication Endpoints
- `POST /api/register` - Register new user (admin/staff/client)
- `POST /api/login` - User login with JWT token
- `POST /api/create-user` - Create additional users (admin only)
- `GET /api/me` - Get current authenticated user details
- `POST /api/request-otp` - Request OTP for password reset/login
- `POST /api/verify-otp` - Verify OTP and complete login

### User Management Endpoints (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user details
- `DELETE /api/users/:id` - Delete user

### Shipment Management Endpoints
- `GET /api/shipments` - Get all shipments
- `GET /api/shipments/:id` - Get shipment by ID
- `GET /api/shipments/evg/:evgCode` - Get shipment by EVG tracking code (public)
- `POST /api/shipments` - Create new shipment
- `PUT /api/shipments/:id` - Update shipment details
- `DELETE /api/shipments/:id` - Delete shipment

### Dashboard Endpoints
- `GET /api/dashboard/admin` - Admin dashboard metrics (SUPER_ADMIN only)
- `GET /api/dashboard/user` - User dashboard statistics
- `GET /api/dashboard/recent-orders` - Recent shipment activity (SUPER_ADMIN only)

### Gallery Endpoints
- `GET /api/gallery` - Get all gallery items
- `GET /api/gallery/:id` - Get gallery item by ID
- `POST /api/gallery` - Create gallery item (authenticated)
- `PUT /api/gallery/:id` - Update gallery item (authenticated)
- `DELETE /api/gallery/:id` - Delete gallery item (authenticated)

### Notifications Endpoints
- `GET /api/notifications` - Get user notifications (authenticated)
- `GET /api/notifications/:id` - Get notification by ID (authenticated)
- `POST /api/notifications` - Create notification (authenticated)
- `PUT /api/notifications/:id/read` - Mark notification as read (authenticated)
- `DELETE /api/notifications/:id` - Delete notification (authenticated)

### Uploads Endpoints
- `POST /api/uploads` - Upload media file (authenticated, multipart/form-data)

### Utility Endpoints
- `GET /health` - Server health check

## Testing Flow

### 1. Health Check
- **Endpoint**: `GET /health`
- **Purpose**: Verify server is running
- **Expected Response**: `{"status": "OK"}`

### 2. User Registration
- **Endpoint**: `POST /api/register`
- **Body**:
```json
{
  "email": "admin@evergreen.com",
  "password": "password123",
  "fullName": "Admin User",
  "role": "SUPER_ADMIN"
}
```
- **Purpose**: Create first admin user

### 3. User Login
- **Endpoint**: `POST /api/login`
- **Body**:
```json
{
  "email": "admin@evergreen.com",
  "password": "password123"
}
```
- **Purpose**: Authenticate and get JWT token
- **Note**: Token is automatically saved to `authToken` variable

### 4. Create Additional Users
- **Endpoint**: `POST /api/create-user`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "client@evergreen.com",
  "phone_number": "+1234567890",
  "password": "password123"
}
```

### 5. Test User Management (Admin Only)
- **Get All Users**: `GET /api/users`
- **Get Specific User**: `GET /api/users/{user-id}`
- **Update User**: `PUT /api/users/{user-id}`
- **Delete User**: `DELETE /api/users/{user-id}`

### 6. Test Dashboard Endpoints
- **Admin Dashboard**: `GET /api/dashboard/admin`
- **User Dashboard**: `GET /api/dashboard/user`
- **Recent Orders**: `GET /api/dashboard/recent-orders?limit=5`

### 7. Test User Profile Endpoint
- **Get Current User**: `GET /api/me`
- **Headers**: `Authorization: Bearer {{authToken}}`
- **Purpose**: Retrieve authenticated user's profile information
- **Expected Response**:
```json
{
  "success": true,
  "message": "User info retrieved successfully",
  "data": {
    "id": "uuid-string",
    "role": "CLIENT",
    "fullName": "John Doe",
    "email": "client@evergreen.com"
  }
}
```

### 8. Test EVG Tracking (Public Endpoint)
- **Get Shipment by EVG Code**: `GET /api/shipments/evg/{evgCode}`
- **Purpose**: Public tracking of shipments using EVG code (no authentication required)
- **Example**: `GET /api/shipments/evg/EVG123456`
- **Expected Response** (when shipment exists):
```json
{
  "success": true,
  "message": "Shipment retrieved successfully",
  "data": {
    "Id": "uuid-string",
    "ShipmentCode": "SHP001",
    "EVGCode": "EVG123456",
    "BillOfLading": "BOL123456",
    "status": "IN_TRANSIT",
    "progressPercent": 50
  }
}
```
- **Note**: EVG codes follow format `EVG` + 6 digits (e.g., EVG000001 to EVG999999)

## Expected Responses

### Successful Authentication
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "admin@evergreen.com",
      "role": "SUPER_ADMIN",
      "fullName": "Admin User",
      "isActive": true
    },
    "token": "jwt-token-string"
  }
}
```

### Dashboard Data (Admin)
```json
{
  "success": true,
  "message": "Admin dashboard data retrieved successfully",
  "data": {
    "totalShipments": 0,
    "activeShipments": 0,
    "totalClients": 0,
    "totalRevenue": 0
  }
}
```

### Dashboard Data (User)
```json
{
  "success": true,
  "message": "User dashboard data retrieved successfully",
  "data": {
    "totalShipments": 0,
    "activeShipments": 0,
    "completedShipments": 0,
    "totalSpent": 0
  }
}
```

## Handling UUIDs in Requests and Responses

The API uses UUID (Universally Unique Identifier) format for all ID fields. UUIDs are 36-character strings with the format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### Important Notes:
- **User IDs**: Copy from login/register responses and store in `userId` variable
- **Shipment IDs**: Copy from shipment creation responses and store in `shipmentId` variable
- **Request Parameters**: Use the full UUID string in URL paths (e.g., `/api/users/550e8400-e29b-41d4-a716-446655440000`)
- **Response Data**: All `id`/`Id` fields in responses are UUIDs
- **Postman Variables**: Set `userId`, `shipmentId`, and `currentUserId` variables for reuse in subsequent requests

### Example UUID Handling:
1. After login, the response includes: `"id": "550e8400-e29b-41d4-a716-446655440000"`
2. Set this value to the `userId` Postman variable
3. Use `{{userId}}` in subsequent requests like `GET /api/users/{{userId}}`

## Common Error Scenarios and Troubleshooting

### Authentication & Authorization Errors

1. **401 Unauthorized - "Invalid token"**
   - **Cause**: Missing or expired JWT token
   - **Solution**: Re-login to get a fresh token, ensure `Authorization: Bearer {{authToken}}` header is set

2. **403 Forbidden - "Insufficient permissions"**
   - **Cause**: User role doesn't have access to the endpoint
   - **Solution**: Use SUPER_ADMIN role for admin endpoints, check role permissions table

3. **401 Unauthorized - "Token expired"**
   - **Cause**: JWT token has expired (default: 24 hours)
   - **Solution**: Re-authenticate with login endpoint

### Validation Errors

4. **400 Bad Request - "Validation failed"**
   - **Cause**: Request body doesn't match schema requirements
   - **Solution**: Check required fields, data types, and format constraints

5. **400 Bad Request - "Invalid EVG code format"**
   - **Cause**: EVG code doesn't match `EVG` + 6 digits pattern
   - **Solution**: Use correct format like `EVG123456`

### Database & Data Errors

6. **404 Not Found - "User not found"**
   - **Cause**: UUID doesn't exist in database
   - **Solution**: Verify UUID from previous responses, check if user was deleted

7. **409 Conflict - "Email already exists"**
   - **Cause**: Attempting to register with existing email
   - **Solution**: Use different email or login instead

8. **500 Internal Server Error**
   - **Cause**: Database connection issues, server errors
   - **Solution**: Check database connectivity, server logs, environment variables

### Setup & Connectivity Issues

9. **Server Not Running**
   - **Cause**: Development server not started
   - **Solution**: Run `pnpm run dev`, ensure port 4545 is available

10. **Database Connection Failed**
    - **Cause**: SQL Server not running or connection string incorrect
    - **Solution**: Verify `.env` file, ensure SQL Server is running, check connection string format

11. **CORS Issues**
    - **Cause**: Cross-origin request blocked
    - **Solution**: API includes CORS middleware; check if request is from allowed origin

### File Upload Issues

12. **400 Bad Request - "File upload failed"**
    - **Cause**: Invalid file type, size too large, or Cloudinary configuration missing
    - **Solution**: Check file type (image/video/document), ensure Cloudinary credentials are set

### OTP & Email Issues

13. **400 Bad Request - "Invalid OTP"**
    - **Cause**: Wrong OTP code or expired
    - **Solution**: Request new OTP, check email for correct code

14. **Email Not Sent**
    - **Cause**: SMTP configuration incorrect
    - **Solution**: Verify email settings in `.env` file

## User Roles & Permissions

### Available Roles:
- **SUPER_ADMIN**: Full access to all endpoints
- **STAFF**: Limited access (not fully implemented)
- **CLIENT**: Basic user access

### Permission Matrix:
| Endpoint | SUPER_ADMIN | STAFF | CLIENT |
|----------|-------------|-------|--------|
| POST /api/register | ✅ | ❌ | ❌ |
| POST /api/login | ✅ | ✅ | ✅ |
| POST /api/create-user | ✅ | ❌ | ❌ |
| GET /api/users | ✅ | ❌ | ❌ |
| GET /api/users/:id | ✅ | ❌ | ❌ |
| PUT /api/users/:id | ✅ | ❌ | ❌ |
| DELETE /api/users/:id | ✅ | ❌ | ❌ |
| GET /api/dashboard/admin | ✅ | ❌ | ❌ |
| GET /api/dashboard/user | ✅ | ✅ | ✅ |
| GET /api/dashboard/recent-orders | ✅ | ❌ | ❌ |

## Reproducing Issues Locally

### General Steps for Issue Reproduction:

1. **Environment Setup**: Ensure all prerequisites are met (Node.js, SQL Server, .env configured)
2. **Clean Database**: Run `pnpm tsx scripts/init-db.ts` to reset database state
3. **Start Server**: Run `pnpm run dev` and verify health check endpoint
4. **Import Collection**: Fresh import of Postman collection
5. **Create Test Data**: Register users, create shipments as needed
6. **Reproduce Steps**: Follow the specific reproduction steps below

### Common Issue Reproduction Scenarios:

#### Scenario A: Authentication Flow Issues
1. Register a new SUPER_ADMIN user
2. Login and verify token is stored
3. Test `/api/me` endpoint to confirm authentication works
4. Wait 25+ hours or manually expire token
5. Attempt authenticated request - should get 401 "Token expired"
6. Re-login and verify new token works

#### Scenario B: EVG Tracking Issues
1. Create a shipment (note the EVG code in response)
2. Test `GET /api/shipments/evg/{evgCode}` without authentication
3. Verify shipment details are returned
4. Test with invalid EVG code format (e.g., `INVALID`) - should get 400 error
5. Test with non-existent EVG code - should get 404 error

#### Scenario C: UUID Handling Issues
1. Create a user and copy the UUID from response
2. Set `userId` variable in Postman
3. Test `GET /api/users/{{userId}}` - should work
4. Modify UUID slightly (change one character)
5. Test same endpoint - should get 404 "User not found"

#### Scenario D: Role-Based Access Issues
1. Register as CLIENT user
2. Login and get token
3. Attempt `GET /api/dashboard/admin` - should get 403 "Insufficient permissions"
4. Switch to SUPER_ADMIN user
5. Same request should now work

#### Scenario E: Database Connection Issues
1. Stop SQL Server
2. Attempt any database-dependent request
3. Should get 500 Internal Server Error
4. Restart SQL Server and verify requests work again

#### Scenario F: File Upload Issues
1. Login as authenticated user
2. Attempt upload without Cloudinary config - should fail
3. Configure Cloudinary credentials in .env
4. Retry upload - should succeed with Cloudinary URL in response

## Testing Scenarios

### Scenario 1: Admin User Management
1. Register as SUPER_ADMIN
2. Login and get token
3. Create additional users
4. List all users
5. Update a user
6. Delete a user

### Scenario 2: Client Dashboard Access
1. Login as CLIENT user
2. Access user dashboard
3. Try admin endpoints (should fail with 403)

### Scenario 3: Dashboard Analytics
1. Login as SUPER_ADMIN
2. Check admin dashboard metrics
3. View recent orders
4. Check user dashboard

### Scenario 4: Gallery Management
1. Login as authenticated user
2. View all gallery items
3. Create a new gallery item
4. Update the gallery item
5. Delete the gallery item

### Scenario 5: Notifications
1. Login as authenticated user
2. View user notifications
3. Create a notification
4. Mark notification as read
5. Delete notification

### Scenario 6: File Uploads
1. Login as authenticated user
2. Upload an image/video/document file
3. Verify upload response contains Cloudinary URL

### Scenario 7: User Profile Management
1. Login as any authenticated user
2. Call `GET /api/me` to retrieve current user details
3. Verify response contains correct user information
4. Update user profile if needed
5. Call `/api/me` again to verify changes

### Scenario 8: Public Shipment Tracking
1. Create a shipment (note the EVG code)
2. Logout or use different session (no authentication)
3. Call `GET /api/shipments/evg/{evgCode}` with the EVG code
4. Verify shipment details are returned without authentication
5. Test with invalid EVG codes to verify error handling

### Scenario 9: OTP Authentication Flow
1. Request OTP for an existing user's email
2. Check email for OTP code
3. Verify OTP with the code from email
4. Verify login is successful and token is returned
5. Test authenticated endpoints with the new token

## Notes

- All dashboard endpoints currently return empty data since no shipments/invoices exist in database
- User creation endpoint creates users with "customer" role by default
- Admin role ("SUPER_ADMIN") is required for admin dashboard access
- The API uses Bearer token authentication for protected routes
- User IDs are GUIDs (UUID format) - copy from registration/login responses