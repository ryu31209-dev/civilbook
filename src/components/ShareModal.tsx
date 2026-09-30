import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle } from 'lucide-react';
import { shareOrCopy } from '../utils/shareUtils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareText: string;
  projectName: string;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  shareText,
  projectName,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
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
      onShowToast('야장 보고서가 클립보드에 복사되었습니다!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      onShowToast('클립보드 복사에 실패했습니다.', 'error');
    }
  };

  const handleDirectShare = async () => {
    const res = await shareOrCopy(`[수준측량 보고] ${projectName}`, shareText);
    if (res.success) {
      if (res.method === 'clipboard') {
        setCopied(true);
        onShowToast('공유 창 대신 텍스트가 클립보드에 복사되었습니다!', 'success');
        setTimeout(() => setCopied(false), 2000);
      } else {
        onShowToast('공유 완료되었습니다.', 'success');
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-tds-elevated border border-[#E8ECF2] flex flex-col gap-4 max-h-[90vh]">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF2E63] to-[#FA255E] text-white flex items-center justify-center shadow-sm shadow-rose-200">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">카카오톡·문자 야장 공유</h3>
              <p className="text-xs text-gray-400">현장 감리/원청 실시간 보고용 요약 리포트</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 미리보기 */}
        <div className="flex-1 overflow-hidden flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-600">보고서 본문 미리보기</label>
          <div className="w-full max-h-60 overflow-y-auto p-3.5 rounded-2xl bg-gray-50 border border-gray-200 font-mono text-xs text-gray-800 whitespace-pre-wrap leading-relaxed select-text">
            {shareText}
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={handleDirectShare}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FF2E63] to-[#FA255E] hover:from-[#E02354] hover:to-[#E02354] text-white font-bold text-sm shadow-md shadow-rose-200 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>📢 카카오톡 / 문자 앱으로 바로 전송</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className={`flex-1 py-3 px-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                copied
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '복사 완료!' : '텍스트 전체 복사'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-3 px-5 rounded-2xl bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
