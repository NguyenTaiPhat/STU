/**
 * Bộ tạo file Excel (.xls / .xlsx XML Spreadsheet) chuẩn Microsoft Excel
 * Mở trực tiếp trên Microsoft Excel, Google Sheets, LibreOffice không bị lỗi font Tiếng Việt
 */

function downloadExcelFile(content: string, filename: string, mimeType = 'application/vnd.ms-excel'): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function createXmlSpreadsheet(sheetName: string, rows: (string | number)[][]): string {
  const rowsXml = rows.map(row => {
    const cellsXml = row.map(val => {
      const isNum = typeof val === 'number';
      return `<Cell><Data ss:Type="${isNum ? 'Number' : 'String'}">${val}</Data></Cell>`;
    }).join('');
    return `<Row>${cellsXml}</Row>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="${sheetName}">
  <Table>
   ${rowsXml}
  </Table>
 </Worksheet>
</Workbook>`;
}

export function exportTuitionExcel(studentId = 'SinhVien'): void {
  const filename = `BangTongHopHocPhi_${studentId}.xls`;
  const rows: (string | number)[][] = [
    ['Bảng tổng hợp học phí', '', '', '', '', '', ''],
    ['Stt', 'Niên học học kỳ', 'HP chưa giảm', 'Miễn giảm', 'Phải thu', 'Đã thu', 'Còn nợ'],
    ['Thu Học Phí', '', '', '', '', '', ''],
    [1, 'Học kỳ 1', 21535000, 0, 21535000, 21535000, 0],
    ['TỔNG', '', 21535000, 0, 21535000, 21535000, 0],
    ['TỔNG CỘNG', '', 21535000, 0, 21535000, 21535000, 0]
  ];

  const xml = createXmlSpreadsheet('HocPhi', rows);
  downloadExcelFile(xml, filename);
}

export function exportCTDTExcel(studentId = 'SinhVien'): void {
  const filename = `ChuongTrinhDaoTao_${studentId}.xls`;
  const rows: (string | number)[][] = [
    ['CHƯƠNG TRÌNH ĐÀO TẠO', '', '', '', '', '', '', ''],
    ['STT', 'MÃ MH', 'TÊN MÔN HỌC', 'SỐ TC', 'MÔN BẮT BUỘC', 'TỔNG TIẾT', 'LÝ THUYẾT', 'THỰC HÀNH'],
    ['Học kỳ 1', '', '', 14, '', '', '', ''],
    [1, 'GS19007', 'Tiếng Anh 1', 2, 'x', 45, 15, 0],
    [2, 'GS33001', 'Toán A1 (Hàm 1 biến, chuỗi)', 4, 'x', 60, 45, 0],
    [3, 'GS43001', 'Vật lý 1', 3, 'x', 45, 30, 0],
    [4, 'GS49004', 'Thí nghiệm Vật lý_Phần 1', 1, 'x', 15, 0, 15],
    [5, 'GS59001', 'Tin học đại cương', 2, 'x', 30, 30, 0],
    [6, 'GS59002', 'Thực hành Tin học đại cương', 2, 'x', 45, 0, 30]
  ];

  const xml = createXmlSpreadsheet('CTDT', rows);
  downloadExcelFile(xml, filename);
}

export function exportScheduleExcel(studentId = 'SinhVien'): void {
  const filename = `ThoiKhoaBieuHocKy_${studentId}.xls`;
  const rows: (string | number)[][] = [
    ['THỜI KHÓA BIỂU HỌC KỲ', '', '', '', '', '', '', '', '', '', '', ''],
    ['Mã MH', 'Tên môn học', 'Ghi chú', 'Nhóm tổ', 'Số tín chỉ', 'Lớp', 'Thứ', 'Tiết bắt đầu', 'Số tiết', 'Phòng', 'Giảng viên', 'Thời gian học'],
    ['Không tìm thấy dữ liệu', '', '', '', '', '', '', '', '', '', '', '']
  ];

  const xml = createXmlSpreadsheet('TKB', rows);
  downloadExcelFile(xml, filename);
}

export function exportGradesExcel(studentId = 'SinhVien', fullName = 'Sinh viên'): void {
  const filename = `BangDiem_${studentId}.xls`;
  const rows: (string | number)[][] = [
    [`KẾT QUẢ HỌC TẬP - ${fullName} (${studentId})`, '', '', '', '', '', '', '', '', '', '', ''],
    ['Stt', 'Mã MH', 'Nhóm/tổ', 'Tên môn học', 'Số tín chỉ', 'Điểm quá trình', 'Điểm giữa kỳ', 'Điểm thi', 'Điểm TK (Thi 2)', 'Điểm TK (Thi 3)', 'Điểm TK (10)', 'Kết quả'],
    ['Không tìm thấy dữ liệu', '', '', '', '', '', '', '', '', '', '', '']
  ];

  const xml = createXmlSpreadsheet('BangDiem', rows);
  downloadExcelFile(xml, filename);
}
