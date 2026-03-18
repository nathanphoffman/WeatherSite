import { NextResponse } from 'next/server';
import { getForecast } from '@/app/api/noaa/storage/main';
import { latLon } from '@/app/api/noaa/config';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const source = (searchParams.get('source') as 'scraper' | 'api') ?? 'scraper';
    
    const lat = searchParams.get('lat') ?? String(latLon.default[0]);
    const lon = searchParams.get('lon') ?? String(latLon.default[1]);

    const forecast = await getForecast(lat, lon, source);
    return NextResponse.json(forecast);
}
