import React from 'react';
import {
  ChevronDown,
  ChevronUp,
  Delete,
  CornerDownLeft,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { FocusField, FocusTarget, LevelRow } from '../types/level';

interface NumpadProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  focusTarget: FocusTarget | null;
  onSelectField: (field: FocusField) => void;
  currentBuffer: string;
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onNext: () => void;
  onPrev: () => void;
  onApplyOffset: (delta: number) => void;
  onQuickRemark: (remark: string) => void;
  currentRow: LevelRow | null;
  isHighContrast: boolean;
}

export const Numpad: React.FC<NumpadProps> = ({
  isOpen,
  onToggleOpen,
  focusTarget,
  onSelectField,
  currentBuffer,
  onKeyPress,
  onBackspace,
  onClear,
  onNext,
  onPrev,
  onApplyOffset,
  onQuickRemark,
  currentRow,
  isHighContrast,
}) => {
  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch (e) {
        // ignore
      }
    }
  };

  const handleKeyClick = (key: string) => {
    triggerHaptic();
    onKeyPress(key);
  };

  const handleBackspace = () => {
    triggerHaptic();
    onBackspace();
  };

  const handleClear = () => {
    triggerHaptic();
    onClear();
  };

  const handleNext = () => {
    triggerHaptic();
    onNext();
  };

  const handlePrev = () => {
    triggerHaptic();
    onPrev();
  };

  const handleOffset = (delta: number) => {
    triggerHaptic();
    onApplyOffset(delta);
  };

  const handleRemark = (rmk: string) => {
    triggerHaptic();
    onQuickRemark(rmk);
  };

  const getFocusLabel = () => {
    if (!focusTarget) return '측점을 선택하세요';
    const fieldNames: Record<FocusField, string> = {
      fs: '전시 (FS)',
      fh: '계획고 (FH)',
      bs: '후시 (BS)',
      station: '측점명',
      remark: '비고',
    };
    const rowName = currentRow ? currentRow.station : `측점 ${focusTarget.rowIndex + 1}`;
    return `${rowName} • ${fieldNames[focusTarget.field] || focusTarget.field}`;
  };

  const numBtnClass = isHighContrast
    ? 'h-11 sm:h-13 rounded-xl sm:rounded-2xl bg-[#161B26] border border-[#2A3447] shadow-sm text-lg sm:text-xl font-bold font-mono text-white active:bg-[#1E2536] active:scale-95 transition-all flex items-center justify-center'
    : 'h-11 sm:h-13 rounded-xl sm:rounded-2xl bg-white border border-[#E8ECF2] shadow-sm text-lg sm:text-xl font-bold font-mono text-gray-900 active:bg-gray-100 active:scale-95 transition-all flex items-center justify-center';

  const actionBtnClass = isHighContrast
    ? 'h-11 sm:h-13 rounded-xl sm:rounded-2xl bg-[#1E2536] text-slate-200 border border-[#2D374D] shadow-sm text-sm sm:text-base font-bold active:bg-[#252E42] active:scale-95 transition-all flex items-center justify-center'
    : 'h-11 sm:h-13 rounded-xl sm:rounded-2xl bg-gray-100 text-gray-700 border border-transparent shadow-sm text-sm sm:text-base font-bold active:bg-gray-200 active:scale-95 transition-all flex items-center justify-center';

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto transition-transform duration-300 ease-out select-none shadow-tds-numpad rounded-t-2xl sm:rounded-t-3xl border-t border-x ${
        isHighContrast
          ? 'bg-[#0D1117] border-[#2A3447] text-white'
          : 'bg-white/98 backdrop-blur-md border-[#E8ECF2] text-gray-900'
      } ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-46px)]'}`}
    >
      {/* 1. 텐키 헤더 바 */}
      <div
        onClick={onToggleOpen}
        className={`px-3 sm:px-4 py-1.5 sm:py-2 flex flex-col justify-center cursor-pointer border-b transition-colors rounded-t-2xl sm:rounded-t-3xl ${
          isHighContrast
            ? 'border-[#242C3D] bg-[#161B26] hover:bg-[#1E2536]'
            : 'border-gray-100 bg-gray-50/80 hover:bg-gray-100/80'
        }`}
      >
        {/* 드래그 핸들 */}
        <div className="w-8 h-1 rounded-full bg-gray-300 dark:bg-gray-600 mb-1 mx-auto" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${
                focusTarget ? 'bg-[#0064FF] animate-pulse' : 'bg-gray-300'
              }`}
            />
            <span
              className={`text-xs font-bold tracking-tight truncate ${
                isHighContrast ? 'text-white' : 'text-gray-700'
              }`}
            >
              {getFocusLabel()}
            </span>
          </div>

          {/* 현재 입력 버퍼 실시간 프리뷰 */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div
              className={`flex items-baseline gap-1 font-mono font-bold text-base sm:text-lg ${
                isHighContrast ? 'text-cyan-300' : 'text-[#0064FF]'
              }`}
            >
              <span>{currentBuffer || '-'}</span>
              {currentBuffer && (
                <span className={`text-[10px] sm:text-xs ${isHighContrast ? 'text-gray-400' : 'text-gray-400'}`}>m</span>
              )}
            </div>
            <button
              type="button"
              className="p-0.5 rounded-full text-gray-400 hover:text-gray-200"
              title={isOpen ? '키패드 접기' : '키패드 펼치기'}
            >
              {isOpen ? <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 펼쳐졌을 때 컨트롤들 */}
      {isOpen && (
        <div className="p-2 sm:p-3 pt-1.5 sm:pt-2 flex flex-col gap-1.5 sm:gap-2 pb-safe">
          {/* 2. 텐키 상단 탭: [측점 N] + [필드 탭] + [< >] 이동 버튼 */}
          <div
            className={`flex items-center justify-between gap-1 p-0.5 sm:p-1 rounded-xl sm:rounded-2xl ${
              isHighContrast ? 'bg-[#161B26] border border-[#242C3D]' : 'bg-gray-100/90'
            }`}
          >
            {/* 좌측 측점 배지 */}
            <div className="px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-[#0064FF] text-white font-bold text-[11px] sm:text-xs shrink-0 truncate max-w-[70px] sm:max-w-[85px]">
              {currentRow?.station || `측점 ${(focusTarget?.rowIndex ?? 0) + 1}`}
            </div>

            {/* 중간 필드 탭들 */}
            <div className="flex items-center gap-0.5 sm:gap-1 flex-1 justify-center min-w-0">
              <button
                type="button"
                onClick={() => onSelectField('fs')}
                className={`py-0.5 sm:py-1 px-1.5 sm:px-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                  focusTarget?.field === 'fs'
                    ? isHighContrast
                      ? 'bg-[#1E2536] text-[#38BDF8] shadow-sm border border-blue-500/40'
                      : 'bg-white text-[#0064FF] shadow-sm'
                    : isHighContrast
                    ? 'text-slate-400 hover:text-white'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                전시 (FS)
              </button>
              <button
                type="button"
                onClick={() => onSelectField('bs')}
                className={`py-0.5 sm:py-1 px-1.5 sm:px-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                  focusTarget?.field === 'bs'
                    ? isHighContrast
                      ? 'bg-[#1E2536] text-[#C084FC] shadow-sm border border-purple-500/40'
                      : 'bg-white text-[#7C3AED] shadow-sm'
                    : isHighContrast
                    ? 'text-slate-400 hover:text-white'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                후시 (BS)
              </button>
              <button
                type="button"
                onClick={() => onSelectField('fh')}
                className={`py-0.5 sm:py-1 px-1.5 sm:px-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                  focusTarget?.field === 'fh'
                    ? isHighContrast
                      ? 'bg-[#1E2536] text-[#34D399] shadow-sm border border-emerald-500/40'
                      : 'bg-white text-[#059669] shadow-sm'
                    : isHighContrast
                    ? 'text-slate-400 hover:text-white'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                계획고 (FH)
              </button>
            </div>

            {/* 우측 이전/다음 측점 탐색 화살표 */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                onClick={handlePrev}
                title="이전 측점"
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl border shadow-xs flex items-center justify-center active:scale-95 transition-all ${
                  isHighContrast
                    ? 'bg-[#1E2536] border-[#2D374D] text-slate-200 hover:bg-[#252E42]'
                    : 'bg-white border-gray-200/80 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                title="다음 측점"
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl border shadow-xs flex items-center justify-center active:scale-95 transition-all ${
                  isHighContrast
                    ? 'bg-[#1E2536] border-[#2D374D] text-slate-200 hover:bg-[#252E42]'
                    : 'bg-white border-gray-200/80 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* 3. 단축 칩 바 */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs select-none touch-pan-x">
            <span
              className={`text-[10px] font-bold shrink-0 ${
                isHighContrast ? 'text-slate-400' : 'text-gray-400'
              }`}
            >
              단차:
            </span>
            <button
              type="button"
              onClick={() => handleOffset(0.010)}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl font-bold font-mono text-[11px] sm:text-xs shrink-0 active:scale-95 transition-transform ${
                isHighContrast
                  ? 'bg-[#161B26] text-[#38BDF8] border border-blue-900/50 hover:bg-[#1E2536]'
                  : 'bg-[#EBF3FF] text-[#0064FF]'
              }`}
            >
              +1cm
            </button>
            <button
              type="button"
              onClick={() => handleOffset(-0.010)}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl font-bold font-mono text-[11px] sm:text-xs shrink-0 active:scale-95 transition-transform ${
                isHighContrast
                  ? 'bg-[#161B26] text-[#38BDF8] border border-blue-900/50 hover:bg-[#1E2536]'
                  : 'bg-[#EBF3FF] text-[#0064FF]'
              }`}
            >
              -1cm
            </button>
            <button
              type="button"
              onClick={() => handleOffset(0.005)}
              className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg sm:rounded-xl font-bold font-mono text-[11px] sm:text-xs shrink-0 active:scale-95 transition-transform ${
                isHighContrast
                  ? 'bg-[#161B26] text-slate-300 border border-[#2D374D] hover:bg-[#1E2536]'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              +5mm
            </button>
            <button
              type="button"
              onClick={() => handleOffset(-0.005)}
              className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg sm:rounded-xl font-bold font-mono text-[11px] sm:text-xs shrink-0 active:scale-95 transition-transform ${
                isHighContrast
                  ? 'bg-[#161B26] text-slate-300 border border-[#2D374D] hover:bg-[#1E2536]'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              -5mm
            </button>

            <span
              className={`text-[10px] font-bold shrink-0 ml-1 ${
                isHighContrast ? 'text-slate-400' : 'text-gray-400'
              }`}
            >
              비고:
            </span>
            {['기점', '종점', '원지반', '터파기', '기초', '관로', '맨홀', '경계', '포장', '구조물'].map((rmk) => (
              <button
                key={rmk}
                type="button"
                onClick={() => handleRemark(rmk)}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl font-semibold text-[11px] sm:text-xs shrink-0 active:scale-95 transition-transform ${
                  isHighContrast
                    ? 'bg-[#161B26] text-indigo-300 border border-indigo-900/50 hover:bg-[#1E2536]'
                    : 'bg-purple-50 text-[#4F46E5] hover:bg-purple-100'
                }`}
              >
                {rmk}
              </button>
            ))}
          </div>

          {/* 4. 대형 텐키 패드 그리드 (4x4) */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 pt-0.5 sm:pt-1">
            <button type="button" onClick={() => handleKeyClick('7')} className={numBtnClass}>
              7
            </button>
            <button type="button" onClick={() => handleKeyClick('8')} className={numBtnClass}>
              8
            </button>
            <button type="button" onClick={() => handleKeyClick('9')} className={numBtnClass}>
              9
            </button>
            <button type="button" onClick={handleBackspace} className={actionBtnClass}>
              <Delete className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button type="button" onClick={() => handleKeyClick('4')} className={numBtnClass}>
              4
            </button>
            <button type="button" onClick={() => handleKeyClick('5')} className={numBtnClass}>
              5
            </button>
            <button type="button" onClick={() => handleKeyClick('6')} className={numBtnClass}>
              6
            </button>
            <button type="button" onClick={handleClear} className={actionBtnClass}>
              C
            </button>

            <button type="button" onClick={() => handleKeyClick('1')} className={numBtnClass}>
              1
            </button>
            <button type="button" onClick={() => handleKeyClick('2')} className={numBtnClass}>
              2
            </button>
            <button type="button" onClick={() => handleKeyClick('3')} className={numBtnClass}>
              3
            </button>
            <button
              type="button"
              onClick={handlePrev}
              title="이전 행으로 이동"
              className={`${actionBtnClass} gap-0.5 sm:gap-1`}
            >
              <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-[11px] sm:text-xs">이전</span>
            </button>

            <button type="button" onClick={() => handleKeyClick('0')} className={numBtnClass}>
              0
            </button>
            <button type="button" onClick={() => handleKeyClick('.')} className={numBtnClass}>
              .
            </button>
            <button type="button" onClick={() => handleKeyClick('±')} className={actionBtnClass}>
              ±
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="h-11 sm:h-13 rounded-xl sm:rounded-2xl bg-[#0064FF] hover:bg-[#0052D4] text-white shadow-md shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-1 font-bold text-xs sm:text-sm"
            >
              <span>다음</span>
              <CornerDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
