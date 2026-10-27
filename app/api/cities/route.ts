import { NextResponse } from 'next/server';
import { getAllCities } from "@/app/utils/cityParser";
import { logger } from "@/app/lib/logger";

export async function GET() {
    try {
        const allCities = await getAllCities();

        return NextResponse.json({ allCities });
    } catch (error) {
        logger.error("Failed to get cities:", error);

        return NextResponse.json({ error: "City list unavailable" }, { status: 500 });
    }
}
