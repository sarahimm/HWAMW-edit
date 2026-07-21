import { NextRequest, NextResponse } from "next/server";
import { getWindowConfig } from "@/lib/windows";
import { WindowConfig } from "@/lib/windows";

export async function POST(req: NextRequest) {
    const {windowIds} = await req.json();
    const windowConfigs: Record<string, WindowConfig | null> = {};

    for (const windowId of windowIds) {
        windowConfigs[windowId] = getWindowConfig(windowId);
    }

    return NextResponse.json(windowConfigs, {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}