import { NextResponse } from 'next/server';
import { getAllCities } from "@/app/utils/cityParser";

export async function GET() {
    const allCities = await getAllCities();
    return NextResponse.json({ allCities });
}
