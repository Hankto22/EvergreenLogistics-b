# Evergreen Logistics API - Postman Testing Guide

## ✅ Server Status: RUNNING

**Great news!** The server is now running successfully on `http://localhost:4545`

## Setup Instructions

1. **Import the Collection**:
   - Open Postman
   - Click "Import" button
   - Select "File" tab
   - Choose `Evergreen_Logistics_API.postman_collection.json`
   - Click "Import"

2. **Configure Environment Variables**:
   - The collection uses these variables:
     - `baseUrl`: `http://localhost:4545` ✅ (server confirmed running)
     - `authToken`: Automatically set after login
     - `userId`: Set this manually after creating a user (for testing individual user operations)

3. **Create Environment in Postman** (Optional):
   - Click "Environments" in left sidebar
   - Click "Create Environment"
   - Name it "Evergreen Logistics"
   - Add variables: `baseUrl`, `authToken`, `userId`
   - Set initial values as needed

4. **Start Testing**:
   - Begin with the "Health Check" endpoint to verify connectivity
   - Then proceed with user registration and login

## Complete API Endpoints

### Authentication Endpoints
- `POST /api/register` - Register new user (admin/staff/client)
- `POST /api/login` - User login with JWT token
- `POST /api/create-user` - Create additional users (admin only)

### User Management Endpoints (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user details
- `DELETE /api/users/:id` - Delete user

### Shipment Management Endpoints
- `GET /api/shipments` - Get all shipments
- `GET /api/shipments/:id` - Get shipment by ID
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

## Troubleshooting

1. **Server Not Running**: Make sure `pnpm run dev` is executed and server starts on port 4545
2. **Database Connection**: Ensure SQL Server is running and database is created
3. **Authentication Errors**: Check that JWT token is set in `authToken` variable
4. **CORS Issues**: API includes CORS middleware for cross-origin requests

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

## Notes

- All dashboard endpoints currently return empty data since no shipments/invoices exist in database
- User creation endpoint creates users with "customer" role by default
- Admin role ("SUPER_ADMIN") is required for admin dashboard access
- The API uses Bearer token authentication for protected routes
- User IDs are GUIDs (UUID format) - copy from registration/login responses