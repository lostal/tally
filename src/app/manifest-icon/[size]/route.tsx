import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

/**
 * Dynamic PWA Icon Generator
 *
 * Generates PNG icons at any size for the web manifest.
 * Uses the "t." branding consistent with favicon.
 *
 * Usage: /manifest-icon/192 → 192x192 PNG
 *        /manifest-icon/512 → 512x512 PNG
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const s = parseInt(size, 10);

  if (isNaN(s) || s < 16 || s > 1024) {
    return new Response('Invalid size (16-1024)', { status: 400 });
  }

  const width = s;
  const height = s;
  const fontSize = Math.round(s * 0.55);
  const borderRadius = Math.round(s * 0.2);

  return new ImageResponse(
    <div
      style={{
        background: '#2d2a26',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius,
      }}
    >
      <span
        style={{
          fontFamily: 'Georgia, serif',
          fontSize,
          fontWeight: 600,
          color: '#fafaf8',
        }}
      >
        t.
      </span>
    </div>,
    {
      width,
      height,
    }
  );
}
