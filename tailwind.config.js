/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          light: '#F2F5FA',
          dark: '#0F172A',
        },
        card: {
          border: '#E8ECF2',
          borderDark: '#1E293B',
        },
        toss: {
          blue: '#0064FF',        // 스크린샷의 쨍하고 선명한 카카오뱅크 로열 블루
          blueHover: '#0052D9',
          blueLight: '#EBF3FF',   // '1차 전액지원' 뱃지 배경
          purple: '#4F46E5',      // '신규 가입비 N/1' 뱃지의 딥 바이올렛
          purpleLight: '#EEF2FF',
          cherry: '#FF1744',      // '카카오톡 공유' 및 '미납 총액'의 핫체리 레드
          cherryHover: '#E0103A',
          cherryLight: '#FFF0F3', // '2명 미납' 뱃지 배경
          amber: '#FFA000',       // '체크인 시작' 골드 앰버
          amberLight: '#FFF9E6',
          dark: '#111827',        // 대형 수치의 깊고 단단한 제트 블랙
          gray: '#374151',
          lightGray: '#6B7280',
          subtle: '#E5E8EB',
        }
      },
      boxShadow: {
        'tds': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'tds-elevated': '0 12px 32px -4px rgba(0, 100, 255, 0.09), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'tds-numpad': '0 -8px 24px -4px rgba(0, 0, 0, 0.06)',
      },
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'SFMono-Regular',
          'Consolas',
          'monospace',
        ],
      },
      borderRadius: {
        '2.5xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
