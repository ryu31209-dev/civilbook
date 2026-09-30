import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { FieldBookTable } from './components/FieldBookTable';
import { FieldBookCardView } from './components/FieldBookCardView';
import { Numpad } from './components/Numpad';
import { BMModal } from './components/BMModal';
import { BSModal } from './components/BSModal';
import { TPModal } from './components/TPModal';
import { ProjectSettingsModal } from './components/ProjectSettingsModal';
import { KakaoShareModal } from './components/KakaoShareModal';
import { SavedBooksModal } from './components/SavedBooksModal';
import { CalculatorModal } from './components/CalculatorModal';
import { Toast } from './components/Toast';
import type { ToastMessage } from './components/Toast';

import type { FocusField, FocusTarget, LevelRow, ProjectSettings } from './types/level';
import {
  getCleanInitialRows,
  DEFAULT_PROJECT_SETTINGS,
  instantFlushToStorage,
  type SavedBook,
} from './utils/storage';
import {
  formatM,
  recalculateRows,
} from './utils/calculator';
import { exportToStandardExcel, shareExcelFile, getExcelFileName } from './utils/excelExport';
import { generateShareText } from './utils/shareUtils';

export function App() {
  // 1. 프로젝트 설정 상태 (오프라인 LocalStorage 연동)
  const [settings, setSettings] = useState<ProjectSettings>(() => {
    const saved = localStorage.getItem('level_pro_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          parsed.projectName === '제2공구 우·오수관로 신설공사' ||
          (parsed.bmElevation === 100 && parsed.currentBS === 1.5)
        ) {
          return DEFAULT_PROJECT_SETTINGS;
        }
        return parsed;
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_PROJECT_SETTINGS;
  });

  // 2. 야장 행 데이터 (오프라인 LocalStorage 연동)
  const [rows, setRows] = useState<LevelRow[]>(() => {
    const saved = localStorage.getItem('level_pro_rows');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasLegacyDummy =
          Array.isArray(parsed) &&
          (parsed.length <= 2 ||
            parsed.some(
              (r: any) =>
                r.remark?.includes('관로') ||
                r.station === 'No. 11' ||
                (r.station === 'No. 0' && r.fh === 100) ||
                (r.station === 'BM.1' && r.bs === 1.5)
            ));
        if (hasLegacyDummy) {
          return getCleanInitialRows(DEFAULT_PROJECT_SETTINGS);
        }
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return getCleanInitialRows(DEFAULT_PROJECT_SETTINGS);
  });

  // 3. UI 상태 (뷰 모드: table vs card)
  const [viewMode, setViewMode] = useState<'table' | 'card'>(() => {
    return (localStorage.getItem('level_pro_view_mode') as 'table' | 'card') || 'table';
  });

  const [showFullColumns, setShowFullColumns] = useState<boolean>(false);
  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('level_pro_high_contrast') === 'true';
  });

  // 4. 텐키 포커스 및 버퍼 상태 (오프라인 복원)
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(() => {
    const saved = localStorage.getItem('level_pro_current_focus');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.rowIndex === 'number' && parsed.field) {
          return parsed;
        }
      } catch (e) {}
    }
    return { rowIndex: 1, field: 'fs' };
  });

  const [currentBuffer, setCurrentBuffer] = useState<string>(() => {
    return localStorage.getItem('level_pro_current_buffer') || '';
  });
  const [isNumpadOpen, setIsNumpadOpen] = useState<boolean>(true);

  // 5. 모달 상태
  const [isBMModalOpen, setIsBMModalOpen] = useState<boolean>(false);
  const [isBSModalOpen, setIsBSModalOpen] = useState<boolean>(false);
  const [isTPModalOpen, setIsTPModalOpen] = useState<boolean>(false);
  const [isKakaoModalOpen, setIsKakaoModalOpen] = useState<boolean>(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState<boolean>(false);
  const [isSavedBooksOpen, setIsSavedBooksOpen] = useState<boolean>(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);

  // 6. 토스트 알림 상태
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info', title?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // 7. 철통 실시간 동기 저장 (React 상태 변경 시 즉시 동기화)
  useEffect(() => {
    instantFlushToStorage(settings, rows, currentBuffer, focusTarget);
  }, [settings, rows, currentBuffer, focusTarget]);

  useEffect(() => {
    localStorage.setItem('level_pro_view_mode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('level_pro_high_contrast', String(isHighContrast));
    if (isHighContrast) {
      document.documentElement.classList.add('dark', 'high-contrast');
    } else {
      document.documentElement.classList.remove('dark', 'high-contrast');
    }
  }, [isHighContrast]);

  // 8. 전화 수신, 화면 꺼짐, 백그라운드 전환 등 모바일 라이프사이클 철통 방어
  useEffect(() => {
    const flushNow = () => {
      instantFlushToStorage(settings, rows, currentBuffer, focusTarget);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // 전화가 오거나, 화면이 꺼지거나, 홈 버튼을 눌렀을 때 0.001초 만에 즉시 보존
        flushNow();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', flushNow);
    window.addEventListener('beforeunload', flushNow);
    window.addEventListener('freeze', flushNow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', flushNow);
      window.removeEventListener('beforeunload', flushNow);
      window.removeEventListener('freeze', flushNow);
    };
  }, [settings, rows, currentBuffer, focusTarget]);

  // 9. 화면 꺼짐 방지 (Screen Wake Lock API: 측량 중 폰 화면 자동 꺼짐 방지)
  useEffect(() => {
    let wakeLockSentinel: any = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && document.visibilityState === 'visible') {
          wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        // 일부 브라우저나 저전력 모드에서는 무시
      }
    };

    requestWakeLock();

    // 화면이 다시 켜졌을 때(전화 통화 후 복귀 등) 자동으로 화면 꺼짐 방지 재가동
    const handleReactivateWakeLock = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleReactivateWakeLock);

    return () => {
      document.removeEventListener('visibilitychange', handleReactivateWakeLock);
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
      }
    };
  }, []);

  // BM 또는 BS 변경 시 기계고(IH) 자동 갱신 및 행 재계산
  const updateBSAndIH = useCallback(
    (newBS: number | null, newBM?: number | null) => {
      const bm = newBM !== undefined ? newBM : settings.bmElevation;
      const ih =
        bm !== null && newBS !== null && !isNaN(bm) && !isNaN(newBS)
          ? Number((bm + newBS).toFixed(3))
          : null;

      const nextSettings = {
        ...settings,
        bmElevation: bm,
        currentBS: newBS,
        currentIH: ih,
      };
      setSettings(nextSettings);

      setRows((prev) => {
        const updated = prev.map((r, i) => {
          if (i === 0) {
            return {
              ...r,
              bs: newBS,
              gh: bm,
            };
          }
          return r;
        });
        const recalculated = recalculateRows(updated, ih, settings.toleranceM);
        instantFlushToStorage(nextSettings, recalculated, currentBuffer, focusTarget);
        return recalculated;
      });
    },
    [settings, settings.bmElevation, settings.toleranceM, currentBuffer, focusTarget]
  );

  // 셀 선택 시 포커스 및 텐키 버퍼 설정
  const handleSelectCell = useCallback(
    (rowIndex: number, field: FocusField) => {
      setFocusTarget({ rowIndex, field });
      setIsNumpadOpen(true);

      const targetRow = rows[rowIndex];
      if (!targetRow) return;

      if (field === 'fs') {
        setCurrentBuffer(targetRow.fs !== null ? String(targetRow.fs) : '');
      } else if (field === 'fh') {
        setCurrentBuffer(targetRow.fh !== null ? String(targetRow.fh) : '');
      } else if (field === 'bs') {
        setCurrentBuffer(targetRow.bs !== null ? String(targetRow.bs) : settings.currentBS !== null ? String(settings.currentBS) : '');
      } else if (field === 'station') {
        setCurrentBuffer(targetRow.station || '');
      } else if (field === 'remark') {
        setCurrentBuffer(targetRow.remark || '');
      }
    },
    [rows, settings.currentBS]
  );

  // 대시보드 후시 카드 탭 시: 후시(BS) 입력 팝업 모달 즉시 호출 및 포커스 동기화
  const handleFocusBS = useCallback(() => {
    handleSelectCell(0, 'bs');
    setIsBSModalOpen(true);
  }, [handleSelectCell]);

  // 행에 새로운 값 반영
  const commitValueToRow = useCallback(
    (rowIndex: number, field: FocusField, rawValue: string) => {
      if (rowIndex < 0 || rowIndex >= rows.length) return;

      setRows((prevRows) => {
        const nextRows = [...prevRows];
        const currentRow = { ...nextRows[rowIndex] };

        let nextBS = settings.currentBS;
        let nextIH = settings.currentIH;

        if (field === 'fs') {
          const num = rawValue === '' ? null : parseFloat(rawValue);
          currentRow.fs = isNaN(num as number) ? null : num;
        } else if (field === 'fh') {
          const num = rawValue === '' ? null : parseFloat(rawValue);
          currentRow.fh = isNaN(num as number) ? null : num;
        } else if (field === 'bs') {
          const num = rawValue === '' ? null : parseFloat(rawValue);
          currentRow.bs = isNaN(num as number) ? null : num;
          if (rowIndex === 0) {
            nextBS = currentRow.bs;
            nextIH =
              settings.bmElevation !== null && currentRow.bs !== null && !isNaN(currentRow.bs)
                ? Number((settings.bmElevation + currentRow.bs).toFixed(3))
                : null;
            setSettings((s) => ({
              ...s,
              currentBS: nextBS,
              currentIH: nextIH,
            }));
          }
        } else if (field === 'station') {
          currentRow.station = rawValue;
        } else if (field === 'remark') {
          currentRow.remark = rawValue;
        }

        nextRows[rowIndex] = currentRow;
        const currentSettingsSnapshot =
          rowIndex === 0 && field === 'bs'
            ? { ...settings, currentBS: nextBS, currentIH: nextIH }
            : settings;
        const recalculated = recalculateRows(nextRows, currentSettingsSnapshot.currentIH, settings.toleranceM);
        instantFlushToStorage(currentSettingsSnapshot, recalculated, rawValue, { rowIndex, field });
        return recalculated;
      });
    },
    [rows.length, settings, settings.currentBS, settings.currentIH, settings.toleranceM, settings.bmElevation]
  );

  // 텐키 숫자 버튼 입력
  const handleNumpadKeyPress = useCallback(
    (key: string) => {
      if (!focusTarget) return;

      let nextBuffer = currentBuffer;

      if (key === '±') {
        if (nextBuffer.startsWith('-')) {
          nextBuffer = nextBuffer.slice(1);
        } else if (nextBuffer.length > 0) {
          nextBuffer = '-' + nextBuffer;
        }
      } else if (key === '.') {
        if (!nextBuffer.includes('.')) {
          nextBuffer = (nextBuffer || '0') + '.';
        }
      } else {
        if (nextBuffer === '0' && key !== '.') {
          nextBuffer = key;
        } else {
          nextBuffer = nextBuffer + key;
        }
      }

      setCurrentBuffer(nextBuffer);
      commitValueToRow(focusTarget.rowIndex, focusTarget.field, nextBuffer);
    },
    [focusTarget, currentBuffer, commitValueToRow]
  );

  // 텐키 백스페이스
  const handleNumpadBackspace = useCallback(() => {
    if (!focusTarget) return;
    const nextBuffer = currentBuffer.slice(0, -1);
    setCurrentBuffer(nextBuffer);
    commitValueToRow(focusTarget.rowIndex, focusTarget.field, nextBuffer);
  }, [focusTarget, currentBuffer, commitValueToRow]);

  // 텐키 클리어 (C)
  const handleNumpadClear = useCallback(() => {
    if (!focusTarget) return;
    setCurrentBuffer('');
    commitValueToRow(focusTarget.rowIndex, focusTarget.field, '');
  }, [focusTarget, commitValueToRow]);

  // 단차 오프셋 (+1cm, -1cm, +5mm, -5mm)
  const handleApplyOffset = useCallback(
    (delta: number) => {
      if (!focusTarget) return;
      const targetRow = rows[focusTarget.rowIndex];
      if (!targetRow) return;

      const currentVal =
        focusTarget.field === 'fs'
          ? targetRow.fs
          : focusTarget.field === 'fh'
          ? targetRow.fh
          : targetRow.bs;

      const baseVal = currentVal !== null && !isNaN(currentVal) ? currentVal : 0;
      const newVal = Number((baseVal + delta).toFixed(3));
      const newBuf = String(newVal);

      setCurrentBuffer(newBuf);
      commitValueToRow(focusTarget.rowIndex, focusTarget.field, newBuf);
    },
    [focusTarget, rows, commitValueToRow]
  );

  // 자주 쓰는 비고 단축키 입력
  const handleQuickRemark = useCallback(
    (remark: string) => {
      if (!focusTarget) return;
      commitValueToRow(focusTarget.rowIndex, 'remark', remark);
      showToast(`비고 '${remark}' 입력 완료`, 'info');
    },
    [focusTarget, commitValueToRow, showToast]
  );

  // 새 측점 행 추가
  const handleAddRow = useCallback(() => {
    let newIndex = 0;
    setRows((prev) => {
      newIndex = prev.length;
      const lastRow = prev[prev.length - 1];
      const defaultFH = lastRow?.fh ?? null;

      const newRow: LevelRow = {
        id: `row-${Date.now()}-${Math.random()}`,
        station: `No. ${newIndex}`,
        bs: null,
        fs: null,
        ih: settings.currentIH,
        gh: null,
        fh: defaultFH,
        diff: null,
        status: 'none',
        statusText: '-',
        remark: '',
      };

      const updated = [...prev, newRow];
      const recalculated = recalculateRows(updated, settings.currentIH, settings.toleranceM);
      instantFlushToStorage(settings, recalculated, '', { rowIndex: newIndex, field: 'fs' });
      return recalculated;
    });

    setFocusTarget({ rowIndex: newIndex, field: 'fs' });
    setCurrentBuffer('');
    setIsNumpadOpen(true);
    showToast('새 측점이 추가되었습니다.', 'success');
  }, [settings, settings.currentIH, settings.toleranceM, showToast]);

  // [다음 ⏎] 버튼: 다음 행의 '전시(FS)'로 이동 (마지막 행이면 자동 생성)
  const handleNext = useCallback(() => {
    if (!focusTarget) {
      handleSelectCell(0, 'fs');
      return;
    }

    const nextRowIndex = focusTarget.rowIndex + 1;

    if (nextRowIndex < rows.length) {
      handleSelectCell(nextRowIndex, 'fs');
    } else {
      handleAddRow();
    }
  }, [focusTarget, rows.length, handleSelectCell, handleAddRow]);

  // [이전 ↑] 버튼
  const handlePrev = useCallback(() => {
    if (!focusTarget || focusTarget.rowIndex <= 0) return;
    handleSelectCell(focusTarget.rowIndex - 1, focusTarget.field);
  }, [focusTarget, handleSelectCell]);

  // 행 삭제
  const handleDeleteRow = useCallback(
    (index: number) => {
      if (index === 0) {
        showToast('기준점(BM) 행은 삭제할 수 없습니다.', 'error');
        return;
      }
      setRows((prev) => {
        const next = prev.filter((_, i) => i !== index);
        return recalculateRows(next, settings.currentIH, settings.toleranceM);
      });
      if (focusTarget && focusTarget.rowIndex === index) {
        handleSelectCell(Math.max(0, index - 1), 'fs');
      }
      showToast('측점이 삭제되었습니다.', 'info');
    },
    [focusTarget, handleSelectCell, settings.currentIH, settings.toleranceM, showToast]
  );

  // 야장 보관함에서 야장 불러오기
  const handleLoadBook = useCallback(
    (book: SavedBook) => {
      setSettings(book.settings);
      setRows(book.rows);
      setFocusTarget({ rowIndex: Math.min(1, book.rows.length - 1), field: 'fs' });
      setCurrentBuffer('');
    },
    []
  );

  // 새 야장 만들기 (더미 없는 깨끗한 2행 야장)
  const handleNewBook = useCallback(() => {
    const today = new Date();
    const cleanSettings: ProjectSettings = {
      ...DEFAULT_PROJECT_SETTINGS,
      surveyDate: today.toISOString().split('T')[0],
      projectName: `새 현장 야장_${today.getMonth() + 1}월${today.getDate()}일`,
    };
    const cleanRows = getCleanInitialRows(cleanSettings);
    setSettings(cleanSettings);
    setRows(cleanRows);
    setFocusTarget({ rowIndex: 1, field: 'fs' });
    setCurrentBuffer('');
  }, []);

  // 기본 초기화 (더미 없는 깨끗한 새 야장으로)
  const handleResetData = useCallback(() => {
    if (window.confirm('현재 작업 중인 야장을 비우고 깨끗한 새 야장으로 초기화하시겠습니까?')) {
      handleNewBook();
      showToast('깨끗한 새 야장으로 초기화되었습니다.', 'success');
    }
  }, [handleNewBook, showToast]);

  // BM 수정 저장
  const handleSaveBM = useCallback(
    (newBM: number | null) => {
      updateBSAndIH(settings.currentBS, newBM);
      if (newBM !== null) {
        showToast(`기준 BM이 ${formatM(newBM)}m로 변경되었습니다.`, 'success');
      } else {
        showToast('기준 BM이 초기화되었습니다.', 'info');
      }
    },
    [settings.currentBS, updateBSAndIH, showToast]
  );

  // 후시(BS) 수정 저장
  const handleSaveBS = useCallback(
    (newBS: number | null) => {
      updateBSAndIH(newBS, settings.bmElevation);
      if (newBS !== null) {
        const ihStr =
          settings.bmElevation !== null
            ? ` ↳ 기계고(IH) ${formatM(settings.bmElevation + newBS)}m 세팅 완료!`
            : '';
        try {
          confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
        } catch (e) {}
        showToast(`후시(BS) ${formatM(newBS)}m 입력 완료!${ihStr}`, 'success', '후시 설정');
      } else {
        showToast('후시(BS)가 초기화되었습니다.', 'info');
      }
    },
    [settings.bmElevation, updateBSAndIH, showToast]
  );

  // TP 새 IH 세팅 적용 (기준점 BM.1 보존 및 해당 측점을 TP로 승계)
  const handleApplyTP = useCallback(
    (station: string, baseElev: number, newBS: number) => {
      const nextIH = Number((baseElev + newBS).toFixed(3));
      const nextSettings = {
        ...settings,
        currentBS: newBS,
        currentIH: nextIH,
      };
      setSettings(nextSettings);

      setRows((prev) => {
        let matched = false;
        const updated = prev.map((r) => {
          if (r.station === station) {
            matched = true;
            return {
              ...r,
              isTP: true,
              gh: baseElev,
              bs: newBS,
              remark: r.remark ? `${r.remark} (TP)` : 'TP',
            };
          }
          return r;
        });

        const targetRows = matched
          ? updated
          : updated.map((r, idx) =>
              idx === updated.length - 1
                ? { ...r, isTP: true, gh: baseElev, bs: newBS, remark: r.remark ? `${r.remark} (TP)` : 'TP' }
                : r
            );

        const recalculated = recalculateRows(targetRows, nextIH, settings.toleranceM);
        instantFlushToStorage(nextSettings, recalculated, currentBuffer, focusTarget);
        return recalculated;
      });

      try {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
      } catch (e) {}

      showToast(`TP(${station}) 이기점 승계: 새 IH ${formatM(nextIH)}m 세팅 완료!`, 'success');
    },
    [settings, currentBuffer, focusTarget, showToast]
  );

  // 표준 엑셀 다운로드 (ExcelJS 고품격 엔지니어링 서식 디자인)
  const handleExportExcel = useCallback(async () => {
    try {
      showToast('CivilBook 고품격 엑셀 보고서를 생성 중입니다...', 'info');
      await exportToStandardExcel(rows, settings);
      try {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.4 } });
      } catch (e) {}
      showToast('표준 8개 컬럼 엑셀 보고서가 다운로드되었습니다.', 'success', '엑셀 출력 완료');
    } catch (e) {
      console.error(e);
      showToast('엑셀 생성 중 오류가 발생했습니다.', 'error');
    }
  }, [rows, settings, showToast]);

  // 카카오톡 대화방으로 엑셀 야장 직행 전송
  const handleShareKakaoExcel = useCallback(async () => {
    try {
      showToast('카카오톡 대화방 선택창을 호출합니다...', 'info');
      const res = await shareExcelFile(rows, settings);
      if (res.success && res.method === 'web-share') {
        try {
          confetti({ particleCount: 45, spread: 65, origin: { y: 0.3 } });
        } catch (e) {}
        showToast('카카오톡 대화방으로 전송되었습니다.', 'success', '카카오톡 전송');
      } else if (res.method === 'download') {
        // PC 등 Web Share 미지원 환경: 카톡 앱 열기 모달 안내
        setIsKakaoModalOpen(true);
      }
    } catch (e) {
      setIsKakaoModalOpen(true);
    }
  }, [rows, settings, showToast]);

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center select-none ${
        isHighContrast ? 'bg-[#0B0F17] text-slate-100' : 'bg-[#F2F5FA] text-gray-900'
      }`}
    >
      {/* 토스트 알림 컴포넌트 */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* 모바일 화면 래퍼 (최대 너비 640px) */}
      <div className="w-full max-w-lg min-h-screen flex flex-col px-3 sm:px-4 pb-48 pt-2 gap-3.5">
        {/* 1. 상단 헤더 (CivilBook 타이틀, 카드뷰/표보기 토글, 카카오톡 엑셀 공유, 엑셀 다운로드, 야외모드, 초기화) */}
        <Header
          settings={settings}
          viewMode={viewMode}
          onToggleViewMode={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
          isHighContrast={isHighContrast}
          onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
          onExportExcel={handleExportExcel}
          onShareKakaoExcel={handleShareKakaoExcel}
          onOpenProjectModal={() => setIsProjectModalOpen(true)}
          onOpenSavedBooks={() => setIsSavedBooksOpen(true)}
          onResetData={handleResetData}
        />

        {/* 2. [A] 상단 대시보드 (50:50 좌우 분할 구조 - 후시(BS) + 기계고(IH)) */}
        <Dashboard
          settings={settings}
          onOpenBMModal={() => setIsBMModalOpen(true)}
          onOpenTPModal={() => setIsTPModalOpen(true)}
          onFocusBS={handleFocusBS}
          isBSFocused={focusTarget?.rowIndex === 0 && focusTarget?.field === 'bs'}
          isHighContrast={isHighContrast}
        />

        {/* 3. 메인 콘텐츠 (테이블 뷰 vs 카드 뷰) */}
        {viewMode === 'table' ? (
          <FieldBookTable
            rows={rows}
            showFullColumns={showFullColumns}
            onToggleFullColumns={() => setShowFullColumns(!showFullColumns)}
            onOpenCalculator={() => setIsCalculatorOpen(true)}
            focusTarget={focusTarget}
            onSelectCell={handleSelectCell}
            onAddRow={handleAddRow}
            onDeleteRow={handleDeleteRow}
            isHighContrast={isHighContrast}
          />
        ) : (
          <FieldBookCardView
            rows={rows}
            focusTarget={focusTarget}
            onSelectCell={handleSelectCell}
            onAddRow={handleAddRow}
            onDeleteRow={handleDeleteRow}
            onOpenCalculator={() => setIsCalculatorOpen(true)}
            isHighContrast={isHighContrast}
          />
        )}
      </div>

      {/* 4. [C] 하단 도킹형 대형 텐키 패드 */}
      <Numpad
        isOpen={isNumpadOpen}
        onToggleOpen={() => setIsNumpadOpen(!isNumpadOpen)}
        focusTarget={focusTarget}
        onSelectField={(field) => {
          if (focusTarget) {
            handleSelectCell(focusTarget.rowIndex, field);
          }
        }}
        currentBuffer={currentBuffer}
        onKeyPress={handleNumpadKeyPress}
        onBackspace={handleNumpadBackspace}
        onClear={handleNumpadClear}
        onNext={handleNext}
        onPrev={handlePrev}
        onApplyOffset={handleApplyOffset}
        onQuickRemark={handleQuickRemark}
        currentRow={focusTarget ? rows[focusTarget.rowIndex] || null : null}
        isHighContrast={isHighContrast}
      />

      {/* 5. 모달들 */}
      {/* BM 표고 변경 모달 */}
      <BMModal
        isOpen={isBMModalOpen}
        onClose={() => setIsBMModalOpen(false)}
        currentBM={settings.bmElevation}
        onSave={handleSaveBM}
      />

      {/* 후시(BS) 관측값 입력 모달 */}
      <BSModal
        isOpen={isBSModalOpen}
        onClose={() => setIsBSModalOpen(false)}
        currentBS={settings.currentBS}
        bmElevation={settings.bmElevation}
        onSave={handleSaveBS}
      />

      {/* TP(기계이동) 새 IH 세팅 모달 */}
      <TPModal
        isOpen={isTPModalOpen}
        onClose={() => setIsTPModalOpen(false)}
        rows={rows}
        currentIH={settings.currentIH}
        onApplyTP={handleApplyTP}
      />

      {/* 공사 정보 설정 모달 */}
      <ProjectSettingsModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        settings={settings}
        onSave={(newSettings) => {
          setSettings((prev) => ({ ...prev, ...newSettings }));
          showToast('공사 정보가 저장되었습니다.', 'success');
        }}
      />

      {/* 카카오톡 야장 전송 모달 */}
      <KakaoShareModal
        isOpen={isKakaoModalOpen}
        onClose={() => setIsKakaoModalOpen(false)}
        fileName={getExcelFileName(settings)}
        shareText={generateShareText(rows, settings)}
        settings={settings}
        onDirectShare={async () => {
          setIsKakaoModalOpen(false);
          await shareExcelFile(rows, settings);
        }}
        onDownloadExcel={handleExportExcel}
        onShowToast={showToast}
      />

      {/* 야장 보관함 (저장 / 불러오기 / 백업) 모달 */}
      <SavedBooksModal
        isOpen={isSavedBooksOpen}
        onClose={() => setIsSavedBooksOpen(false)}
        currentSettings={settings}
        currentRows={rows}
        onLoadBook={handleLoadBook}
        onNewBook={handleNewBook}
        onShowToast={showToast}
        isHighContrast={isHighContrast}
      />

      {/* 계산기 모달 */}
      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        isHighContrast={isHighContrast}
      />
    </div>
  );
}

export default App;
