import React, { useState, useRef, useEffect } from 'react';
import {
  FileSpreadsheet,
  Sun,
  Moon,
  FolderEdit,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
  Share2,
  FolderOpen,
  MoreVertical,
} from 'lucide-react';
import { Logo } from './Logo';
import type { ProjectSettings } from '../types/level';

interface HeaderProps {
  settings: ProjectSettings;
  viewMode: 'table' | 'card';
  onToggleViewMode: () => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  onExportExcel: () => void;
  onShareKakaoExcel: () => void;
  onOpenProjectModal: () => void;
  onOpenSavedBooks: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  viewMode,
  onToggleViewMode,
  isHighContrast,
  onToggleHighContrast,
  onExportExcel,
  onShareKakaoExcel,
  onOpenProjectModal,
  onOpenSavedBooks,
  onResetData,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="w-full flex items-center justify-between pt-1.5 pb-1 sm:pt-2 sm:pb-2">
      {/* 1. 좌측 로고 & 프로젝트명 */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
          <Logo className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>
        <div className="flex flex-col justify-center min-w-0">
          {/* 1행: CivilBook + PRO 배지 + 슬림 자동저장 인디케이터 */}
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <h1
              className={`text-sm sm:text-lg font-black tracking-tight leading-tight flex items-center gap-1 transition-colors ${
                isHighContrast ? 'text-white' : 'text-[#111827]'
              }`}
            >
              <span>
                Civil<span className="text-[#0064FF]">Book</span>
              </span>
              <span
                className={`text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded leading-none ${
                  isHighContrast ? 'bg-blue-900 text-blue-200' : 'bg-[#EBF3FF] text-[#0064FF]'
                }`}
              >
                PRO
              </span>
            </h1>

            {/* 슬림 자동저장 인디케이터 */}
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold shrink-0 border ${
                isHighContrast
                  ? 'bg-zinc-900 text-emerald-300 border-emerald-500/40'
                  : 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
              }`}
              title="실시간 자동 저장됨"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
              <span>자동저장</span>
            </span>
          </div>

          {/* 2행: 프로젝트명 */}
          <button
            type="button"
            onClick={onOpenProjectModal}
            className={`text-[11px] sm:text-xs flex items-center gap-1 text-left truncate max-w-[130px] sm:max-w-xs mt-0.5 transition-colors ${
              isHighContrast
                ? 'text-gray-300 hover:text-white'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <span className="font-medium truncate">{settings.projectName}</span>
            <FolderEdit className="w-3 h-3 text-gray-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* 2. 우측 액션 아이콘 버튼들 */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-1.5 sm:ml-4" ref={menuRef}>
        {/* 0) 야장 보관함 (저장 / 불러오기) 버튼 */}
        <button
          type="button"
          onClick={onOpenSavedBooks}
          title="야장 보관함 (저장 / 불러오기)"
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl border flex items-center justify-center active:scale-95 transition-all ${
            isHighContrast
              ? 'bg-[#161B26] border-[#2A3447] text-[#38BDF8] hover:bg-[#1E2536] shadow-sm'
              : 'bg-[#F0F7FF] text-[#0064FF] border-[#BFDBFE] hover:bg-[#DBEAFE] shadow-sm'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* 1) 카드뷰 ↔ 표보기 전환 아이콘 버튼 */}
        <button
          type="button"
          onClick={onToggleViewMode}
          title={viewMode === 'card' ? '표 보기로 전환' : '카드 뷰로 전환'}
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl border flex items-center justify-center active:scale-95 transition-all ${
            isHighContrast
              ? viewMode === 'card'
                ? 'bg-[#1E2536] border-blue-500 text-blue-300 shadow-sm'
                : 'bg-[#161B26] border-[#2A3447] text-slate-300 shadow-sm'
              : viewMode === 'card'
              ? 'bg-[#EBF3FF] text-[#0064FF] border-[#D0E2FF] shadow-sm'
              : 'bg-white text-gray-600 border-[#E8ECF2] hover:bg-gray-50 shadow-sm'
          }`}
        >
          {viewMode === 'card' ? (
            <TableIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isHighContrast ? 'text-blue-300' : 'text-[#0064FF]'}`} />
          ) : (
            <LayoutGrid className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isHighContrast ? 'text-slate-300' : 'text-gray-600'}`} />
          )}
        </button>

        {/* 2) 야외 직사광선 고대비 모드 토글 */}
        <button
          type="button"
          onClick={onToggleHighContrast}
          title={isHighContrast ? '일반 모드로 전환' : '야외 고대비 모드'}
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl border flex items-center justify-center active:scale-95 transition-all ${
            isHighContrast
              ? 'bg-[#161B26] border-[#2A3447] text-amber-400 hover:bg-[#1E2536] shadow-sm'
              : 'bg-white text-gray-600 border-[#E8ECF2] hover:bg-gray-50 shadow-sm'
          }`}
        >
          {isHighContrast ? (
            <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400/20" />
          ) : (
            <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
          )}
        </button>

        {/* 데스크탑(sm 이상) 전용 버튼 3개 */}
        <div className="hidden sm:flex items-center gap-1.5">
          {/* 야장 공유하기 */}
          <button
            type="button"
            onClick={onShareKakaoExcel}
            title="수준측량 야장 공유하기"
            className={`w-9 h-9 rounded-2xl border flex items-center justify-center active:scale-95 transition-all ${
              isHighContrast
                ? 'bg-[#161B26] border-[#2A3447] hover:bg-[#1E2536] shadow-sm'
                : 'bg-white border-[#E8ECF2] hover:bg-rose-50/50 shadow-sm'
            }`}
          >
            <Share2 className="w-4 h-4 text-[#FF1744]" />
          </button>

          {/* 표준 8열 엑셀 다운로드 */}
          <button
            type="button"
            onClick={onExportExcel}
            title="표준 8열 엑셀 다운로드"
            className={`w-9 h-9 rounded-2xl border flex items-center justify-center active:scale-95 transition-all ${
              isHighContrast
                ? 'bg-[#161B26] border-[#2A3447] hover:bg-[#1E2536] shadow-sm'
                : 'bg-white text-[#059669] border-[#E8ECF2] hover:bg-emerald-50/50 shadow-sm'
            }`}
          >
            <FileSpreadsheet className={`w-4 h-4 ${isHighContrast ? 'text-emerald-400' : 'text-[#059669]'}`} />
          </button>

          {/* 초기화 버튼 */}
          <button
            type="button"
            onClick={onResetData}
            title="기본값 복원"
            className={`w-9 h-9 rounded-2xl border flex items-center justify-center shadow-sm active:scale-95 transition-all ${
              isHighContrast
                ? 'bg-[#161B26] border-[#2A3447] text-slate-400 hover:text-white hover:bg-[#1E2536]'
                : 'bg-white border-[#E8ECF2] text-gray-400 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* 모바일(sm 미만) 더보기 드롭다운 버튼 */}
        <div className="relative sm:hidden">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="더보기 메뉴"
            className={`w-8 h-8 rounded-xl border flex items-center justify-center active:scale-95 transition-all ${
              isHighContrast
                ? 'bg-[#161B26] border-[#2A3447] text-slate-200 hover:bg-[#1E2536]'
                : 'bg-white border-[#E8ECF2] text-gray-600 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* 모바일 팝오버 드롭다운 메뉴 */}
          {isMenuOpen && (
            <div
              className={`absolute right-0 top-10 w-44 rounded-2xl shadow-xl border p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                isHighContrast
                  ? 'bg-[#161B26] border-[#2A3447] text-slate-200'
                  : 'bg-white border-gray-200 text-gray-700'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onShareKakaoExcel();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-colors ${
                  isHighContrast ? 'hover:bg-[#1E2536] text-rose-300' : 'hover:bg-rose-50 text-[#FF1744]'
                }`}
              >
                <Share2 className="w-4 h-4" />
                <span>야장 카카오톡 공유</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onExportExcel();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-colors ${
                  isHighContrast ? 'hover:bg-[#1E2536] text-emerald-300' : 'hover:bg-emerald-50 text-[#059669]'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>엑셀(.xlsx) 저장</span>
              </button>

              <div className={`my-1 border-t ${isHighContrast ? 'border-[#242C3D]' : 'border-gray-100'}`} />

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onResetData();
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-colors ${
                  isHighContrast ? 'hover:bg-red-950/50 text-red-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>데이터 초기화</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
