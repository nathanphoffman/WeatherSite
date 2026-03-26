import { NextResponse } from 'next/server';
import { getForecast } from '@/app/lib/noaa/storage/forecastCache';
import { locationCoordinates } from '@/app/lib/noaa/config';
import { isValidLatitude, isValidLongitude } from '@/app/lib/noaa/types/validators';
import { logger } from '@/app/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const rawLat = searchParams.get('lat');
    const rawLong = searchParams.get('long');

    // If either coordinate is supplied but invalid, reject immediately with 400.
    // Absent params fall back to the configured default location.
    if (rawLat !== null && !isValidLatitude(rawLat)) {
        return NextResponse.json({ error: "Invalid latitude" }, { status: 400 });
    }
    if (rawLong !== null && !isValidLongitude(rawLong)) {
        return NextResponse.json({ error: "Invalid longitude" }, { status: 400 });
    }

    const latitude = rawLat ?? String(locationCoordinates.default[0]);
    const longitude = rawLong ?? String(locationCoordinates.default[1]);

    try {
        const forecast = await getForecast(latitude, longitude);
        return NextResponse.json(forecast);
    } catch (error) {
        logger.error("Failed to get forecast:", error);
        return NextResponse.json({ error: "Failed to get forecast" }, { status: 500 });
    }
}
