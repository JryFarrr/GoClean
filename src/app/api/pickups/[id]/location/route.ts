import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/pickups/[id]/location
// Fetches the driver's current location for a specific pickup request.
export async function GET(
  req: Request,
  context: { params: { id: string } }
) {

  const session = await getServerSession(authOptions);
  // Unwrap params if it's a Promise (Next.js App Router)
  const params = context?.params && typeof context.params.then === 'function' ? await context.params : context.params;
  const pickupId = params?.id;

  if (!pickupId) {
    return NextResponse.json({ error: 'Invalid pickup id' }, { status: 400 });
  }
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify the user is the one who requested the pickup or an admin
    const pickupRequest = await prisma.pickupRequest.findUnique({
      where: { id: pickupId },
      select: { userId: true },
    });

    if (!pickupRequest) {
      return NextResponse.json({ error: 'Pickup request not found' }, { status: 404 });
    }

    if (pickupRequest.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch the latest driver location for this pickup
    const driverLocation = await prisma.driverLocation.findUnique({
      where: { pickupRequestId: pickupId },
    });

    if (!driverLocation) {
      return NextResponse.json({ error: 'Driver location not yet available.' }, { status: 404 });
    }

    return NextResponse.json(driverLocation, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch driver location:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}


// POST /api/pickups/[id]/location
// Updates the driver's location for a specific pickup request.
export async function POST(
  req: Request,
  context: { params: { id: string } }
) {

  const session = await getServerSession(authOptions);
  // Unwrap params if it's a Promise (Next.js App Router)
  const params = context?.params && typeof context.params.then === 'function' ? await context.params : context.params;
  const pickupId = params?.id;

  if (!pickupId) {
    return NextResponse.json({ error: 'Invalid pickup id' }, { status: 400 });
  }
  // 1. Authenticate the user
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Check if the user is a driver (assuming 'TPS' role is the driver)
  // You might have a dedicated 'DRIVER' role in the future.
  if (session.user.role !== 'TPS') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { latitude, longitude } = body;

    // 3. Validate input
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'Invalid latitude or longitude.' },
        { status: 400 }
      );
    }
    
    // 4. Verify the pickup request exists and is assigned to this driver
    const pickupRequest = await prisma.pickupRequest.findFirst({
        where: {
            id: pickupId,
            driverId: session.user.id,
        }
    });

    if (!pickupRequest) {
        return NextResponse.json({ error: 'Pickup request not found or not assigned to you.' }, { status: 404 });
    }

    // 5. Use a transaction to update location and pickup status
    const [updatedLocation] = await prisma.$transaction([
      prisma.driverLocation.upsert({
        where: { pickupRequestId: pickupId },
        update: {
          latitude,
          longitude,
        },
        create: {
          pickupRequestId: pickupId,
          latitude,
          longitude,
        },
      }),
      // Also update the pickup status to ON_THE_WAY
      prisma.pickupRequest.update({
        where: { id: pickupId },
        data: { status: 'ON_THE_WAY' },
      }),
    ]);

    return NextResponse.json(updatedLocation, { status: 200 });
  } catch (error) {
    console.error('Failed to update driver location:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
