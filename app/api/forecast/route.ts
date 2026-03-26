import { NextResponse } from 'next/server';
import { getForecast } from '@/app/lib/noaa/storage/forecastCache';
import { locationCoordinates } from '@/app/lib/noaa/config';
import { logger } from '@/app/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat') ?? String(locationCoordinates.default[0]);
    const long = searchParams.get('long') ?? String(locationCoordinates.default[1]);

    try {
        const forecast = await getForecast(lat, long);
        return NextResponse.json(forecast);
    } catch (error) {
        logger.error("Failed to get forecast:", error);
        return NextResponse.json({ error: "Failed to get forecast" }, { status: 500 });
    }
}
