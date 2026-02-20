import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0b1220 0%, #1d4ed8 50%, #4f46e5 100%)',
          borderRadius: 36,
        }}
      >
        <div
          style={{
            width: 126,
            height: 126,
            borderRadius: 34,
            border: '3px solid rgba(255,255,255,0.26)',
            background: 'linear-gradient(160deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              color: '#ffffff',
              fontSize: 54,
              fontWeight: 900,
              letterSpacing: '-0.06em',
              lineHeight: 1,
            }}
          >
            SGN
          </span>
        </div>
      </div>
    ),
    size
  )
}
