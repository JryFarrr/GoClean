# GoClean - Simplified Version

> 💡 **Branch:** `simple-version`  
> 📅 **Created:** December 2025  
> 🎯 **Purpose:** Educational and simplified version of GoClean waste management system

## Overview

This is a simplified version of the GoClean project, designed to be easier to understand and maintain. It focuses on core functionality without complex features like transactions, admin dashboard, or advanced tracking.

## Key Simplifications

### 1. **User Roles** (2 roles only)
- **USER**: Regular users who request waste pickup
- **TPS**: Waste management facilities that handle pickups

❌ Removed: ADMIN role

### 2. **Pickup Status** (2 statuses only)
- **PENDING**: Waiting for TPS to complete
- **COMPLETED**: Pickup has been completed

❌ Removed: ACCEPTED, ON_THE_WAY, CANCELLED

### 3. **Database Models**
**Core Models:**
- `User` - User accounts (USER and TPS roles)
- `TPSProfile` - TPS facility details and pricing
- `WastePrice` - Waste pricing per TPS
- `PickupRequest` - Pickup/drop-off requests
- `WasteItem` - Individual waste items in a request

**GIS Models:** (for mapping features)
- `TPSLocation` - TPS location master data
- `Kecamatan`, `Kategori` - Reference data
- `ObjekPoint`, `Jalan`, `Area` - GIS layers for points, lines, and polygons

**❌ Removed Models:**
- `Transaction` - Payment/transaction tracking
- `Notification` - Push notifications
- `DriverLocation` - Real-time driver tracking

### 4. **Database Setup**
- **Local Development only**: SQL Server (DB_GoClean)
- ❌ Removed: TiDB Cloud, dual-database setup, sync scripts

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- SQL Server (local instance)
- Git

### Database Setup

1. **Create Database in SSMS:**
   ```sql
   CREATE DATABASE DB_GoClean;
   ```

2. **Configure Environment:**
   Create `.env` file:
   ```env
   # Database
   DATABASE_URL="sqlserver://localhost:1433;database=DB_GoClean;user=sa;password=YourPassword;encrypt=true;trustServerCertificate=true"
   
   # NextAuth
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Push Schema to Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Seed Demo Data:**
   ```bash
   npx prisma db seed
   ```

### Running the Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Accounts

After running the seed command, you can login with:

| Role | Email | Password |
|------|-------|----------|
| TPS 1 | tps1@goclean.id | tps123 |
| TPS 2 | tps2@goclean.id | tps123 |
| User 1 | user1@goclean.id | user123 |
| User 2 | user2@goclean.id | user123 |

## Features

### For Users (USER role)
- ✅ Register and login
- ✅ Create pickup requests (PICKUP or DROP_OFF)
- ✅ Add waste items with estimated weight
- ✅ Upload photos/videos
- ✅ View pickup history
- ✅ See pickup status (PENDING or COMPLETED)

### For TPS (TPS role)
- ✅ Register and login
- ✅ Set up TPS profile with location
- ✅ Configure waste pricing by type
- ✅ View incoming pickup requests
- ✅ Update waste actual weight and price
- ✅ Mark pickups as COMPLETED
- ✅ View pickup statistics

### GIS Features
- ✅ Interactive map with TPS locations
- ✅ Point layer: TPS facilities, drop boxes
- ✅ Line layer: Collection routes
- ✅ Polygon layer: Administrative boundaries (Kecamatan)

## Simplified Workflow

```
USER creates pickup request → Status: PENDING
                                    ↓
TPS views pending requests
                                    ↓
TPS completes pickup, enters actual weight
                                    ↓
Status: COMPLETED
```

**No intermediate steps** - simpler and easier to understand!

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQL Server (local)
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Maps**: Leaflet

## Project Structure

```
goclean/
├── prisma/
│   ├── schema.prisma          # Simplified database schema
│   └── seed.ts                # Demo data seed
├── src/
│   ├── app/
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication
│   │   │   ├── pickups/       # Pickup CRUD
│   │   │   ├── tps/           # TPS profile & pricing
│   │   │   └── user/          # User profile
│   │   ├── pickup/            # User pickup pages
│   │   └── tps/               # TPS dashboard pages
│   └── lib/
│       ├── auth.ts            # Auth configuration
│       └── prisma.ts          # Prisma client
└── public/
    └── uploads/               # Uploaded files
```

## Differences from Main Branch

| Feature | Main Branch | Simple Version |
|---------|-------------|----------------|
| User Roles | USER, TPS, ADMIN | USER, TPS |
| Pickup Status | 5 statuses | 2 statuses |
| Transactions | ✅ Full payment flow | ❌ Removed |
| Notifications | ✅ Push notifications | ❌ Removed |
| Driver Tracking | ✅ Real-time GPS | ❌ Removed |
| Admin Dashboard | ✅ Full analytics | ❌ Removed |
| Database | Dual (SQL Server + TiDB) | Single (SQL Server) |
| Deployment | Vercel + TiDB Cloud | Local only |

## Development Tips

### Adding a New Waste Type

1. Update `WastePrice` seed data in `prisma/seed.ts`
2. Add to TPS pricing form
3. Update validation in pickup form

### Modifying Schema

```bash
# After changing schema.prisma
npx prisma generate
npx prisma db push

# To reset and reseed
npx prisma db push --force-reset
npx prisma db seed
```

### Debugging Database

```bash
# Open Prisma Studio
npx prisma studio
```

## Common Issues

### Connection Error
- Verify SQL Server is running
- Check `DATABASE_URL` in `.env`
- Ensure TCP/IP is enabled in SQL Server Configuration Manager

### Schema Sync Issues
- Run `npx prisma generate` after schema changes
- Use `npx prisma db push` to sync without migrations

## Learning Resources

This simplified version is perfect for:
- 🎓 Learning Next.js and Prisma
- 📚 Understanding waste management systems
- 🗺️ Exploring GIS with Leaflet
- 🔐 Implementing authentication with NextAuth

## Future Enhancements (Optional)

If you want to add features back:
1. **Notifications**: Add back `Notification` model
2. **Analytics**: Create simple stats dashboard
3. **Email**: Send pickup confirmations
4. **Export**: Download pickup history as CSV

## Contributing

This is an educational project. Feel free to:
- Add comments to improve code clarity
- Simplify complex logic
- Add helpful documentation
- Create tutorials

## License

Same as main GoClean project

---

**Happy Learning! 🌱♻️**

For questions about the full-featured version, check the `main` branch.
