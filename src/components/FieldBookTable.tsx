import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Calculator,
} from 'lucide-react';
import type { FocusTarget, LevelRow } from '../types/level';
import { formatM } from '../utils/calculator';

interface FieldBookTableProps {
  rows: LevelRow[];
  showFullColumns: boolean;
  onToggleFullColumns: () => void;
  onOpenCalculator: () => void;
  focusTarget: FocusTarget | null;
  onSelectCell: (rowIndex: number, field: 'fs' | 'fh' | 'bs' | 'station' | 'remark') => void;
  onAddRow: () => void;
  onDeleteRow: (index: number) => void;
  isHighContrast: boolean;
}

export const FieldBookTable: React.FC<FieldBookTableProps> = ({
  rows,
  showFullColumns,
  onToggleFullColumns,
  onOpenCalculator,
  focusTarget,
  onSelectCell,
  onAddRow,
  onDeleteRow,
  isHighContrast,
}) => {
  // 스크린샷과 100% 일치하는 핀테크 배지 색상 (블루 #0064FF / 핫체리 #FF1744 / 에메랄드 #059669)
  const renderCutFillBadge = (row: LevelRow) => {
    if (row.status === 'none' || row.diff === null) {
      return (
        <span
          className={`text-xs font-mono font-medium ${
            isHighContrast ? 'text-gray-400' : 'text-gray-400'
          }`}
        >
          -
        </span>
      );
    }

    if (row.status === 'ok') {
      return (
        <span
          className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-xl text-xs font-bold font-mono tracking-tight ${
            isHighContrast
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/60'
              : 'bg-[#DCFCE7] text-[#15803D]'
          }`}
        >
          적합
        </span>
      );
    }

    if (row.status === 'cut') {
      return (
        <span
          className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-xl text-xs font-bold font-mono tracking-tight whitespace-nowrap ${
            isHighContrast
              ? 'bg-blue-950/80 text-[#38BDF8] border border-blue-600/60'
              : 'bg-[#DBEAFE] text-[#1D4ED8]'
          }`}
        >
          {row.statusText}
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-xl text-xs font-bold font-mono tracking-tight whitespace-nowrap ${
          isHighContrast
            ? 'bg-rose-950/80 text-rose-300 border border-rose-600/60'
            : 'bg-[#FFE4E6] text-[#BE123C]'
        }`}
      >
        {row.statusText}
      </span>
    );
  };

  const isCellFocused = (rowIndex: number, field: string) => {
    return focusTarget?.rowIndex === rowIndex && focusTarget?.field === field;
  };

  return (
    <div
      className={`w-full rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col shadow-tds ${
        isHighContrast
          ? 'bg-[#121722] border-[#2A3447] text-white shadow-lg'
          : 'bg-white border border-[#E8ECF2]'
      }`}
    >
      {/* 1. 테이블 컨트롤 바 */}
      <div
        className={`px-4 py-3 border-b flex items-center justify-between gap-2 ${
          isHighContrast
            ? 'bg-[#161B26] border-[#242C3D] text-white'
            : 'bg-[#F8FAFC] border-gray-100 text-gray-700'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`text-xs font-bold flex items-center gap-1 whitespace-nowrap shrink-0 ${
              isHighContrast ? 'text-white' : 'text-[#0F172A]'
            }`}
          >
            측점 목록
            <span
              className={`ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-mono font-bold ${
                isHighContrast
                  ? 'bg-blue-950 text-[#38BDF8] border border-blue-800/60'
                  : 'bg-[#EBF3FF] text-[#0064FF]'
              }`}
            >
              {rows.length}
            </span>
          </span>
          <span
            className={`text-[11px] hidden sm:inline truncate ${
              isHighContrast ? 'text-slate-300' : 'text-gray-400'
            }`}
          >
            (셀 탭하여 수치 입력)
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* 현장 간이 계산기 (깔끔한 단독 아이콘 버튼) */}
          <button
            type="button"
            onClick={onOpenCalculator}
            title="현장 간이 계산기 열기"
            className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-all active:scale-95 ${
              isHighContrast
                ? 'bg-[#1E2536] text-[#38BDF8] border-[#2D374D] hover:bg-[#252E42]'
                : 'bg-white text-[#0064FF] border-gray-200 hover:bg-blue-50 shadow-xs'
            }`}
          >
            <Calculator className="w-4 h-4" />
          </button>

          {/* 8열 / 6열 토글 버튼 */}
          <button
            type="button"
            onClick={onToggleFullColumns}
            className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl border transition-all whitespace-nowrap shrink-0 ${
              isHighContrast
                ? showFullColumns
                  ? 'bg-indigo-950 text-indigo-200 border-indigo-500'
                  : 'bg-[#1E2536] text-slate-200 border-[#2D374D] hover:bg-[#252E42]'
                : showFullColumns
                ? 'bg-[#EEF2FF] text-[#4F46E5] border-indigo-200'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {showFullColumns ? (
              <>
                <EyeOff className={`w-3.5 h-3.5 ${isHighContrast ? 'text-indigo-300' : 'text-[#4F46E5]'}`} />
                <span>8열 보기 중</span>
              </>
            ) : (
              <>
                <Eye className={`w-3.5 h-3.5 ${isHighContrast ? 'text-slate-300' : 'text-gray-500'}`} />
                <span>표준 6열 보기</span>
              </>
            )}
          </button>

          {/* 행 추가 버튼 (스크린샷의 선명한 블루 #0064FF) */}
          <button
            type="button"
            onClick={onAddRow}
            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-[#0064FF] text-white hover:bg-[#0052D9] active:scale-95 transition-all shadow-sm shadow-blue-200 whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>행 추가</span>
          </button>
        </div>
      </div>

      {/* 2. 메인 스크롤 테이블 */}
      <div className="w-full overflow-x-auto relative">
        <table className="w-full border-collapse text-left text-xs sm:text-sm">
          {/* 헤더 행 - 선명한 폰트와 고대비 */}
          <thead>
            <tr
              className={`border-b text-[12px] font-bold tracking-tight select-none ${
                isHighContrast
                  ? 'bg-[#182030] border-[#2A3447]'
                  : 'bg-[#F8FAFC] border-[#E8ECF2]'
              }`}
            >
              <th className={`py-2.5 px-2 text-center min-w-[65px] ${
                isHighContrast ? 'text-slate-200 font-bold' : 'text-[#334155] font-bold'
              }`}>
                측점
              </th>
              {showFullColumns && (
                <th
                  className={`py-2.5 px-2 text-right min-w-[75px] ${
                    isHighContrast ? 'text-[#C084FC] font-bold' : 'text-[#7C3AED] font-bold'
                  }`}
                >
                  후시(BS)
                </th>
              )}
              <th
                className={`py-2.5 px-2 text-right min-w-[75px] ${
                  isHighContrast ? 'text-[#38BDF8] font-bold' : 'text-[#0064FF] font-bold'
                }`}
              >
                전시(FS)
              </th>
              {showFullColumns && (
                <th
                  className={`py-2.5 px-2 text-right min-w-[75px] ${
                    isHighContrast ? 'text-[#FB923C] font-bold' : 'text-[#EA580C] font-bold'
                  }`}
                >
                  기계고(IH)
                </th>
              )}
              <th className={`py-2.5 px-2 text-right min-w-[80px] ${
                isHighContrast ? 'text-white font-bold' : 'text-[#0F172A] font-bold'
              }`}>
                지반고(GH)
              </th>
              <th className={`py-2.5 px-2 text-right min-w-[80px] ${
                isHighContrast ? 'text-[#34D399] font-bold' : 'text-[#059669] font-bold'
              }`}>
                계획고(FH)
              </th>
              <th className={`py-2.5 px-2.5 text-center min-w-[105px] ${
                isHighContrast ? 'text-slate-300 font-bold' : 'text-[#334155] font-bold'
              }`}>
                절·성토
              </th>
              <th className={`py-2.5 px-2.5 text-left min-w-[80px] ${
                isHighContrast ? 'text-slate-300 font-bold' : 'text-[#334155] font-bold'
              }`}>
                비고
              </th>
              <th className="py-2.5 px-1.5 text-center w-8"></th>
            </tr>
          </thead>

          {/* 본문 행 리스트 */}
          <tbody className={`divide-y ${isHighContrast ? 'divide-[#242C3D]' : 'divide-gray-100'}`}>
            {rows.map((row, index) => {
              const isBM = index === 0;

              return (
                <tr
                  key={row.id}
                  className={`transition-colors group ${
                    isHighContrast
                      ? isBM
                        ? 'bg-indigo-950/40 hover:bg-indigo-950/60'
                        : 'hover:bg-[#161B26]'
                      : isBM
                      ? 'bg-indigo-50/20 hover:bg-indigo-50/40'
                      : 'hover:bg-blue-50/20'
                  }`}
                >
                  {/* 1. 측점명 */}
                  <td className="py-2 px-1 text-center font-bold">
                    <button
                      type="button"
                      onClick={() => onSelectCell(index, 'station')}
                      className={`w-full py-1 px-1 rounded-lg text-center font-bold truncate transition-all ${
                        isCellFocused(index, 'station')
                          ? 'cell-focused'
                          : isBM
                          ? isHighContrast
                            ? 'text-indigo-300 bg-indigo-950/60'
                            : 'text-[#4F46E5] bg-[#EEF2FF]'
                          : isHighContrast
                          ? 'text-slate-100 hover:bg-[#1E2536]'
                          : 'text-[#0F172A] hover:bg-slate-100'
                      }`}
                    >
                      {row.station || `No.${index}`}
                    </button>
                  </td>

                  {/* 2. 후시(BS) - 바이올렛 */}
                  {showFullColumns && (
                    <td className="py-2 px-1 text-right font-mono tabular-nums">
                      <button
                        type="button"
                        onClick={() => onSelectCell(index, 'bs')}
                        className={`w-full py-1 px-1.5 rounded-lg text-right font-mono font-bold transition-all ${
                          isCellFocused(index, 'bs')
                            ? 'cell-focused'
                            : isHighContrast
                            ? 'text-[#C084FC] hover:bg-purple-950/50'
                            : 'text-[#7C3AED] hover:bg-purple-50'
                        }`}
                      >
                        {formatM(row.bs)}
                      </button>
                    </td>
                  )}

                  {/* 3. 전시(FS) - 블루 볼드 고선명 수치 */}
                  <td className="py-2 px-1 text-right font-mono tabular-nums">
                    <button
                      type="button"
                      onClick={() => onSelectCell(index, 'fs')}
                      className={`w-full py-1 px-1.5 rounded-lg text-right font-mono font-bold text-sm transition-all ${
                        isCellFocused(index, 'fs')
                          ? 'cell-focused'
                          : row.fs !== null
                          ? isHighContrast
                            ? 'text-[#38BDF8] hover:bg-[#1E2536]'
                            : 'text-[#0064FF] hover:bg-blue-50'
                          : isHighContrast
                          ? 'text-slate-600'
                          : 'text-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {formatM(row.fs)}
                    </button>
                  </td>

                  {/* 4. 기계고(IH) - 오렌지/앰버 */}
                  {showFullColumns && (
                    <td
                      className={`py-2 px-1 text-right font-mono tabular-nums font-bold ${
                        isHighContrast
                          ? 'text-[#FB923C]'
                          : 'text-[#EA580C]'
                      }`}
                    >
                      {formatM(row.ih)}
                    </td>
                  )}

                  {/* 5. 지반고(GH) - 제트 블랙 (#0F172A / 다크: 화이트) */}
                  <td
                    className={`py-2 px-1 text-right font-mono tabular-nums font-bold text-sm ${
                      isHighContrast ? 'text-white' : 'text-[#0F172A]'
                    }`}
                  >
                    {formatM(row.gh)}
                  </td>

                  {/* 6. 계획고(FH) - 엑셀 아이콘 매칭 에메랄드 그린 (#059669 / 다크: #34D399) */}
                  <td className="py-2 px-1 text-right font-mono tabular-nums">
                    <button
                      type="button"
                      onClick={() => onSelectCell(index, 'fh')}
                      className={`w-full py-1 px-1.5 rounded-lg text-right font-mono font-bold text-sm transition-all ${
                        isCellFocused(index, 'fh')
                          ? 'cell-focused'
                          : row.fh !== null
                          ? isHighContrast
                            ? 'text-[#34D399] hover:bg-[#1E2536]'
                            : 'text-[#059669] hover:bg-emerald-50'
                          : isHighContrast
                          ? 'text-slate-600'
                          : 'text-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {formatM(row.fh)}
                    </button>
                  </td>

                  {/* 7. 절·성토 배지 */}
                  <td className="py-2 px-1 text-center whitespace-nowrap">
                    {renderCutFillBadge(row)}
                  </td>

                  {/* 8. 비고 */}
                  <td className="py-2 px-1 text-left">
                    <button
                      type="button"
                      onClick={() => onSelectCell(index, 'remark')}
                      className={`w-full py-1 px-1.5 rounded-lg text-left text-xs font-medium truncate transition-all ${
                        isCellFocused(index, 'remark')
                          ? 'cell-focused'
                          : isHighContrast
                          ? 'text-slate-300 hover:bg-[#1E2536]'
                          : 'text-[#1E293B] hover:bg-slate-100'
                      }`}
                    >
                      {row.remark || (
                        <span className={isHighContrast ? 'text-slate-600' : 'text-gray-300'}>
                          -
                        </span>
                      )}
                    </button>
                  </td>

                  {/* 9. 행 삭제 */}
                  <td className="py-2 px-1 text-center">
                    {!isBM && (
                      <button
                        type="button"
                        onClick={() => onDeleteRow(index)}
                        title="측점 삭제"
                        className={`p-1 rounded-lg transition-colors ${
                          isHighContrast
                            ? 'text-gray-400 hover:text-rose-400 hover:bg-zinc-800'
                            : 'text-gray-300 hover:text-rose-500 hover:bg-rose-50'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 3. 하단 신속 행 추가 바 */}
      <div
        className={`p-2.5 border-t flex items-center justify-between ${
          isHighContrast
            ? 'bg-zinc-900 border-zinc-800 text-gray-300'
            : 'bg-[#F8FAFC] border-gray-100 text-gray-400'
        }`}
      >
        <span className="text-[11px] font-medium">
          💡 마지막 행에서 [⏎ 다음]을 누르면 새 측점이 즉시 자동 생성됩니다.
        </span>
        <button
          type="button"
          onClick={onAddRow}
          className={`text-xs font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
            isHighContrast
              ? 'text-cyan-300 hover:bg-zinc-800'
              : 'text-[#0064FF] hover:bg-blue-50'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>새 측점 추가</span>
        </button>
      </div>
    </div>
  );
};
