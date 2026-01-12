import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const s = parseInt(size, 10);

  if (isNaN(s)) {
    return new Response('Invalid size', { status: 400 });
  }

  // Ensure reasonable sizes to prevent abuse if this were public, though it's just a helper
  const width = s;
  const height = s;

  return new ImageResponse(
    <div
      style={{
        fontSize: s * 0.5, // Scale font/icon size?
        background: 'white',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Helper SVG with explicit size prop if needed, or percent */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={s * 0.7}
        height={s * 0.7}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#1a1815"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 5c-0.5 4 0.5 10 0 14" />
        <path d="M10 5.5c0.2 3 -0.2 9 0 13" />
        <path d="M15 5c-0.3 4 0.3 10 0 14" />
        <path d="M20 5.5c0.1 3 -0.3 9 -0.2 13" />
        <path d="M23 6c-4 3 -12 8 -21 12" />
      </svg>
    </div>,
    {
      width,
      height,
    }
  );
}
