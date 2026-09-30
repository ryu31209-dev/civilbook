import React, { useState, useEffect } from 'react';
import { X, Calculator, Copy, Check, Delete } from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  isHighContrast: boolean;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({
  isOpen,
  onClose,
  isHighContrast,
}) => {
  const [display, setDisplay] = useState<string>('0');
  const [formula, setFormula] = useState<string>('');
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // 모달 열릴 때 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setDisplay('0');
      setFormula('');
      setIsCalculated(false);
      setCopied(false);
    }
  }, [isOpen]);

  // 안전한 사칙연산 계산 헬퍼
  const safeCalculate = (expr: string): number | null => {
    try {
      // 숫자 및 기본 연산자(+, -, *, /, .)만 허용
      const sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/');
      if (!/^[0-9+\-*/. ]+$/.test(sanitized)) return null;
      // eslint-disable-next-line no-new-func
      const result = Function(`'use strict'; return (${sanitized})`)();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        // 소수점 4자리에서 반올림 후 불필요한 뒷자리 0 정리
        const rounded = Number(result.toFixed(4));
        return rounded;
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleDigit = (digit: string) => {
    if (isCalculated) {
      setDisplay(digit);
      setFormula('');
      setIsCalculated(false);
      return;
    }

    if (display === '0') {
      setDisplay(digit);
    } else {
      setDisplay((prev) => prev + digit);
    }
  };

  const handleDot = () => {
    if (isCalculated) {
      setDisplay('0.');
      setFormula('');
      setIsCalculated(false);
      return;
    }

    if (!display.includes('.')) {
      setDisplay((prev) => (prev ? prev + '.' : '0.'));
    }
  };

  const handleOperator = (op: string) => {
    if (isCalculated) {
      setFormula(`${display} ${op}`);
      setDisplay('0');
      setIsCalculated(false);
      return;
    }

    if (formula && display === '0') {
      // 연산자만 교체
      setFormula((prev) => prev.slice(0, -1) + op);
      return;
    }

    if (formula) {
      // 이전 연산 수행
      const fullExpr = `${formula} ${display}`;
      const res = safeCalculate(fullExpr);
      if (res !== null) {
        setFormula(`${res} ${op}`);
        setDisplay('0');
        return;
      }
    }

    setFormula(`${display} ${op}`);
    setDisplay('0');
  };

  const handleEquals = () => {
    if (!formula || isCalculated) return;
    const fullExpr = `${formula} ${display}`;
    const res = safeCalculate(fullExpr);
    if (res !== null) {
      setFormula(`${fullExpr} =`);
      setDisplay(String(res));
      setIsCalculated(true);
    } else {
      setDisplay('Error');
      setIsCalculated(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setFormula('');
    setIsCalculated(false);
  };

  const handleBackspace = () => {
    if (isCalculated) {
      handleClear();
      return;
    }
    if (display.length <= 1) {
      setDisplay('0');
    } else {
      setDisplay((prev) => prev.slice(0, -1));
    }
  };

  const handleToggleSign = () => {
    if (display === '0') return;
    if (display.startsWith('-')) {
      setDisplay((prev) => prev.slice(1));
    } else {
      setDisplay((prev) => '-' + prev);
    }
  };

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(display);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  // 키보드 이벤트 지원
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === '.') {
        handleDot();
      } else if (e.key === '+') {
        handleOperator('+');
      } else if (e.key === '-') {
        handleOperator('-');
      } else if (e.key === '*' || e.key === 'x') {
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, display, formula, isCalculated]);

  if (!isOpen) return null;

  const btnBaseClass =
    'h-12 sm:h-13 rounded-2xl font-bold text-lg active:scale-95 transition-all flex items-center justify-center select-none shadow-xs';
  const numBtnClass = isHighContrast
    ? `${btnBaseClass} bg-[#1E2536] text-white hover:bg-[#252E42] border border-[#2D374D]`
    : `${btnBaseClass} bg-white text-gray-900 hover:bg-gray-50 border border-gray-200/80`;
  const opBtnClass = isHighContrast
    ? `${btnBaseClass} bg-[#161B26] text-[#38BDF8] hover:bg-[#1E2536] border border-blue-900/40 font-mono text-xl`
    : `${btnBaseClass} bg-[#EBF3FF] text-[#0064FF] hover:bg-[#DBEAFE] font-mono text-xl`;
  const actionBtnClass = isHighContrast
    ? `${btnBaseClass} bg-[#161B26] text-slate-300 hover:bg-[#1E2536] border border-[#2D374D]`
    : `${btnBaseClass} bg-gray-100 text-gray-700 hover:bg-gray-200`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xs sm:max-w-sm rounded-3xl p-5 shadow-2xl border flex flex-col gap-3.5 ${
          isHighContrast
            ? 'bg-[#0D1117] border-[#2A3447] text-white'
            : 'bg-white border-[#E8ECF2] text-gray-900'
        }`}
      >
        {/* 1. 모달 헤더 (그냥 계산기) */}
        <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#0064FF] dark:bg-blue-950 dark:text-[#38BDF8] flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">계산기</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. 계산기 디스플레이 창 */}
        <div
          className={`p-3.5 rounded-2xl border flex flex-col items-end justify-between min-h-[76px] transition-colors ${
            isHighContrast
              ? 'bg-[#161B26] border-[#242C3D]'
              : 'bg-gray-50 border-gray-200/80'
          }`}
        >
          {/* 이전 수식 표시 */}
          <div className="text-xs font-mono font-medium text-gray-400 truncate max-w-full h-4">
            {formula || '\u00A0'}
          </div>
          {/* 현재 입력/결과 수치 */}
          <div className="flex items-baseline gap-1 w-full justify-end overflow-hidden">
            <span
              className={`font-mono font-black text-2xl sm:text-3xl tracking-tight truncate tabular-nums ${
                isHighContrast ? 'text-white' : 'text-gray-900'
              }`}
            >
              {display}
            </span>
          </div>
        </div>

        {/* 3. 결과 복사 버튼 */}
        <div className="flex items-center text-xs">
          <button
            type="button"
            onClick={handleCopy}
            className={`w-full py-2.5 px-3 rounded-2xl border font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs ${
              copied
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                : isHighContrast
                ? 'bg-[#161B26] border-[#2D374D] text-slate-300 hover:bg-[#1E2536]'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '복사 완료' : '결과 복사'}</span>
          </button>
        </div>

        {/* 4. 텐키 그리드 (4x5) */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {/* 행 1: C, ±, ⌫, ÷ */}
          <button type="button" onClick={handleClear} className={`${actionBtnClass} text-rose-500 font-black`}>
            C
          </button>
          <button type="button" onClick={handleToggleSign} className={actionBtnClass}>
            ±
          </button>
          <button type="button" onClick={handleBackspace} className={actionBtnClass}>
            <Delete className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => handleOperator('÷')} className={opBtnClass}>
            ÷
          </button>

          {/* 행 2: 7, 8, 9, × */}
          <button type="button" onClick={() => handleDigit('7')} className={numBtnClass}>
            7
          </button>
          <button type="button" onClick={() => handleDigit('8')} className={numBtnClass}>
            8
          </button>
          <button type="button" onClick={() => handleDigit('9')} className={numBtnClass}>
            9
          </button>
          <button type="button" onClick={() => handleOperator('×')} className={opBtnClass}>
            ×
          </button>

          {/* 행 3: 4, 5, 6, - */}
          <button type="button" onClick={() => handleDigit('4')} className={numBtnClass}>
            4
          </button>
          <button type="button" onClick={() => handleDigit('5')} className={numBtnClass}>
            5
          </button>
          <button type="button" onClick={() => handleDigit('6')} className={numBtnClass}>
            6
          </button>
          <button type="button" onClick={() => handleOperator('-')} className={opBtnClass}>
            -
          </button>

          {/* 행 4: 1, 2, 3, + */}
          <button type="button" onClick={() => handleDigit('1')} className={numBtnClass}>
            1
          </button>
          <button type="button" onClick={() => handleDigit('2')} className={numBtnClass}>
            2
          </button>
          <button type="button" onClick={() => handleDigit('3')} className={numBtnClass}>
            3
          </button>
          <button type="button" onClick={() => handleOperator('+')} className={opBtnClass}>
            +
          </button>

          {/* 행 5: 0, 00, ., = */}
          <button type="button" onClick={() => handleDigit('0')} className={numBtnClass}>
            0
          </button>
          <button type="button" onClick={() => handleDigit('00')} className={numBtnClass}>
            00
          </button>
          <button type="button" onClick={handleDot} className={numBtnClass}>
            .
          </button>
          <button
            type="button"
            onClick={handleEquals}
            className="h-12 sm:h-13 rounded-2xl bg-[#0064FF] hover:bg-[#0052D4] text-white font-mono font-bold text-2xl active:scale-95 transition-all flex items-center justify-center shadow-md shadow-blue-200"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
};
