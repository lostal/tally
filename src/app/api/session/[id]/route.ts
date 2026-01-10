import { NextResponse } from 'next/server';

// GET /api/session/[id]
export async function GET() {
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 });
}
