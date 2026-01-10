import { NextResponse } from 'next/server';

// POST /api/session/[id]/validate
export async function POST() {
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 });
}
