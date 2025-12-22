import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Endpoint untuk real-time data sync
// Poll endpoint ini setiap beberapa detik untuk mendapatkan update terbaru
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";
    const since = searchParams.get("since"); // ISO timestamp untuk incremental updates
    const userId = searchParams.get("userId");

    let sinceDate: Date | undefined;
    if (since) {
      sinceDate = new Date(since);
    }

    const response: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
    };

    // Get data based on type
    switch (type) {
      case "users":
        response.users = await prisma.user.findMany({
          where: sinceDate ? { updatedAt: { gte: sinceDate } } : undefined,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            phone: true,
            address: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { updatedAt: "desc" },
        });
        break;

      case "pickups":
        response.pickups = await prisma.pickupRequest.findMany({
          where: {
            ...(sinceDate && { updatedAt: { gte: sinceDate } }),
            ...(userId && { userId }),
          },
          include: {
            user: { select: { name: true, email: true, phone: true } },
            tps: { select: { name: true, email: true } },
            wasteItems: true,
          },
          orderBy: { updatedAt: "desc" },
        });
        break;

      case "transactions":
        response.transactions = await prisma.transaction.findMany({
          where: {
            ...(sinceDate && { updatedAt: { gte: sinceDate } }),
            ...(userId && { userId }),
          },
          include: {
            user: { select: { name: true, email: true } },
            pickupRequest: { select: { address: true, status: true } },
          },
          orderBy: { updatedAt: "desc" },
        });
        break;

      case "tps":
        response.tpsProfiles = await prisma.tPSProfile.findMany({
          where: sinceDate ? { updatedAt: { gte: sinceDate } } : undefined,
          include: {
            user: { select: { name: true, email: true } },
            wastePrices: true,
          },
          orderBy: { updatedAt: "desc" },
        });
        break;

      case "notifications":
        if (!userId) {
          return NextResponse.json(
            { error: "userId required for notifications" },
            { status: 400 }
          );
        }
        response.notifications = await prisma.notification.findMany({
          where: {
            userId,
            ...(sinceDate && { createdAt: { gte: sinceDate } }),
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        });
        break;

      case "stats":
        // Dashboard statistics
        const [
          totalUsers,
          totalTPS,
          totalPickups,
          pendingPickups,
          completedPickups,
          transactions,
        ] = await Promise.all([
          prisma.user.count({ where: { role: "USER" } }),
          prisma.user.count({ where: { role: "TPS" } }),
          prisma.pickupRequest.count(),
          prisma.pickupRequest.count({ where: { status: "PENDING" } }),
          prisma.pickupRequest.count({ where: { status: "COMPLETED" } }),
          prisma.transaction.aggregate({
            _sum: { totalWeight: true, totalPrice: true },
            _count: true,
          }),
        ]);

        response.stats = {
          totalUsers,
          totalTPS,
          totalPickups,
          pendingPickups,
          completedPickups,
          totalWasteCollected: transactions._sum.totalWeight || 0,
          totalRevenue: transactions._sum.totalPrice || 0,
          totalTransactions: transactions._count,
        };
        break;

      case "all":
      default:
        // Get all recent changes
        const [users, pickups, tpsData] = await Promise.all([
          prisma.user.findMany({
            where: sinceDate ? { updatedAt: { gte: sinceDate } } : undefined,
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              updatedAt: true,
            },
            orderBy: { updatedAt: "desc" },
            take: 50,
          }),
          prisma.pickupRequest.findMany({
            where: sinceDate ? { updatedAt: { gte: sinceDate } } : undefined,
            include: {
              user: { select: { name: true } },
              wasteItems: true,
            },
            orderBy: { updatedAt: "desc" },
            take: 50,
          }),
          prisma.tPSProfile.findMany({
            where: sinceDate ? { updatedAt: { gte: sinceDate } } : undefined,
            include: { user: { select: { name: true } } },
            orderBy: { updatedAt: "desc" },
            take: 20,
          }),
        ]);

        response.users = users;
        response.pickups = pickups;
        response.tpsProfiles = tpsData;
        break;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Realtime sync error:", error);
    return NextResponse.json(
      { error: "Failed to fetch realtime data" },
      { status: 500 }
    );
  }
}
