import React, { useState } from 'react';
import { X, Folder, Check } from 'lucide-react';
import type { ProjectSettings } from '../types/level';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ProjectSettings;
  onSave: (newSettings: Partial<ProjectSettings>) => void;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [projectName, setProjectName] = useState(settings.projectName);
  const [surveyDate, setSurveyDate] = useState(settings.surveyDate);
  const [surveyor, setSurveyor] = useState(settings.surveyor);
  const [toleranceMM, setToleranceMM] = useState(
    Math.round(settings.toleranceM * 1000).toString()
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tolM = (parseInt(toleranceMM, 10) || 5) / 1000;
    onSave({
      projectName: projectName.trim() || '현장 수준측량',
      surveyDate,
      surveyor: surveyor.trim() || '현장기사',
      toleranceM: tolM,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-tds-elevated border border-[#E8ECF2] flex flex-col gap-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#3182F6] flex items-center justify-center">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">공사 정보 설정</h3>
              <p className="text-xs text-gray-400">야장 보고서 및 엑셀에 인쇄됩니다</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600">공사명</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full py-2.5 px-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600">측량일자</label>
            <input
              type="date"
              value={surveyDate}
              onChange={(e) => setSurveyDate(e.target.value)}
              className="w-full py-2.5 px-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600">측량자</label>
            <input
              type="text"
              value={surveyor}
              onChange={(e) => setSurveyor(e.target.value)}
              className="w-full py-2.5 px-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-600">
              판정 허용 오차 (± mm)
            </label>
            <input
              type="number"
              value={toleranceMM}
              onChange={(e) => setToleranceMM(e.target.value)}
              min="1"
              max="50"
              className="w-full py-2.5 px-3 rounded-2xl bg-gray-50 border border-gray-200 font-mono text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3182F6]"
            />
            <span className="text-[10px] text-gray-400">
              * 기본값 5mm (이 오차 범위 내는 '적합'으로 자동 판정)
            </span>
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
              className="flex-1 py-3 rounded-2xl bg-[#3182F6] hover:bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-1"
            >
              <Check className="w-4 h-4" />
              <span>저장하기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
