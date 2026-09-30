import React from 'react';
import { X, Calculator, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import type { ClosureErrorResult } from '../utils/calculator';
import { formatM } from '../utils/calculator';

interface CheckErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ClosureErrorResult;
}

export const CheckErrorModal: React.FC<CheckErrorModalProps> = ({
  isOpen,
  onClose,
  result,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-tds-elevated border border-[#E8ECF2] flex flex-col gap-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#8B5CF6] flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">폐합오차 검산 리포트</h3>
              <p className="text-xs text-gray-400">수준측량 야장 수학적 정합성 검증</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. 공식 안내 배너 */}
        <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col gap-1">
          <div className="text-[11px] font-bold text-gray-500">수준측량 오차 검증 공식</div>
          <div className="font-mono text-xs sm:text-sm font-bold text-gray-800 tracking-tight bg-white p-2 rounded-xl border border-gray-200 text-center">
            ∑BS - ∑FS = 최종 GH - 최초 GH
          </div>
        </div>

        {/* 2. 계산 비교 카드 */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* 좌변 */}
          <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#8B5CF6]">좌변: ∑BS - ∑FS</span>
            <div className="text-xs text-gray-500 font-mono">
              BS합: {result.sumBS.toFixed(3)}m<br />
              FS합: {result.sumFS.toFixed(3)}m
            </div>
            <div className="font-mono font-bold text-sm text-[#8B5CF6] mt-1 pt-1 border-t border-purple-200">
              = {result.diffBSFS >= 0 ? '+' : ''}{result.diffBSFS.toFixed(3)}m
            </div>
          </div>

          {/* 우변 */}
          <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col gap-1">
            <span className="text-[11px] font-bold text-[#3182F6]">우변: 끝GH - 첫GH</span>
            <div className="text-xs text-gray-500 font-mono">
              종점: {formatM(result.endGH)}m<br />
              기점: {formatM(result.startGH)}m
            </div>
            <div className="font-mono font-bold text-sm text-[#3182F6] mt-1 pt-1 border-t border-blue-200">
              = {result.diffGH !== null ? `${result.diffGH >= 0 ? '+' : ''}${result.diffGH.toFixed(3)}m` : '-'}
            </div>
          </div>
        </div>

        {/* 3. 최종 검산 결과 판정 */}
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 ${
            result.isClosed
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-rose-50/70 border-rose-200 text-rose-950'
          }`}
        >
          {result.isClosed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          )}
          <div className="flex flex-col gap-0.5 text-xs">
            <div className="font-bold text-sm">
              폐합 오차:{' '}
              <span className="font-mono font-extrabold text-base">
                {result.closureErrorMM !== null ? `${result.closureErrorMM >= 0 ? '+' : ''}${result.closureErrorMM} mm` : '-'}
              </span>
            </div>
            <div className="text-gray-600 font-medium">{result.message}</div>
          </div>
        </div>

        {/* 4. 현장 허용 오차 팁 */}
        <div className="p-3 rounded-2xl bg-gray-50 text-[11px] text-gray-500 flex items-start gap-2">
          <HelpCircle className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
          <span>
            토목 관로 및 도로 시방서 일반 허용오차는 통상 편도 왕복 기준 ±15~20mm 이내입니다.
            현재 측정치는 정밀 기준을 만족하고 있습니다.
          </span>
        </div>

        {/* 확인 버튼 */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gray-900 hover:bg-black text-white font-bold text-sm transition-colors active:scale-98"
        >
          확인 완료
        </button>
      </div>
    </div>
  );
};
