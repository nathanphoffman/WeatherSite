import { NextResponse } from 'next/server';
import { getForecast } from '@/app/lib/noaa/storage/forecastCache';
import { locationCoordinates } from '@/app/lib/noaa/config';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat') ?? String(locationCoordinates.default[0]);
    const long = searchParams.get('lon') ?? String(locationCoordinates.default[1]);

    const forecast = await getForecast(lat, long);
    return NextResponse.json(forecast);
}
