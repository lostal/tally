import { ImageResponse } from 'next/og';

/**
 * Open Graph Image Generator
 *
 * Generates a dynamic OG image for the home page.
 * Size: 1200x630 (recommended for social media)
 *
 * Note: Edge runtime is recommended for OG image generation
 * as it provides better performance for on-demand image creation.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
 */
export const runtime = 'edge';

export const alt = 'Tally. El sistema operativo para tu restaurante';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2d2a26',
        backgroundImage:
          'radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '80px',
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: '#fef7f2',
            marginBottom: 24,
            lineHeight: 1.2,
          }}
        >
          Tally.
        </h1>
        <p
          style={{
            fontSize: 40,
            fontWeight: 500,
            color: '#fef7f2',
            opacity: 0.9,
            marginBottom: 32,
            lineHeight: 1.4,
          }}
        >
          El sistema operativo para tu restaurante
        </p>
        <p
          style={{
            fontSize: 28,
            color: '#fef7f2',
            opacity: 0.7,
            maxWidth: 900,
            lineHeight: 1.5,
          }}
        >
          TPV • Comandas Digitales • Split de Cuenta • Gestión Integral
        </p>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
