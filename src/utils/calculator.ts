import type { CutFillStatus, LevelRow } from '../types/level';

export const TOLERANCE = 0.005; // 5mm

/**
 * 소수점 3자리(밀리미터 단위)로 안전하게 포맷팅
 */
export function formatM(val: number | null | undefined, placeholder: string = '-'): string {
  if (val === null || val === undefined || isNaN(val)) return placeholder;
  return val.toFixed(3);
}

/**
 * 지반고, 계획고를 바탕으로 단차 및 절성토 상태 계산
 */
export function evaluateCutFill(gh: number | null, fh: number | null, tolerance: number = TOLERANCE): {
  diff: number | null;
  status: CutFillStatus;
  statusText: string;
} {
  if (gh === null || fh === null || isNaN(gh) || isNaN(fh)) {
    return { diff: null, status: 'none', statusText: '-' };
  }

  const diff = Number((gh - fh).toFixed(3));
  const absDiff = Math.abs(diff);

  if (absDiff <= tolerance) {
    return {
      diff,
      status: 'ok',
      statusText: '적합 (0.000)',
    };
  }

  if (diff > tolerance) {
    return {
      diff,
      status: 'cut',
      statusText: `깎기 -${absDiff.toFixed(3)}`,
    };
  } else {
    return {
      diff,
      status: 'fill',
      statusText: `채움 +${absDiff.toFixed(3)}`,
    };
  }
}

/**
 * 전체 행 데이터 재계산
 */
export function recalculateRows(
  rows: LevelRow[],
  currentIH: number | null,
  tolerance: number = TOLERANCE
): LevelRow[] {
  let activeIH = currentIH;

  return rows.map((row, index) => {
    // 1. 기준점 BM 행 (index === 0)
    if (index === 0) {
      if (row.gh !== null && !isNaN(row.gh) && row.bs !== null && !isNaN(row.bs)) {
        activeIH = Number((row.gh + row.bs).toFixed(3));
      } else if (currentIH !== null && !isNaN(currentIH)) {
        activeIH = currentIH;
      }

      const { diff, status, statusText } = evaluateCutFill(row.gh, row.fh, tolerance);

      return {
        ...row,
        ih: activeIH,
        diff,
        status,
        statusText,
      };
    }

    // 2. 일반 측점 및 TP 이기점 행 (index > 0)
    let computedGH: number | null = null;
    if (row.fs !== null && row.fs !== undefined && !isNaN(row.fs)) {
      if (activeIH !== null && !isNaN(activeIH)) {
        computedGH = Number((activeIH - row.fs).toFixed(3));
      }
    } else if (row.isTP && row.gh !== null && !isNaN(row.gh)) {
      computedGH = row.gh;
    }

    const rowAppliedIH = activeIH;

    // 만약 이 행에 후시(BS)가 입력되어 있다면 (TP 등 기계이동 지점) -> 새 기계고(IH) 갱신
    if (row.bs !== null && row.bs !== undefined && !isNaN(row.bs)) {
      const baseForNewIH = computedGH ?? row.gh;
      if (baseForNewIH !== null && !isNaN(baseForNewIH)) {
        activeIH = Number((baseForNewIH + row.bs).toFixed(3));
      }
    }

    const { diff, status, statusText } = evaluateCutFill(computedGH, row.fh, tolerance);

    return {
      ...row,
      ih: rowAppliedIH ?? activeIH,
      gh: computedGH,
      diff,
      status,
      statusText,
    };
  });
}

/**
 * 폐합오차 검산 계산
 */
export interface ClosureErrorResult {
  sumBS: number;
  sumFS: number;
  diffBSFS: number;
  startGH: number | null;
  endGH: number | null;
  diffGH: number | null;
  closureErrorM: number | null;
  closureErrorMM: number | null;
  isClosed: boolean;
  message: string;
}

export function calculateClosureError(rows: LevelRow[], currentBS: number | null): ClosureErrorResult {
  let sumBS = 0;
  let sumFS = 0;

  let startGH: number | null = null;
  let endGH: number | null = null;

  rows.forEach((row, i) => {
    const rowBS = i === 0 ? (row.bs ?? currentBS) : row.bs;
    if (rowBS !== null && rowBS !== undefined && !isNaN(rowBS)) {
      sumBS += rowBS;
    }
    if (row.fs !== null && row.fs !== undefined && !isNaN(row.fs)) {
      sumFS += row.fs;
    }
    if (row.gh !== null && row.gh !== undefined && !isNaN(row.gh)) {
      if (startGH === null) startGH = row.gh;
      endGH = row.gh;
    }
  });

  const diffBSFS = Number((sumBS - sumFS).toFixed(4));
  let diffGH: number | null = null;
  let closureErrorM: number | null = null;
  let closureErrorMM: number | null = null;
  let isClosed = false;
  let message = '';

  if (startGH !== null && endGH !== null && (sumBS > 0 || sumFS > 0)) {
    diffGH = Number((endGH - startGH).toFixed(4));
    closureErrorM = Number((diffBSFS - diffGH).toFixed(4));
    closureErrorMM = Math.round(closureErrorM * 1000);

    if (Math.abs(closureErrorMM) <= 5) {
      isClosed = true;
      message = `정밀도 매우 양호 (오차: ${closureErrorMM >= 0 ? '+' : ''}${closureErrorMM}mm)`;
    } else if (Math.abs(closureErrorMM) <= 15) {
      isClosed = true;
      message = `일반 공사 허용치 만족 (오차: ${closureErrorMM >= 0 ? '+' : ''}${closureErrorMM}mm)`;
    } else {
      isClosed = false;
      message = `허용치 초과 주의 (오차: ${closureErrorMM >= 0 ? '+' : ''}${closureErrorMM}mm, 재측량 권장)`;
    }
  } else {
    message = '측정 데이터가 부족하여 검산을 완료할 수 없습니다.';
  }

  return {
    sumBS: Number(sumBS.toFixed(3)),
    sumFS: Number(sumFS.toFixed(3)),
    diffBSFS: Number(diffBSFS.toFixed(3)),
    startGH,
    endGH,
    diffGH,
    closureErrorM,
    closureErrorMM,
    isClosed,
    message,
  };
}
