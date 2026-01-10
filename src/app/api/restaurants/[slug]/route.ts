import { NextResponse } from 'next/server';

// GET /api/restaurants/[slug]
export async function GET() {
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 });
}
