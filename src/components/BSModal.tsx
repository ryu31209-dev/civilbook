import React, { useState, useEffect } from 'react';
import { X, Check, Eye } from 'lucide-react';
import { formatM } from '../utils/calculator';

interface BSModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBS: number | null;
  bmElevation: number | null;
  onSave: (newBS: number | null) => void;
}

export const BSModal: React.FC<BSModalProps> = ({
  isOpen,
  onClose,
  currentBS,
  bmElevation,
  onSave,
}) => {
  const [val, setVal] = useState<string>(
    currentBS !== null && !isNaN(currentBS) ? currentBS.toFixed(3) : ''
  );

  useEffect(() => {
    if (isOpen) {
      setVal(currentBS !== null && !isNaN(currentBS) ? currentBS.toFixed(3) : '');
    }
  }, [isOpen, currentBS]);

  if (!isOpen) return null;

  const numVal = parseFloat(val);
  const isValidNum = !isNaN(numVal) && val.trim() !== '';
  const previewIH =
    isValidNum && bmElevation !== null ? Number((bmElevation + numVal).toFixed(3)) : null;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (val.trim() === '') {
      onSave(null);
      onClose();
      return;
    }
    if (isValidNum) {
      onSave(numVal);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#E8ECF2] flex flex-col gap-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-100 text-[#7C3AED] flex items-center justify-center font-bold">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-base">후시(BS) 관측값 입력</h3>
              <p className="text-xs text-gray-400">기준점(BM)을 바라본 첫 관측 척도값</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleApply} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700">후시 (BS) 척도치</label>
              {bmElevation !== null && (
                <span className="text-[11px] font-mono text-gray-400">
                  기준 BM: {formatM(bmElevation)}m
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                placeholder="예: 1.250"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                autoFocus
                className="w-full py-3 px-4 rounded-2xl bg-gray-50 border border-gray-200 font-mono font-bold text-2xl text-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white transition-all text-right pr-10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                m
              </span>
            </div>
          </div>

          {/* 기계고(IH) 실시간 자동계산 프리뷰 박스 */}
          <div className="p-3 rounded-2xl bg-orange-50/80 border border-orange-200/70 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-orange-800">계산될 기계고 (IH)</span>
              <span className="text-[10px] text-orange-600">BM + BS 자동 세팅</span>
            </div>
            <div className="text-right">
              <span className="text-base font-mono font-black text-[#EA580C]">
                {previewIH !== null ? `${formatM(previewIH)}m` : '-'}
              </span>
            </div>
          </div>

          {/* 간편 오프셋 및 지우기 버튼 */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setVal((prev) => (parseFloat(prev || '0') + 0.1).toFixed(3))}
              className="flex-1 py-1.5 rounded-xl bg-gray-100 text-xs font-bold text-gray-700 hover:bg-gray-200 active:scale-95 transition-all"
            >
              +0.100m
            </button>
            <button
              type="button"
              onClick={() => setVal((prev) => Math.max(0, parseFloat(prev || '0') - 0.1).toFixed(3))}
              className="flex-1 py-1.5 rounded-xl bg-gray-100 text-xs font-bold text-gray-700 hover:bg-gray-200 active:scale-95 transition-all"
            >
              -0.100m
            </button>
            <button
              type="button"
              onClick={() => setVal((prev) => (parseFloat(prev || '0') + 1.0).toFixed(3))}
              className="flex-1 py-1.5 rounded-xl bg-gray-100 text-xs font-bold text-gray-700 hover:bg-gray-200 active:scale-95 transition-all"
            >
              +1.000m
            </button>
            <button
              type="button"
              onClick={() => setVal('')}
              className="py-1.5 px-3 rounded-xl bg-rose-50 text-xs font-bold text-rose-600 hover:bg-rose-100 active:scale-95 transition-all"
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
              className="flex-1 py-3 rounded-2xl bg-[#7C3AED] hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-200 active:scale-95 transition-all flex items-center justify-center gap-1.5"
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
