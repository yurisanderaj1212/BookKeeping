import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#2a9d9c',
          borderRadius: 7,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
        }}
      >
        <span style={{ color: 'white', fontWeight: 700, fontSize: 10, lineHeight: 1.1, fontFamily: 'Arial' }}>Chill</span>
        <span style={{ color: 'white', fontWeight: 700, fontSize: 8, lineHeight: 1.1, fontFamily: 'Arial' }}>Numbers</span>
      </div>
    ),
    { ...size }
  )
}
