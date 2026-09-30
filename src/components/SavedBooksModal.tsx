import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  FolderOpen,
  Save,
  PlusCircle,
  Trash2,
  Download,
  Upload,
  Calendar,
  Layers,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import type { LevelRow, ProjectSettings } from '../types/level';
import {
  getSavedBooks,
  saveCurrentBook,
  deleteSavedBook,
  exportBackupFile,
  importBackupJson,
  type SavedBook,
} from '../utils/storage';
import { formatM } from '../utils/calculator';

interface SavedBooksModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: ProjectSettings;
  currentRows: LevelRow[];
  onLoadBook: (book: SavedBook) => void;
  onNewBook: () => void;
  onShowToast: (message: string, type: 'success' | 'info' | 'error', title?: string) => void;
  isHighContrast: boolean;
}

export const SavedBooksModal: React.FC<SavedBooksModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  currentRows,
  onLoadBook,
  onNewBook,
  onShowToast,
  isHighContrast,
}) => {
  const [savedBooks, setSavedBooks] = useState<SavedBook[]>([]);
  const [saveName, setSaveName] = useState(currentSettings.projectName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 모달 열릴 때마다 목록 새로고침 & 현재 이름 동기화
  useEffect(() => {
    if (isOpen) {
      setSavedBooks(getSavedBooks());
      setSaveName(currentSettings.projectName || '현장 수준측량 야장');
    }
  }, [isOpen, currentSettings.projectName]);

  if (!isOpen) return null;

  // 현재 야장 저장
  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveName.trim()) {
      onShowToast('야장 이름을 입력해주세요.', 'error');
      return;
    }

    try {
      const saved = saveCurrentBook(saveName, currentSettings, currentRows);
      setSavedBooks(getSavedBooks());
      onShowToast(`'${saved.name}' 야장이 보관함에 안전하게 저장되었습니다.`, 'success', '저장 완료');
    } catch (err) {
      onShowToast('야장 저장 중 오류가 발생했습니다.', 'error');
    }
  };

  // 야장 불러오기
  const handleLoad = (book: SavedBook) => {
    if (
      window.confirm(
        `'${book.name}' 야장을 불러오시겠습니까?\n(현재 작업 중인 내용은 보관함에 저장해 두셔야 보존됩니다.)`
      )
    ) {
      onLoadBook(book);
      onShowToast(`'${book.name}' 야장을 불러왔습니다.`, 'success', '불러오기 완료');
      onClose();
    }
  };

  // 새 야장 만들기
  const handleCreateNew = () => {
    if (
      window.confirm(
        '새로운 빈 야장으로 시작하시겠습니까?\n(현재 작업 중인 야장이 있다면 먼저 저장해주세요.)'
      )
    ) {
      onNewBook();
      onShowToast('새로운 수준측량 야장이 준비되었습니다.', 'info', '새 야장 시작');
      onClose();
    }
  };

  // 야장 삭제
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`'${name}' 야장을 보관함에서 완전히 삭제하시겠습니까?`)) {
      deleteSavedBook(id);
      setSavedBooks(getSavedBooks());
      onShowToast(`'${name}' 야장이 삭제되었습니다.`, 'info');
    }
  };

  // 백업 파일 불러오기 (Import)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importBackupJson(content);
        if (result.success) {
          setSavedBooks(getSavedBooks());
          onShowToast(result.message, 'success', '복원 완료');
        } else {
          onShowToast(result.message, 'error', '복원 실패');
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl border flex flex-col max-h-[90vh] overflow-hidden ${
          isHighContrast
            ? 'bg-[#121722] border-[#2A3447] text-white'
            : 'bg-white border-[#E8ECF2] text-gray-900'
        }`}
      >
        {/* 1. 상단 타이틀 바 */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0064FF]/10 text-[#0064FF] flex items-center justify-center font-bold">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight flex items-center gap-1.5">
                <span>야장 보관함</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-[#EBF3FF] text-[#0064FF] dark:bg-blue-950 dark:text-blue-300">
                  {savedBooks.length}개
                </span>
              </h3>
              <p className="text-xs text-gray-400">현장별 야장을 저장하고 언제든지 다시 불러옵니다</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. 본문 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4 pr-1">
          {/* (1) 현재 야장 저장하기 카드 */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              isHighContrast
                ? 'bg-[#182030] border-[#2D3952]'
                : 'bg-[#F8FAFC] border-[#E2E8F0]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                <Save className="w-3.5 h-3.5 text-[#0064FF]" />
                현재 작업 중인 야장 저장
              </span>
              <span className="text-[11px] text-gray-400 font-mono">
                측점 {currentRows.length}개 • BM {formatM(currentSettings.bmElevation)}m
              </span>
            </div>

            <form onSubmit={handleSaveCurrent} className="flex gap-2">
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="야장 이름 입력 (예: 1구간 옹벽 기초)"
                className={`flex-1 py-2 px-3 rounded-xl border text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0064FF] transition-all ${
                  isHighContrast
                    ? 'bg-[#121722] border-[#2A3447] text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'
                }`}
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-[#0064FF] hover:bg-blue-600 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shrink-0 shadow-sm active:scale-95 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>보관함에 저장</span>
              </button>
            </form>
          </div>

          {/* (2) 새 야장 시작 버튼 */}
          <button
            type="button"
            onClick={handleCreateNew}
            className={`w-full py-2.5 px-4 rounded-2xl border border-dashed flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all active:scale-98 ${
              isHighContrast
                ? 'border-emerald-600/60 text-emerald-400 hover:bg-emerald-950/30'
                : 'border-emerald-300 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>+ 새로운 빈 야장 만들기 (깨끗한 초기화)</span>
          </button>

          {/* (3) 저장된 야장 목록 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                저장된 야장 목록 ({savedBooks.length})
              </span>
              <span className="text-[11px] text-gray-400">터치하여 바로 불러오기</span>
            </div>

            {savedBooks.length === 0 ? (
              <div
                className={`py-8 px-4 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 ${
                  isHighContrast
                    ? 'bg-[#161B26] border-[#242C3D] text-gray-400'
                    : 'bg-gray-50/70 border-gray-200 text-gray-400'
                }`}
              >
                <AlertCircle className="w-7 h-7 text-gray-300" />
                <p className="text-xs sm:text-sm font-bold">보관된 야장이 아직 없습니다.</p>
                <p className="text-xs text-gray-400">
                  위에서 [보관함에 저장]을 누르면 언제든지 현장별로 불러올 수 있습니다.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {savedBooks.map((book) => {
                  const isCurrent = book.name === currentSettings.projectName;

                  return (
                    <div
                      key={book.id}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isHighContrast
                          ? isCurrent
                            ? 'bg-[#18253A] border-blue-500 shadow-md'
                            : 'bg-[#161B26] border-[#242C3D] hover:border-slate-600'
                          : isCurrent
                          ? 'bg-[#F0F7FF] border-[#0064FF] shadow-xs'
                          : 'bg-white border-[#E2E8F0] hover:border-gray-300'
                      }`}
                    >
                      {/* 야장 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                            {book.name}
                          </h4>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#0064FF] text-white shrink-0">
                              작업 중
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 text-[11px] text-gray-400 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3" />
                            {book.savedAt}
                          </span>
                          <span>•</span>
                          <span className="font-bold text-gray-600 dark:text-gray-300">
                            측점 {book.stationCount}개
                          </span>
                          <span>•</span>
                          <span className="font-mono text-gray-500">
                            BM {formatM(book.bmElevation)}m
                          </span>
                        </div>
                      </div>

                      {/* 액션 버튼들 */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleLoad(book)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95 transition-all ${
                            isCurrent
                              ? 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                              : 'bg-[#0064FF] text-white hover:bg-blue-600'
                          }`}
                        >
                          <span>불러오기</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(book.id, book.name)}
                          title="야장 삭제"
                          className="p-1.5 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 3. 하단 백업 및 복원 툴바 */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportBackupFile}
              title="스마트폰이나 다른 기기로 옮길 수 있도록 JSON 백업 파일을 저장합니다"
              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition-all ${
                isHighContrast
                  ? 'bg-[#182030] border-[#2A3447] text-slate-300 hover:bg-[#1E2536]'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>전체 백업 다운로드</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="저장해둔 백업 파일(.json)을 불러와 복원합니다"
              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition-all ${
                isHighContrast
                  ? 'bg-[#182030] border-[#2A3447] text-slate-300 hover:bg-[#1E2536]'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>백업 복원</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-200 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
