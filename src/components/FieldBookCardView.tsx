import React from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';
import type { FocusTarget, LevelRow } from '../types/level';
import { formatM } from '../utils/calculator';

interface FieldBookCardViewProps {
  rows: LevelRow[];
  focusTarget: FocusTarget | null;
  onSelectCell: (rowIndex: number, field: 'fs' | 'fh' | 'bs' | 'station' | 'remark') => void;
  onAddRow: () => void;
  onDeleteRow: (index: number) => void;
  onOpenCalculator?: () => void;
  isHighContrast: boolean;
}

export const FieldBookCardView: React.FC<FieldBookCardViewProps> = ({
  rows,
  focusTarget,
  onSelectCell,
  onAddRow,
  onDeleteRow,
  onOpenCalculator,
  isHighContrast,
}) => {
  // 참조 이미지 2번과 100% 동일한 캡슐형 절·성토 배지 색상
  const renderCutFillBadge = (row: LevelRow) => {
    if (row.status === 'none' || row.diff === null) {
      return (
        <span
          className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full ${
            isHighContrast ? 'bg-zinc-800 text-gray-400' : 'bg-gray-100 text-gray-400'
          }`}
        >
          -
        </span>
      );
    }

    if (row.status === 'ok') {
      return (
        <span
          className={`inline-flex items-center justify-center px-3 py-0.5 rounded-full text-xs font-black font-mono tracking-tight ${
            isHighContrast
              ? 'bg-emerald-400 text-black border border-emerald-500 font-extrabold'
              : 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]'
          }`}
        >
          적합
        </span>
      );
    }

    if (row.status === 'cut') {
      return (
        <span
          className={`inline-flex items-center justify-center px-3 py-0.5 rounded-full text-xs font-black font-mono tracking-tight whitespace-nowrap ${
            isHighContrast
              ? 'bg-blue-400 text-black border border-blue-500 font-extrabold'
              : 'bg-[#DBEAFE] text-[#1D4ED8] border border-[#93C5FD]'
          }`}
        >
          {row.statusText}
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center justify-center px-3 py-0.5 rounded-full text-xs font-black font-mono tracking-tight whitespace-nowrap ${
          isHighContrast
            ? 'bg-rose-400 text-black border border-rose-500 font-extrabold'
            : 'bg-[#FFE4E6] text-[#BE123C] border border-[#FDA4AF]'
        }`}
      >
        {row.statusText}
      </span>
    );
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* 1. 상단 컨트롤 바 */}
      <div
        className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border flex items-center justify-between shadow-xs ${
          isHighContrast
            ? 'bg-zinc-900 border-zinc-800 text-white'
            : 'bg-white border-[#E8ECF2]'
        }`}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span
            className={`text-xs font-bold flex items-center gap-1 whitespace-nowrap shrink-0 ${
              isHighContrast ? 'text-white' : 'text-gray-800'
            }`}
          >
            측점 목록
            <span
              className={`ml-0.5 sm:ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-mono font-bold ${
                isHighContrast
                  ? 'bg-cyan-900 text-cyan-200 border border-cyan-700'
                  : 'bg-[#EBF3FF] text-[#0064FF]'
              }`}
            >
              {rows.length}
            </span>
          </span>
          <span
            className={`text-[10px] sm:text-[11px] hidden md:inline truncate ${
              isHighContrast ? 'text-gray-300' : 'text-gray-400'
            }`}
          >
            (카드를 탭하여 수치 바로 입력)
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {onOpenCalculator && (
            <button
              type="button"
              onClick={onOpenCalculator}
              title="현장 간이 계산기 열기"
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl border flex items-center justify-center shrink-0 transition-all active:scale-95 ${
                isHighContrast
                  ? 'bg-[#1E2536] text-[#38BDF8] border-[#2D374D] hover:bg-[#252E42]'
                  : 'bg-white text-[#0064FF] border-gray-200 hover:bg-blue-50 shadow-xs'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onAddRow}
            className="flex items-center gap-1 text-[11px] sm:text-xs font-bold px-2 sm:px-2.5 py-1.5 rounded-xl bg-[#0064FF] text-white hover:bg-blue-600 active:scale-95 transition-all shadow-sm shadow-blue-200 whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span><span className="hidden sm:inline">행 </span>추가</span>
          </button>
        </div>
      </div>

      {/* 2. 카드 리스트 목록 - 핀테크 색상 매칭 */}
      {rows.map((row, index) => {
        const isBM = index === 0;
        const isCurrentCardFocused = focusTarget?.rowIndex === index;

        return (
          <div
            key={row.id}
            onClick={() => onSelectCell(index, 'fs')}
            className={`w-full rounded-2xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer select-none relative flex flex-col gap-3 shadow-xs ${
              isHighContrast
                ? isCurrentCardFocused
                  ? 'bg-[#161B26] border-blue-500 ring-2 ring-blue-500/30 text-white shadow-md'
                  : 'bg-[#161B26] border-[#2A3447] text-white hover:border-slate-600'
                : isCurrentCardFocused
                ? 'bg-white border-2 border-[#0064FF] shadow-md ring-2 ring-[#0064FF]/20'
                : 'bg-white border-[#E2E8F0] hover:border-[#0064FF]/40'
            }`}
          >
            {/* 상단 라인: 측점명 + 뱃지 + 우측 절성토 & 삭제 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCell(index, 'station');
                  }}
                  className={`text-base font-extrabold tracking-tight hover:underline flex items-center gap-1.5 ${
                    isHighContrast ? 'text-white' : 'text-[#0F172A]'
                  }`}
                >
                  <span>{row.station || `측점 ${index + 1}`}</span>
                </button>

                {isBM && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                      isHighContrast
                        ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/50'
                        : 'bg-[#EEF2FF] text-[#4F46E5]'
                    }`}
                  >
                    기준점
                  </span>
                )}

                {row.remark && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCell(index, 'remark');
                    }}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isHighContrast
                        ? 'bg-[#1E2536] text-slate-300 border border-[#2D374D] hover:bg-[#252E42]'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {row.remark}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {renderCutFillBadge(row)}

                {!isBM && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteRow(index);
                    }}
                    title="측점 삭제"
                    className={`p-1 rounded-lg transition-colors ${
                      isHighContrast
                        ? 'text-slate-400 hover:text-rose-400 hover:bg-[#1E2536]'
                        : 'text-gray-300 hover:text-rose-500 hover:bg-rose-50'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 카드 본문 4열 분할 그리드 (전시, 기계고, 지반고, 계획고) - 명확한 구획과 시인성 */}
            <div className="grid grid-cols-4 gap-2 items-stretch text-center pt-1">
              {/* (1) 전시 (FS) - 블루 박스 */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCell(index, 'fs');
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                  focusTarget?.rowIndex === index && focusTarget?.field === 'fs'
                    ? isHighContrast
                      ? 'bg-[#222E44] border-blue-400 ring-2 ring-blue-400/40'
                      : 'bg-[#DBEAFE] border-[#0064FF] ring-2 ring-[#0064FF]/20'
                    : isHighContrast
                    ? 'bg-[#1E2536] border-[#2D374D] hover:bg-[#252E42]'
                    : 'bg-[#EFF6FF] border-[#BFDBFE] hover:bg-[#DBEAFE]'
                }`}
              >
                <span
                  className={`text-[11px] font-black mb-0.5 ${
                    isHighContrast ? 'text-[#38BDF8]' : 'text-[#0064FF]'
                  }`}
                >
                  전시(FS)
                </span>
                <span
                  className={`font-mono font-black text-sm sm:text-base tabular-nums ${
                    row.fs !== null
                      ? isHighContrast
                        ? 'text-[#38BDF8]'
                        : 'text-[#0064FF]'
                      : isBM && row.bs !== null
                      ? isHighContrast
                        ? 'text-indigo-300'
                        : 'text-[#4F46E5]'
                      : isHighContrast
                      ? 'text-slate-500'
                      : 'text-gray-300'
                  }`}
                >
                  {isBM && row.fs === null ? '-' : formatM(row.fs)}
                </span>
              </div>

              {/* (2) 기계고 (IH) - 오렌지/앰버 박스 */}
              <div
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                  isHighContrast
                    ? 'bg-[#241408] border-[#4E240D]'
                    : 'bg-[#FFF7ED] border-[#FFEDD5]'
                }`}
              >
                <span
                  className={`text-[11px] font-black mb-0.5 ${
                    isHighContrast ? 'text-[#FB923C]' : 'text-[#EA580C]'
                  }`}
                >
                  기계고(IH)
                </span>
                <span
                  className={`font-mono font-black text-sm sm:text-base tabular-nums ${
                    isHighContrast ? 'text-[#FB923C]' : 'text-[#EA580C]'
                  }`}
                >
                  {formatM(row.ih)}
                </span>
              </div>

              {/* (3) 지반고 (GH) - 딥 제트블랙 박스 (실측 지면 높이) */}
              <div
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                  isHighContrast
                    ? 'bg-[#161B26] border-[#2A3447]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0]'
                }`}
              >
                <span
                  className={`text-[11px] font-black mb-0.5 ${
                    isHighContrast ? 'text-slate-300' : 'text-[#0F172A]'
                  }`}
                >
                  지반고(GH)
                </span>
                <span
                  className={`font-mono font-black text-sm sm:text-base tabular-nums ${
                    isHighContrast ? 'text-white' : 'text-[#0F172A]'
                  }`}
                >
                  {formatM(row.gh)}
                </span>
              </div>

              {/* (4) 계획고 (FH) - 엑셀 아이콘 매칭 에메랄드 그린 박스 (도면 설계선) */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCell(index, 'fh');
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                  focusTarget?.rowIndex === index && focusTarget?.field === 'fh'
                    ? isHighContrast
                      ? 'bg-[#062D1F] border-emerald-400 ring-2 ring-emerald-400/40'
                      : 'bg-[#ECFDF5] border-[#059669] ring-2 ring-[#059669]/20'
                    : isHighContrast
                    ? 'bg-[#0A261B] border-[#134E35] hover:bg-[#0E3524]'
                    : 'bg-[#F0FDF4] border-[#BBF7D0] hover:bg-[#DCFCE7]'
                }`}
              >
                <span
                  className={`text-[11px] font-black mb-0.5 ${
                    isHighContrast ? 'text-[#34D399]' : 'text-[#059669]'
                  }`}
                >
                  계획고(FH)
                </span>
                <span
                  className={`font-mono font-black text-sm sm:text-base tabular-nums ${
                    row.fh !== null
                      ? isHighContrast
                        ? 'text-[#34D399]'
                        : 'text-[#059669]'
                      : isHighContrast
                      ? 'text-slate-500'
                      : 'text-gray-300'
                  }`}
                >
                  {formatM(row.fh)}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* 신속 행 추가 버튼 */}
      <button
        type="button"
        onClick={onAddRow}
        className={`w-full py-3.5 rounded-2xl border-2 border-dashed font-bold text-sm flex items-center justify-center gap-1.5 active:scale-98 transition-all ${
          isHighContrast
            ? 'border-zinc-700 bg-zinc-950 text-gray-200 hover:border-cyan-400 hover:text-cyan-300'
            : 'border-gray-300 hover:border-[#0064FF] hover:bg-blue-50/40 text-gray-500 hover:text-[#0064FF]'
        }`}
      >
        <Plus className="w-4 h-4" />
        <span>새 측점 추가</span>
      </button>
    </div>
  );
};
