import ExcelJS from 'exceljs';
import type { LevelRow, ProjectSettings } from '../types/level';

/**
 * 감리단/원청 제출용 최고급 디자인 스타일이 적용된 표준 8개 컬럼 엑셀 Blob 생성
 */
export async function generateExcelBlob(
  rows: LevelRow[],
  settings: ProjectSettings
): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CivilBook';
  workbook.lastModifiedBy = 'CivilBook';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet('수준야장 (Level Book)', {
    views: [{ showGridLines: true }],
  });

  // 열 너비 설정
  worksheet.columns = [
    { key: 'station', width: 14 },   // A: 측점
    { key: 'bs', width: 13 },        // B: 후시 (BS)
    { key: 'fs', width: 13 },        // C: 전시 (FS)
    { key: 'ih', width: 13 },        // D: 기계고 (IH)
    { key: 'gh', width: 14 },        // E: 지반고 (GH)
    { key: 'fh', width: 14 },        // F: 계획고 (FH)
    { key: 'diff', width: 13 },      // G: 단차 (m)
    { key: 'status', width: 18 },    // H: 절·성토
    { key: 'remark', width: 18 },    // I: 비고
  ];

  // 1. 대제목 헤더 배너 (A1:I2 병합)
  worksheet.mergeCells('A1:I2');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'CivilBook 수준측량 야장 보고서 (Level Survey Field Book)';
  titleCell.font = {
    name: '맑은 고딕',
    size: 16,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E3A8A' }, // 딥 네이비 블루
  };
  titleCell.alignment = {
    vertical: 'middle',
    horizontal: 'center',
  };

  // 2. 공사 정보 메타데이터 박스 (A4:I5)
  const metaStyleHeader = {
    font: { name: '맑은 고딕', size: 9, bold: true, color: { argb: 'FF334155' } },
    fill: {
      type: 'pattern' as const,
      pattern: 'solid' as const,
      fgColor: { argb: 'FFF1F5F9' }, // 연한 슬레이트 블루-그레이
    },
    alignment: { vertical: 'middle' as const, horizontal: 'center' as const },
    border: {
      top: { style: 'thin' as const, color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin' as const, color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'thin' as const, color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin' as const, color: { argb: 'FFCBD5E1' } },
    },
  };

  const metaStyleVal = {
    font: { name: '맑은 고딕', size: 9.5, bold: false, color: { argb: 'FF0F172A' } },
    fill: {
      type: 'pattern' as const,
      pattern: 'solid' as const,
      fgColor: { argb: 'FFFFFFFF' },
    },
    alignment: { vertical: 'middle' as const, horizontal: 'left' as const },
    border: {
      top: { style: 'thin' as const, color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin' as const, color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'thin' as const, color: { argb: 'FFCBD5E1' } },
      right: { style: 'thin' as const, color: { argb: 'FFCBD5E1' } },
    },
  };

  // 행 4: 공사명, 측량일자, 측량자
  worksheet.mergeCells('B4:D4');
  worksheet.getCell('A4').value = '공 사 명';
  worksheet.getCell('B4').value = settings.projectName;
  worksheet.getCell('E4').value = '측 량 일';
  worksheet.getCell('F4').value = settings.surveyDate;
  worksheet.getCell('G4').value = '측 량 자';
  worksheet.mergeCells('H4:I4');
  worksheet.getCell('H4').value = settings.surveyor;

  // 행 5: 기준 BM, 적용 기계고, 허용오차
  worksheet.getCell('A5').value = '기준 BM';
  worksheet.getCell('B5').value = settings.bmElevation !== null ? `${settings.bmElevation.toFixed(3)} m` : '-';
  worksheet.mergeCells('C5:D5');
  worksheet.getCell('C5').value = settings.currentBS !== null ? `(초기 후시: ${settings.currentBS.toFixed(3)}m)` : '';
  worksheet.getCell('E5').value = '적용 기계고';
  worksheet.getCell('F5').value = settings.currentIH !== null ? `${settings.currentIH.toFixed(3)} m` : '-';
  worksheet.getCell('G5').value = '허용 오차';
  worksheet.mergeCells('H5:I5');
  worksheet.getCell('H5').value = `±${settings.toleranceM * 1000} mm (0.005m)`;

  // 메타데이터 셀 스타일 일괄 적용
  ['A4', 'E4', 'G4', 'A5', 'E5', 'G5'].forEach((addr) => {
    const c = worksheet.getCell(addr);
    Object.assign(c, metaStyleHeader);
  });
  ['B4', 'C4', 'D4', 'F4', 'H4', 'I4', 'B5', 'C5', 'D5', 'F5', 'H5', 'I5'].forEach((addr) => {
    const c = worksheet.getCell(addr);
    c.font = metaStyleVal.font;
    c.border = metaStyleVal.border;
  });

  worksheet.getRow(4).height = 22;
  worksheet.getRow(5).height = 22;

  // 3. 메인 테이블 헤더 (A7:I7)
  const headerRow = worksheet.getRow(7);
  headerRow.values = [
    '측점',
    '후시 (BS)',
    '전시 (FS)',
    '기계고 (IH)',
    '지반고 (GH)',
    '계획고 (FH)',
    '단차 (m)',
    '절·성토',
    '비고',
  ];
  headerRow.height = 28;

  headerRow.eachCell((cell) => {
    cell.font = {
      name: '맑은 고딕',
      size: 10.5,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' }, // 로열 블루
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF1D4ED8' } },
      left: { style: 'thin', color: { argb: 'FF60A5FA' } },
      bottom: { style: 'medium', color: { argb: 'FF1D4ED8' } },
      right: { style: 'thin', color: { argb: 'FF60A5FA' } },
    };
  });

  // 4. 데이터 행 출력 및 서식 지정
  const startRowIndex = 8;
  const thinBorder = {
    top: { style: 'thin' as const, color: { argb: 'FFE2E8F0' } },
    left: { style: 'thin' as const, color: { argb: 'FFE2E8F0' } },
    bottom: { style: 'thin' as const, color: { argb: 'FFE2E8F0' } },
    right: { style: 'thin' as const, color: { argb: 'FFE2E8F0' } },
  };

  rows.forEach((row, i) => {
    const rowNum = startRowIndex + i;
    const r = worksheet.getRow(rowNum);
    r.height = 23;

    const isZebra = i % 2 === 1;
    const defaultBg = isZebra ? 'FFF8FAFC' : 'FFFFFFFF'; // 은은한 얼터네이팅 컬러

    const bsVal =
      row.bs !== null
        ? Number(row.bs.toFixed(3))
        : i === 0 && settings.currentBS !== null
        ? Number(settings.currentBS.toFixed(3))
        : null;
    const fsVal = row.fs !== null ? Number(row.fs.toFixed(3)) : null;
    const ihVal =
      row.ih !== null
        ? Number(row.ih.toFixed(3))
        : settings.currentIH !== null
        ? Number(settings.currentIH.toFixed(3))
        : null;
    const ghVal = row.gh !== null ? Number(row.gh.toFixed(3)) : null;
    const fhVal = row.fh !== null ? Number(row.fh.toFixed(3)) : null;
    const diffVal = row.diff !== null ? Number(row.diff.toFixed(3)) : null;

    r.values = [
      row.station || `No.${i}`,
      bsVal,
      fsVal,
      ihVal,
      ghVal,
      fhVal,
      diffVal,
      row.statusText || '-',
      row.remark || '',
    ];

    // 각 셀별 맞춤 스타일 & 서식
    // A: 측점 (가운데 정렬, 볼드)
    const cellA = r.getCell(1);
    cellA.alignment = { vertical: 'middle', horizontal: 'center' };
    cellA.font = { name: '맑은 고딕', size: 9.5, bold: true, color: { argb: i === 0 ? 'FF7C3AED' : 'FF1E293B' } };
    cellA.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };
    cellA.border = thinBorder;

    // B: 후시 (BS) - 우측 정렬, 퍼플 텍스트, 0.000 포맷
    const cellB = r.getCell(2);
    cellB.alignment = { vertical: 'middle', horizontal: 'right' };
    cellB.numFmt = '0.000';
    cellB.font = { name: 'Consolas', size: 10, bold: true, color: { argb: 'FF7C3AED' } };
    cellB.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };
    cellB.border = thinBorder;

    // C: 전시 (FS) - 우측 정렬, 볼드, 0.000 포맷
    const cellC = r.getCell(3);
    cellC.alignment = { vertical: 'middle', horizontal: 'right' };
    cellC.numFmt = '0.000';
    cellC.font = { name: 'Consolas', size: 10, bold: true, color: { argb: 'FF0F172A' } };
    cellC.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };
    cellC.border = thinBorder;

    // D: 기계고 (IH) - 우측 정렬, 0.000 포맷
    const cellD = r.getCell(4);
    cellD.alignment = { vertical: 'middle', horizontal: 'right' };
    cellD.numFmt = '0.000';
    cellD.font = { name: 'Consolas', size: 9.5, color: { argb: 'FF64748B' } };
    cellD.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };
    cellD.border = thinBorder;

    // E: 지반고 (GH) - 우측 정렬, 핵심 볼드
    const cellE = r.getCell(5);
    cellE.alignment = { vertical: 'middle', horizontal: 'right' };
    cellE.numFmt = '0.000';
    cellE.font = { name: 'Consolas', size: 10, bold: true, color: { argb: 'FF0F172A' } };
    cellE.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };
    cellE.border = thinBorder;

    // F: 계획고 (FH) - 우측 정렬
    const cellF = r.getCell(6);
    cellF.alignment = { vertical: 'middle', horizontal: 'right' };
    cellF.numFmt = '0.000';
    cellF.font = { name: 'Consolas', size: 9.5, color: { argb: 'FF334155' } };
    cellF.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };
    cellF.border = thinBorder;

    // G: 단차 (m) - 우측 정렬
    const cellG = r.getCell(7);
    cellG.alignment = { vertical: 'middle', horizontal: 'right' };
    cellG.numFmt = '+0.000;-0.000;0.000';
    cellG.font = { name: 'Consolas', size: 10, bold: true, color: { argb: 'FF0F172A' } };
    cellG.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };
    cellG.border = thinBorder;

    // H: 절·성토 배지 스타일링
    const cellH = r.getCell(8);
    cellH.alignment = { vertical: 'middle', horizontal: 'center' };
    cellH.border = thinBorder;

    if (row.status === 'cut') {
      // 깎기: 소프트 블루 배경 + 진한 파랑 글자
      cellH.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
      cellH.font = { name: '맑은 고딕', size: 9.5, bold: true, color: { argb: 'FF1D4ED8' } };
    } else if (row.status === 'fill') {
      // 채움: 소프트 로즈 배경 + 진한 레드 글자
      cellH.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE4E6' } };
      cellH.font = { name: '맑은 고딕', size: 9.5, bold: true, color: { argb: 'FFBE123C' } };
    } else if (row.status === 'ok') {
      // 적합: 소프트 에메랄드 배경 + 진한 초록 글자
      cellH.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } };
      cellH.font = { name: '맑은 고딕', size: 9.5, bold: true, color: { argb: 'FF047857' } };
    } else {
      cellH.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };
      cellH.font = { name: '맑은 고딕', size: 9.5, color: { argb: 'FF94A3B8' } };
    }

    // I: 비고 (가운데 정렬)
    const cellI = r.getCell(9);
    cellI.alignment = { vertical: 'middle', horizontal: 'center' };
    cellI.font = { name: '맑은 고딕', size: 9.5, color: { argb: 'FF475569' } };
    cellI.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: defaultBg } };
    cellI.border = thinBorder;
  });

  // 5. 요약 검측 결과 박스 (마지막 행 하단)
  const cutCount = rows.filter((r) => r.status === 'cut').length;
  const fillCount = rows.filter((r) => r.status === 'fill').length;
  const okCount = rows.filter((r) => r.status === 'ok').length;

  const summaryRowIndex = startRowIndex + rows.length + 1;
  worksheet.mergeCells(`A${summaryRowIndex}:I${summaryRowIndex}`);
  const summaryCell = worksheet.getCell(`A${summaryRowIndex}`);
  summaryCell.value = `[CivilBook 검측 요약]  총 ${rows.length}개 측점 검측 완료  │  적합(양호): ${okCount}개소  │  깎기(터파기): ${cutCount}개소  │  채움(성토): ${fillCount}개소`;
  summaryCell.font = { name: '맑은 고딕', size: 10, bold: true, color: { argb: 'FF1E293B' } };
  summaryCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F5F9' },
  };
  summaryCell.alignment = { vertical: 'middle', horizontal: 'center' };
  summaryCell.border = {
    top: { style: 'medium', color: { argb: 'FF94A3B8' } },
    bottom: { style: 'double', color: { argb: 'FF94A3B8' } },
    left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
  };
  worksheet.getRow(summaryRowIndex).height = 26;

  // 6. 엑셀 Blob 및 File 객체 생성
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  return blob;
}

export function getExcelFileName(settings: ProjectSettings): string {
  const sanitizedDate = settings.surveyDate.replace(/[^0-9]/g, '');
  const sanitizedProject = settings.projectName.replace(/\s+/g, '_');
  return `CivilBook_수준야장_${sanitizedProject}_${sanitizedDate || '현장'}.xlsx`;
}

/**
 * 표준 엑셀 파일 다운로드
 */
export async function exportToStandardExcel(
  rows: LevelRow[],
  settings: ProjectSettings
): Promise<void> {
  const blob = await generateExcelBlob(rows, settings);
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = getExcelFileName(settings);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}

/**
 * 엑셀 File 객체 생성
 */
export async function createExcelFile(
  rows: LevelRow[],
  settings: ProjectSettings
): Promise<File> {
  const blob = await generateExcelBlob(rows, settings);
  const fileName = getExcelFileName(settings);
  return new File([blob], fileName, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/**
 * 엑셀 파일을 카카오톡 / 모바일 앱 대화방으로 직접 공유
 */
export async function shareExcelFile(
  rows: LevelRow[],
  settings: ProjectSettings,
  prebuiltFile?: File | null
): Promise<{ success: boolean; method: 'web-share' | 'download' | 'error'; message: string }> {
  try {
    const file = prebuiltFile || (await createExcelFile(rows, settings));
    const fileName = file.name;

    // 다운로드 헬퍼
    const doDownload = () => {
      const url = window.URL.createObjectURL(file);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);
    };

    // 1. Web Share API (모바일, 태블릿, PWA, 웹뷰 앱, Windows 크롬 등 모든 환경에서 카톡 대화방 선택창 직행)
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      const shareDataWithFile = {
        files: [file],
        title: `[CivilBook] ${settings.projectName} 수준야장`,
        text: `[CivilBook 수준측량 야장 보고서]\n공사명: ${settings.projectName}\n측량일자: ${settings.surveyDate}\n기준 BM: ${settings.bmElevation}m / 기계고: ${settings.currentIH}m\n\n첨부: 표준 8개 컬럼 엑셀 야장`,
      };

      if (navigator.canShare && navigator.canShare(shareDataWithFile)) {
        await navigator.share(shareDataWithFile);
        return {
          success: true,
          method: 'web-share',
          message: '카카오톡 대화방으로 엑셀 야장이 전송되었습니다.',
        };
      }

      // 파일 첨부 직접 공유를 미지원하는 일부 브라우저의 경우 텍스트 공유 시도
      const shareDataTextOnly = {
        title: `[CivilBook] ${settings.projectName} 수준야장`,
        text: `[CivilBook 수준측량 야장 보고서]\n공사명: ${settings.projectName}\n측량일자: ${settings.surveyDate}\n기준 BM: ${settings.bmElevation}m / 기계고: ${settings.currentIH}m`,
      };

      if (navigator.canShare && navigator.canShare(shareDataTextOnly)) {
        // 파일은 자동 다운로드 시켜놓고, 카톡 대화방 선택창으로 텍스트 전달
        doDownload();
        await navigator.share(shareDataTextOnly);
        return {
          success: true,
          method: 'web-share',
          message: '카카오톡 대화방 선택창이 열렸습니다.',
        };
      }
    }

    // 2. Web Share 미지원 환경: 파일 다운로드
    doDownload();
    return {
      success: true,
      method: 'download',
      message: '엑셀 파일이 준비되었습니다.',
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { success: false, method: 'error', message: '공유가 취소되었습니다.' };
    }
    console.error('공유 처리 중 오류:', error);
    return { success: false, method: 'error', message: '카카오톡 공유를 실행할 수 없습니다.' };
  }
}

