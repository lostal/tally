import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

/**
 * Apple Touch Icon
 *
 * Generates a 180x180 PNG for iOS home screen.
 * Uses the same "t." branding as the favicon.
 */
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        background: '#2d2a26',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 40,
      }}
    >
      <span
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: 100,
          fontWeight: 600,
          color: '#fafaf8',
        }}
      >
        t.
      </span>
    </div>,
    {
      ...size,
    }
  );
}
