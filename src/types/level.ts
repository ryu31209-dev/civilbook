export type CutFillStatus = 'cut' | 'fill' | 'ok' | 'none';

export interface LevelRow {
  id: string;
  station: string; // 측점명 (예: "BM.1", "NO.0", "NO.1", "NO.2"...)
  bs: number | null; // 후시 (m)
  fs: number | null; // 전시 (m)
  ih: number | null; // 해당 측점의 적용 기계고 (m)
  gh: number | null; // 지반고 (m)
  fh: number | null; // 계획고 (m)
  diff: number | null; // 단차 = GH - FH (m)
  status: CutFillStatus;
  statusText: string; // 예: "깎기 -0.125", "채움 +0.080", "적합"
  remark: string; // 비고 (예: "33", "36", "관로바닥" 등)
  isTP?: boolean; // 이기점 여부
}

export type FocusField = 'fs' | 'fh' | 'bs' | 'station' | 'remark';

export interface FocusTarget {
  rowIndex: number;
  field: FocusField;
}

export interface ProjectSettings {
  projectName: string;
  surveyDate: string;
  surveyor: string;
  bmElevation: number | null; // BM 기준 표고 (기본값 없음: null)
  currentBS: number | null; // 현재 후시 (기본값 없음: null)
  currentIH: number | null; // 현재 기계고 (기본값 없음: null)
  toleranceM: number; // 허용 오차 (기본값: 0.005m = 5mm)
}
