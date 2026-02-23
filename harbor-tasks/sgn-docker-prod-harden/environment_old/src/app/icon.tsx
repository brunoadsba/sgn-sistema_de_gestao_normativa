import { ImageResponse } from 'next/og'

export const size = {
  width: 512,
  height: 512,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0b1220 0%, #1d4ed8 45%, #4f46e5 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.03) 62%, transparent 75%)',
            filter: 'blur(2px)',
          }}
        />
        <div
          style={{
            width: 332,
            height: 332,
            borderRadius: 96,
            border: '8px solid rgba(255,255,255,0.22)',
            background: 'linear-gradient(160deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 24px 70px rgba(2, 6, 23, 0.55)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              color: '#ffffff',
              fontSize: 132,
              fontWeight: 900,
              letterSpacing: '-0.07em',
              lineHeight: 1,
              textShadow: '0 8px 24px rgba(2, 6, 23, 0.4)',
            }}
          >
            SGN
          </div>
        </div>
      </div>
    ),
    size
  )
}
