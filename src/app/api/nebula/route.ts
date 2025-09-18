// src/app/api/nebula/route.ts
import { NextResponse } from 'next/server';

const NEBULA_URL = 'https://api.thirdweb.com/ai/chat';
const SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(NEBULA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-secret-key': SECRET_KEY || '',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Nebula API route is active ✅' });
}
