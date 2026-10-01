import React from 'react';
import { Edit3, ArrowRightLeft } from 'lucide-react';
import type { ProjectSettings } from '../types/level';
import { formatM } from '../utils/calculator';

interface DashboardProps {
  settings: ProjectSettings;
  onOpenBMModal: () => void;
  onOpenTPModal: () => void;
  onFocusBS: () => void;
  isBSFocused: boolean;
  isHighContrast: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  settings,
  onOpenBMModal,
  onOpenTPModal,
  onFocusBS,
  isBSFocused,
  isHighContrast,
}) => {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full">
      {/* 1. 좌측 50% [후시 (BS) 카드] */}
      <div
        className={`relative overflow-hidden rounded-2xl sm:rounded-3xl p-3 sm:p-4.5 border transition-all duration-200 cursor-pointer select-none flex flex-col justify-between ${
          isHighContrast
            ? isBSFocused
              ? 'bg-[#161B26] text-white border-purple-400 ring-2 ring-purple-500/40 shadow-lg'
              : 'bg-[#161B26] text-white border-[#2A3447] shadow-md hover:border-slate-600'
            : isBSFocused
            ? 'bg-white border-[#7C3AED] shadow-tds-elevated ring-2 ring-purple-400/30'
            : 'bg-white border-[#E8ECF2] shadow-tds hover:border-purple-200'
        }`}
        onClick={onFocusBS}
      >
        {/* 상단 라벨 & 상태 배지 */}
        <div className="flex items-center justify-between gap-1 mb-1.5 min-w-0">
          <span
            className={`text-[11px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-lg shrink-0 whitespace-nowrap ${
              isHighContrast
                ? 'bg-purple-950 text-[#C084FC] border border-purple-700/50'
                : 'bg-[#7C3AED] text-white shadow-xs'
            }`}
          >
            후시 (BS)
          </span>
          <span
            className={`text-[10px] sm:text-[11px] font-medium shrink-0 whitespace-nowrap ${
              isHighContrast ? 'text-slate-400' : 'text-gray-400'
            }`}
          >
            탭하여 수정
          </span>
        </div>

        {/* 대형 수치 */}
        <div className="my-1 sm:my-1.5 flex items-baseline gap-1 min-w-0">
          <span
            className={`text-2xl sm:text-3xl font-mono font-extrabold tracking-tight tabular-nums truncate ${
              isHighContrast ? 'text-white' : 'text-[#111827]'
            }`}
          >
            {formatM(settings.currentBS)}
          </span>
          {settings.currentBS !== null && (
            <span
              className={`text-xs sm:text-sm font-bold shrink-0 ${
                isHighContrast ? 'text-slate-400' : 'text-gray-500'
              }`}
            >
              m
            </span>
          )}
        </div>

        {/* 하단 칩: 기준 BM 표고 */}
        <div className={`mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t ${isHighContrast ? 'border-[#242C3D]' : 'border-gray-100/90'}`}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenBMModal();
            }}
            className={`w-full inline-flex items-center justify-between text-[11px] sm:text-xs font-semibold px-2 py-1.5 sm:px-2.5 rounded-xl transition-all ${
              isHighContrast
                ? 'bg-[#1E2536] text-slate-200 hover:bg-[#252E42] border border-[#2D374D]'
                : 'bg-[#F8FAFC] border border-[#E5E7EB] text-[#374151] hover:bg-[#EEF2FF] hover:text-[#4F46E5] hover:border-indigo-200'
            }`}
          >
            <span className={`shrink-0 ${isHighContrast ? 'text-slate-400 font-normal' : 'text-gray-400 font-normal'}`}>기준 BM:</span>
            <div className="flex items-center gap-1 font-mono font-bold tabular-nums truncate ml-1">
              <span className="truncate">{settings.bmElevation !== null ? `${formatM(settings.bmElevation)}m` : '미설정'}</span>
              <Edit3 className={`w-3 h-3 shrink-0 ${isHighContrast ? 'text-slate-400' : 'text-gray-400'}`} />
            </div>
          </button>
        </div>
      </div>

      {/* 2. 우측 50% [기계고 (IH) 카드] */}
      <div
        className={`relative overflow-hidden rounded-2xl sm:rounded-3xl p-3 sm:p-4.5 border transition-all duration-200 flex flex-col justify-between ${
          isHighContrast
            ? 'bg-[#161B26] text-white border-[#2A3447] shadow-md'
            : 'bg-white border-[#E8ECF2] shadow-tds'
        }`}
      >
        {/* 상단 라벨 & 자동계산 뱃지 */}
        <div className="flex items-center justify-between gap-1 mb-1.5 min-w-0">
          <span
            className={`text-[11px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-lg shrink-0 whitespace-nowrap ${
              isHighContrast
                ? 'bg-orange-950 text-orange-300 border border-orange-700/50'
                : 'bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]'
            }`}
          >
            기계고 (IH)
          </span>
          <span
            className={`text-[10px] sm:text-[11px] font-medium shrink-0 whitespace-nowrap ${
              isHighContrast ? 'text-slate-400' : 'text-gray-400'
            }`}
          >
            BM+BS 자동
          </span>
        </div>

        {/* 대형 수치 */}
        <div className="my-1 sm:my-1.5 flex items-baseline gap-1 min-w-0">
          <span
            className={`text-2xl sm:text-3xl font-mono font-extrabold tracking-tight tabular-nums truncate ${
              isHighContrast ? 'text-[#FB923C]' : 'text-[#EA580C]'
            }`}
          >
            {formatM(settings.currentIH)}
          </span>
          {settings.currentIH !== null && (
            <span
              className={`text-xs sm:text-sm font-bold shrink-0 ${
                isHighContrast ? 'text-slate-400' : 'text-gray-500'
              }`}
            >
              m
            </span>
          )}
        </div>

        {/* 하단 버튼: TP 기계이동 */}
        <div className={`mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t ${isHighContrast ? 'border-[#242C3D]' : 'border-gray-100/90'}`}>
          <button
            type="button"
            onClick={onOpenTPModal}
            className={`w-full inline-flex items-center justify-center gap-1 text-[11px] sm:text-xs font-bold px-1.5 py-1.5 sm:px-2.5 rounded-xl transition-all whitespace-nowrap ${
              isHighContrast
                ? 'bg-[#1E2536] text-[#FB923C] hover:bg-[#252E42] border border-orange-900/50'
                : 'bg-[#FFF7ED] border border-[#FFEDD5] text-[#EA580C] hover:bg-orange-100'
            }`}
          >
            <ArrowRightLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">기계이동 (TP) 설정 ↳</span>
          </button>
        </div>
      </div>
    </div>
  );
};
