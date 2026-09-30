import type { FocusTarget, LevelRow, ProjectSettings } from '../types/level';

// 보관함에 저장될 단일 야장 데이터 인터페이스
export interface SavedBook {
  id: string; // book-timestamp
  name: string; // 야장/공사 이름
  savedAt: string; // 저장 일시 (표시용 문자열)
  timestamp: number; // 정렬용 타임스탬프
  stationCount: number; // 측점 수
  bmElevation: number | null; // 기준 BM
  currentIH: number | null; // 기계고
  settings: ProjectSettings;
  rows: LevelRow[];
}

export const STORAGE_KEY_CURRENT_SETTINGS = 'level_pro_settings';
export const STORAGE_KEY_CURRENT_ROWS = 'level_pro_rows';
export const STORAGE_KEY_CURRENT_BUFFER = 'level_pro_current_buffer';
export const STORAGE_KEY_CURRENT_FOCUS = 'level_pro_current_focus';
export const STORAGE_KEY_LAST_SAVED_TIME = 'level_pro_last_saved_time';
export const STORAGE_KEY_SAVED_BOOKS = 'level_pro_saved_books';

// 실시간 즉시 플러시 함수 (전화 수신, 화면 꺼짐, 백그라운드 전환 시 100% 안전 보존)
export function instantFlushToStorage(
  settings: ProjectSettings,
  rows: LevelRow[],
  currentBuffer?: string,
  focusTarget?: FocusTarget | null
): void {
  try {
    localStorage.setItem(STORAGE_KEY_CURRENT_SETTINGS, JSON.stringify(settings));
    localStorage.setItem(STORAGE_KEY_CURRENT_ROWS, JSON.stringify(rows));
    if (currentBuffer !== undefined) {
      localStorage.setItem(STORAGE_KEY_CURRENT_BUFFER, currentBuffer);
    }
    if (focusTarget !== undefined && focusTarget !== null) {
      localStorage.setItem(STORAGE_KEY_CURRENT_FOCUS, JSON.stringify(focusTarget));
    }
    localStorage.setItem(STORAGE_KEY_LAST_SAVED_TIME, String(Date.now()));
  } catch (e) {
    console.error('instantFlushToStorage failed', e);
  }
}

// 깨끗한 초기 설정값 (기본값 없는 순수 빈 상태)
export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
  projectName: '현장 수준측량 야장',
  surveyDate: new Date().toISOString().split('T')[0],
  surveyor: '측량자',
  bmElevation: null,
  currentBS: null,
  currentIH: null,
  toleranceM: 0.005,
};

// 깨끗한 초기 행 데이터 (BM 1개 + No.0~No.9 10개 = 총 11개 기본 행)
export function getCleanInitialRows(_settings = DEFAULT_PROJECT_SETTINGS): LevelRow[] {
  const now = Date.now();

  const bmRow: LevelRow = {
    id: `row-bm-${now}`,
    station: 'BM.1',
    bs: null,
    fs: null,
    ih: null,
    gh: null,
    fh: null,
    diff: null,
    status: 'none',
    statusText: '-',
    remark: '기준점(BM)',
  };

  const stationRows: LevelRow[] = Array.from({ length: 10 }, (_, i) => ({
    id: `row-no${i}-${now + i + 1}`,
    station: `No. ${i}`,
    bs: null,
    fs: null,
    ih: null,
    gh: null,
    fh: null,
    diff: null,
    status: 'none',
    statusText: '-',
    remark: '',
  }));

  return [bmRow, ...stationRows];
}

// 1. 저장된 야장 목록 가져오기
export function getSavedBooks(): SavedBook[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAVED_BOOKS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }
  } catch (e) {
    console.error('Failed to parse saved books', e);
  }
  return [];
}

// 2. 현재 야장을 보관함에 저장하기 (새 이름 또는 덮어쓰기)
export function saveCurrentBook(
  name: string,
  settings: ProjectSettings,
  rows: LevelRow[],
  existingId?: string
): SavedBook {
  const books = getSavedBooks();
  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(
    now.getDate()
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  const targetId = existingId || `book-${Date.now()}`;
  const bookName = name.trim() || settings.projectName || '이름 없는 야장';

  const newBook: SavedBook = {
    id: targetId,
    name: bookName,
    savedAt: dateStr,
    timestamp: Date.now(),
    stationCount: rows.length,
    bmElevation: settings.bmElevation,
    currentIH: settings.currentIH,
    settings: {
      ...settings,
      projectName: bookName,
    },
    rows: JSON.parse(JSON.stringify(rows)),
  };

  const filtered = books.filter((b) => b.id !== targetId);
  const updated = [newBook, ...filtered];
  localStorage.setItem(STORAGE_KEY_SAVED_BOOKS, JSON.stringify(updated));

  return newBook;
}

// 3. 야장 삭제하기
export function deleteSavedBook(id: string): void {
  const books = getSavedBooks();
  const updated = books.filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEY_SAVED_BOOKS, JSON.stringify(updated));
}

// 4. 단일 야장 불러오기
export function loadSavedBook(id: string): SavedBook | null {
  const books = getSavedBooks();
  return books.find((b) => b.id === id) || null;
}

// 5. 전체 데이터 JSON 백업 파일 생성 및 다운로드
export function exportBackupFile(): void {
  const books = getSavedBooks();
  const currentSettings = localStorage.getItem(STORAGE_KEY_CURRENT_SETTINGS);
  const currentRows = localStorage.getItem(STORAGE_KEY_CURRENT_ROWS);

  const backupData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    current: {
      settings: currentSettings ? JSON.parse(currentSettings) : DEFAULT_PROJECT_SETTINGS,
      rows: currentRows ? JSON.parse(currentRows) : [],
    },
    savedBooks: books,
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const now = new Date();
  const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  a.download = `CivilBook_수준야장백업_${timestamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 6. JSON 백업 파일에서 복원하기
export function importBackupJson(jsonString: string): { success: boolean; message: string; loadedCount?: number } {
  try {
    const data = JSON.parse(jsonString);
    if (!data.savedBooks && !data.current) {
      return { success: false, message: '유효한 CivilBook 백업 파일이 아닙니다.' };
    }

    if (Array.isArray(data.savedBooks)) {
      const existing = getSavedBooks();
      const existingIds = new Set(existing.map((b) => b.id));
      const merged = [...existing];

      for (const item of data.savedBooks) {
        if (!existingIds.has(item.id)) {
          merged.push(item);
        } else {
          // 중복 ID면 새 ID 부여
          merged.push({ ...item, id: `book-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` });
        }
      }
      localStorage.setItem(STORAGE_KEY_SAVED_BOOKS, JSON.stringify(merged));
      return { success: true, message: `${data.savedBooks.length}개의 야장을 성공적으로 보관함에 복원했습니다.`, loadedCount: data.savedBooks.length };
    }

    return { success: false, message: '백업 파일에 저장된 야장 목록이 없습니다.' };
  } catch (e) {
    return { success: false, message: '파일 형식이 올바르지 않거나 파싱에 실패했습니다.' };
  }
}
