import type { LevelRow, ProjectSettings } from '../types/level';
import { formatM } from './calculator';

/**
 * 현장 실무 카카오톡/문자 보고용 최적화 텍스트 생성
 */
export function generateShareText(rows: LevelRow[], settings: ProjectSettings): string {
  const totalCount = rows.length;
  const cutRows = rows.filter(r => r.status === 'cut');
  const fillRows = rows.filter(r => r.status === 'fill');
  const okRows = rows.filter(r => r.status === 'ok');

  // 최대 깎기/채움 단차 계산
  let maxCutDiff: number = 0;
  let maxCutStation = '';
  let hasCut = false;

  let maxFillDiff: number = 0;
  let maxFillStation = '';
  let hasFill = false;

  rows.forEach(r => {
    if (r.diff !== null && r.diff !== undefined) {
      if (r.diff > 0) {
        if (!hasCut || r.diff > maxCutDiff) {
          maxCutDiff = r.diff;
          maxCutStation = r.station;
          hasCut = true;
        }
      } else if (r.diff < 0) {
        const abs = Math.abs(r.diff);
        if (!hasFill || abs > maxFillDiff) {
          maxFillDiff = abs;
          maxFillStation = r.station;
          hasFill = true;
        }
      }
    }
  });

  const divider = '━━━━━━━━━━━━━━━━━━━━';

  let text = `[CivilBook 현장 수준측량 야장 보고]\n`;
  text += `${divider}\n`;
  text += `📍 공사명: ${settings.projectName}\n`;
  text += `📅 일시: ${settings.surveyDate} | 측량자: ${settings.surveyor}\n`;
  text += `🎯 기준BM: ${formatM(settings.bmElevation)}m (BS: ${formatM(settings.currentBS)}m)\n`;
  text += `📐 기계고(IH): ${formatM(settings.currentIH)}m\n`;
  text += `${divider}\n`;
  text += `📊 검측 요약:\n`;
  text += `• 총 측점: ${totalCount}개소 (적합: ${okRows.length} / 깎기: ${cutRows.length} / 채움: ${fillRows.length})\n`;

  if (hasCut) {
    text += `• 최대 깎기(터파기): -${maxCutDiff.toFixed(3)}m (${maxCutStation})\n`;
  }
  if (hasFill) {
    text += `• 최대 채움(성토): +${maxFillDiff.toFixed(3)}m (${maxFillStation})\n`;
  }

  text += `${divider}\n`;
  text += `📋 측점별 측정 결과 (지반고 GH | 판정):\n`;

  rows.forEach(r => {
    const ghStr = formatM(r.gh);
    const markStr = r.remark ? ` [${r.remark}]` : '';
    text += `• ${r.station}: GH ${ghStr}m ➔ ${r.statusText}${markStr}\n`;
  });

  text += `${divider}\n`;
  text += `※ CivilBook 모바일 수준야장 Pro 자동생성`;

  return text;
}

/**
 * Web Share API 또는 클립보드 복사 실행
 */
export async function shareOrCopy(
  title: string,
  text: string
): Promise<{ success: boolean; method: 'share' | 'clipboard' }> {
  if (navigator.share && navigator.canShare && navigator.canShare({ title, text })) {
    try {
      await navigator.share({
        title,
        text,
      });
      return { success: true, method: 'share' };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return { success: false, method: 'share' };
      }
    }
  }

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return { success: true, method: 'clipboard' };
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return { success: successful, method: 'clipboard' };
    }
  } catch (e) {
    console.error('클립보드 복사 실패:', e);
    return { success: false, method: 'clipboard' };
  }
}
