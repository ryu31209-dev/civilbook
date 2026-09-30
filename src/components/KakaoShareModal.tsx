import React, { useState } from 'react';
import { X, Copy, Check, FileSpreadsheet, ArrowUpRight, MessageCircle } from 'lucide-react';
import type { ProjectSettings } from '../types/level';

interface KakaoShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  shareText: string;
  settings: ProjectSettings;
  onDirectShare: () => void;
  onDownloadExcel: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const KakaoShareModal: React.FC<KakaoShareModalProps> = ({
  isOpen,
  onClose,
  fileName,
  shareText,
  settings,
  onDirectShare,
  onDownloadExcel,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // 카카오톡 PC / 모바일 앱 실행
  const handleLaunchKakaoTalk = () => {
    try {
      window.location.href = 'kakaotalk://';
      onShowToast('카카오톡 앱을 실행합니다. 대화방을 선택해 주세요.', 'info');
    } catch (e) {
      window.open('https://open.kakao.com', '_blank');
    }
  };

  // 텍스트 클립보드 복사
  const handleCopyText = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        textArea.style.position = 'fixed';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      onShowToast('야장 요약본이 복사되었습니다! 카톡방에 붙여넣기(Ctrl+V)하세요.', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      onShowToast('복사에 실패했습니다.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-tds-elevated border border-[#E8ECF2] flex flex-col gap-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-[#FEE500] text-[#371D1E] flex items-center justify-center shadow-xs">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                <path
                  d="M12 3.5C6.753 3.5 2.5 6.858 2.5 11c0 2.668 1.8 4.995 4.542 6.273l-.92 3.385c-.085.312.264.567.538.388l4.08-2.673c.412.062.834.095 1.26.095 5.247 0 9.5-3.358 9.5-7.468C21.5 6.858 17.247 3.5 12 3.5Z"
                  fill="#371D1E"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-base">카카오톡 야장 전송</h3>
              <p className="text-[11px] text-gray-400 truncate max-w-[200px]">{settings.projectName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 엑셀 파일 상태 카드 */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">{fileName}</p>
              <p className="text-[11px] text-emerald-700 font-medium">표준 8개 컬럼 서식 생성 완료</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDownloadExcel}
            title="파일 다운로드"
            className="text-[11px] font-bold text-gray-600 hover:text-emerald-700 underline shrink-0"
          >
            저장
          </button>
        </div>

        {/* 액션 버튼 그룹 */}
        <div className="flex flex-col gap-2.5 pt-1">
          {/* 1) 스마트폰 시스템 카카오톡 공유창 직접 호출 (모바일 Web Share) */}
          <button
            type="button"
            onClick={onDirectShare}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#FEE500] hover:bg-[#FADA0A] active:scale-98 text-[#191919] font-black text-sm shadow-md shadow-amber-200/80 transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4.5 h-4.5 fill-[#191919]" />
            <span>카카오톡 대화방 선택하여 전송</span>
          </button>

          {/* 2) 카카오톡 PC 앱 열기 (딥링크) */}
          <button
            type="button"
            onClick={handleLaunchKakaoTalk}
            className="w-full py-3 px-4 rounded-2xl bg-gray-100 hover:bg-gray-200 active:scale-98 text-gray-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <span>카카오톡 앱 바로 열기</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-gray-500" />
          </button>

          {/* 3) 야장 요약본 텍스트 복사 버튼 */}
          <button
            type="button"
            onClick={handleCopyText}
            className={`w-full py-3 px-4 rounded-2xl border active:scale-98 font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              copied
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
            <span>{copied ? '복사 완료! 대화방에 붙여넣기하세요' : '대화방 보고용 텍스트 복사'}</span>
          </button>
        </div>

        <p className="text-[11px] text-gray-400 text-center leading-tight">
          💡 스마트폰에서는 바로 카톡방 선택창이 열리며,<br />
          PC에서는 카톡 대화방 창에 파일을 끌어다 놓으시면 됩니다.
        </p>
      </div>
    </div>
  );
};
