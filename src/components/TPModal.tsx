import React, { useState } from 'react';
import { X, ArrowRightLeft, Check } from 'lucide-react';
import type { LevelRow } from '../types/level';
import { formatM } from '../utils/calculator';

interface TPModalProps {
  isOpen: boolean;
  onClose: () => void;
  rows: LevelRow[];
  currentIH: number | null;
  onApplyTP: (targetStation: string, baseElevation: number, newBS: number) => void;
}

export const TPModal: React.FC<TPModalProps> = ({
  isOpen,
  onClose,
  rows,
  onApplyTP,
}) => {
  const validRows = rows.filter((r) => r.gh !== null && !isNaN(r.gh));
  const defaultRow = validRows.length > 0 ? validRows[validRows.length - 1] : null;

  const [selectedStation, setSelectedStation] = useState<string>(
    defaultRow?.station || ''
  );
  const [baseElevation, setBaseElevation] = useState<string>(
    defaultRow?.gh ? defaultRow.gh.toFixed(3) : ''
  );
  const [newBS, setNewBS] = useState<string>('');

  if (!isOpen) return null;

  const handleSelectRow = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stName = e.target.value;
    setSelectedStation(stName);
    const found = validRows.find((r) => r.station === stName);
    if (found && found.gh !== null) {
      setBaseElevation(found.gh.toFixed(3));
    }
  };

  const parsedBase = parseFloat(baseElevation) || 0;
  const parsedBS = parseFloat(newBS) || 0;
  const computedNewIH = Number((parsedBase + parsedBS).toFixed(3));

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNaN(parsedBase) && !isNaN(parsedBS)) {
      onApplyTP(selectedStation, parsedBase, parsedBS);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-tds-elevated border border-[#E8ECF2] flex flex-col gap-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#3182F6] flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">기계이동 (TP) 새 IH 세팅</h3>
              <p className="text-xs text-gray-400">이기점 지반고를 새 BM으로 승계합니다</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleApply} className="flex flex-col gap-3.5">
          {/* 1. 이기점(TP) 기준 측점 선택 */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600">
              승계할 이기점 (TP 기준 측점)
            </label>
            <select
              value={selectedStation}
              onChange={handleSelectRow}
              className="w-full py-2.5 px-3 rounded-2xl bg-gray-50 border border-gray-200 font-bold text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
            >
              {validRows.map((r) => (
                <option key={r.id} value={r.station}>
                  {r.station} (지반고 GH: {formatM(r.gh)}m) {r.remark ? `- ${r.remark}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 2. 승계 기준 표고 (수정 가능) */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600">
              승계 표고 (새 BM)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                value={baseElevation}
                onChange={(e) => setBaseElevation(e.target.value)}
                className="w-full py-2.5 px-3 rounded-2xl bg-gray-50 border border-gray-200 font-mono font-bold text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3182F6] text-right pr-9"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                m
              </span>
            </div>
          </div>

          {/* 3. 새 위치에서의 후시(BS) */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[#8B5CF6]">
              새 후시 독수값 (BS, m)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                value={newBS}
                onChange={(e) => setNewBS(e.target.value)}
                autoFocus
                placeholder="예: 1.500"
                className="w-full py-2.5 px-3 rounded-2xl bg-purple-50/50 border border-purple-200 font-mono font-bold text-lg text-[#8B5CF6] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] text-right pr-9"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 font-bold text-xs">
                m
              </span>
            </div>
          </div>

          {/* 4. 새 기계고(IH) 실시간 미리보기 카드 */}
          <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-[#3182F6]">새 적용 기계고 (IH)</div>
              <div className="text-[10px] text-gray-500 font-mono">
                {parsedBase.toFixed(3)} + {parsedBS.toFixed(3)}
              </div>
            </div>
            <div className="text-xl font-mono font-bold text-[#3182F6] tabular-nums">
              {computedNewIH.toFixed(3)}m
            </div>
          </div>

          {/* 버튼들 */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-colors"
            >
              닫기
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-[#3182F6] hover:bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-1"
            >
              <Check className="w-4 h-4" />
              <span>새 IH 적용</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
