import { NextResponse } from 'next/server';

// POST /api/webhooks/supabase
export async function POST() {
  return NextResponse.json({ message: 'Not implemented' }, { status: 501 });
}
