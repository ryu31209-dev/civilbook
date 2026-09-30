import React, { useState, useEffect } from 'react';
import { X, Check, MapPin } from 'lucide-react';

interface BMModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBM: number | null;
  onSave: (newBM: number | null) => void;
}

export const BMModal: React.FC<BMModalProps> = ({
  isOpen,
  onClose,
  currentBM,
  onSave,
}) => {
  const [val, setVal] = useState<string>(
    currentBM !== null && !isNaN(currentBM) ? currentBM.toFixed(3) : ''
  );

  useEffect(() => {
    if (isOpen) {
      setVal(currentBM !== null && !isNaN(currentBM) ? currentBM.toFixed(3) : '');
    }
  }, [isOpen, currentBM]);

  if (!isOpen) return null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (val.trim() === '') {
      onSave(null);
      onClose();
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
      onSave(num);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-tds-elevated border border-[#E8ECF2] flex flex-col gap-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#4F46E5] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">기준점(BM) 표고 변경</h3>
              <p className="text-xs text-gray-400">현장 기준 수준점의 해발 표고(m)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleApply} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-600">BM 표고 (m)</label>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                autoFocus
                className="w-full py-3 px-4 rounded-2xl bg-gray-50 border border-gray-200 font-mono font-bold text-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white transition-all text-right pr-10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                m
              </span>
            </div>
          </div>

          {/* 간편 오프셋 및 지우기 버튼 */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setVal((prev) => (parseFloat(prev || '0') + 1.0).toFixed(3))}
              className="flex-1 py-1.5 rounded-xl bg-gray-100 text-xs font-bold text-gray-700 hover:bg-gray-200"
            >
              +1.000m
            </button>
            <button
              type="button"
              onClick={() => setVal((prev) => (parseFloat(prev || '0') - 1.0).toFixed(3))}
              className="flex-1 py-1.5 rounded-xl bg-gray-100 text-xs font-bold text-gray-700 hover:bg-gray-200"
            >
              -1.000m
            </button>
            <button
              type="button"
              onClick={() => setVal('')}
              className="py-1.5 px-3 rounded-xl bg-rose-50 text-xs font-bold text-rose-600 hover:bg-rose-100"
            >
              지우기
            </button>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-[#4F46E5] hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-1"
            >
              <Check className="w-4 h-4" />
              <span>적용하기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
