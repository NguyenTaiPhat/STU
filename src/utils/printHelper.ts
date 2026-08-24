/**
 * Bộ tiện ích in ấn văn bản học vụ chuẩn STU AMIS
 * Tự động tạo trang in sạch, căn chuẩn A4, đúng định dạng mẫu của Nhà trường
 */

function printHtmlDocument(title: string, bodyContent: string): void {
  const printWindow = window.open('', '_blank', 'width=850,height=900');
  if (!printWindow) {
    window.print();
    return;
  }

  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 15mm 15mm 15mm 15mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Times New Roman', Times, serif, 'Segoe UI', Roboto;
          color: #000000;
          background: #FFFFFF;
          font-size: 13px;
          line-height: 1.4;
          padding: 10px;
        }
        .print-header-meta {
          text-align: right;
          font-size: 11px;
          color: #333333;
          margin-bottom: 12px;
        }
        .print-title {
          text-align: center;
          margin-bottom: 18px;
        }
        .print-title h2 {
          font-size: 16px;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .print-title .info-line {
          font-size: 13px;
          margin-top: 2px;
        }
        table.stu-print-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 12px;
        }
        table.stu-print-table th,
        table.stu-print-table td {
          border: 1px solid #333333;
          padding: 6px 8px;
          vertical-align: middle;
        }
        table.stu-print-table th {
          background-color: #F3F4F6;
          font-weight: bold;
          text-align: center;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-bold { font-weight: bold; }
        .group-header {
          background-color: #F9FAFB;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="print-header-meta">Ngày in: ${dateStr}</div>
      ${bodyContent}
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}

export function printTuitionSheet(fullName = 'Sinh viên STU', classCode = ''): void {
  const content = `
    <div class="print-title">
      <h2>Bảng tổng hợp học phí</h2>
      <div class="info-line">Họ và tên: <strong>${fullName}</strong></div>
      ${classCode ? `<div class="info-line">Lớp: <strong>${classCode}</strong></div>` : ''}
    </div>

    <table class="stu-print-table">
      <thead>
        <tr>
          <th style="width:40px">Stt</th>
          <th>Niên học học kỳ</th>
          <th class="text-right">HP chưa giảm</th>
          <th class="text-right">Miễn giảm</th>
          <th class="text-right">Phải thu</th>
          <th class="text-right">Đã thu</th>
          <th class="text-right">Còn nợ</th>
        </tr>
      </thead>
      <tbody>
        <tr class="group-header">
          <td colspan="7">Thu Học Phí</td>
        </tr>
        <tr>
          <td class="text-center">1</td>
          <td>Học kỳ 1</td>
          <td class="text-right">21,535,000</td>
          <td class="text-right">0</td>
          <td class="text-right text-bold">21,535,000</td>
          <td class="text-right text-bold">21,535,000</td>
          <td class="text-right text-bold">0</td>
        </tr>
        <tr class="group-header text-bold">
          <td colspan="2" class="text-center">TỔNG</td>
          <td class="text-right">21,535,000</td>
          <td class="text-right">0</td>
          <td class="text-right">21,535,000</td>
          <td class="text-right">21,535,000</td>
          <td class="text-right">0</td>
        </tr>
        <tr class="text-bold" style="background-color:#E5E7EB">
          <td colspan="2" class="text-center">TỔNG CỘNG</td>
          <td class="text-right">21,535,000</td>
          <td class="text-right">0</td>
          <td class="text-right">21,535,000</td>
          <td class="text-right">21,535,000</td>
          <td class="text-right">0</td>
        </tr>
      </tbody>
    </table>
  `;

  printHtmlDocument('Bảng tổng hợp học phí - STU', content);
}

export function printCTDTSheet(fullName = 'Sinh viên STU', classCode = ''): void {
  const content = `
    <div class="print-title">
      <h2>CHƯƠNG TRÌNH ĐÀO TẠO KẾ HOẠCH</h2>
      <div class="info-line">Sinh viên: <strong>${fullName}</strong> ${classCode ? `- Lớp: <strong>${classCode}</strong>` : ''}</div>
    </div>

    <table class="stu-print-table">
      <thead>
        <tr>
          <th style="width:40px">STT</th>
          <th style="width:90px">MÃ MH</th>
          <th>TÊN MÔN HỌC</th>
          <th style="width:60px">SỐ TC</th>
          <th style="width:80px">BẮT BUỘC</th>
          <th style="width:70px">TỔNG TIẾT</th>
          <th style="width:70px">LÝ THUYẾT</th>
          <th style="width:70px">THỰC HÀNH</th>
        </tr>
      </thead>
      <tbody>
        <tr class="group-header">
          <td colspan="3">Học kỳ 1 - Năm học 2026 - 2027</td>
          <td class="text-center text-bold">14 TC</td>
          <td colspan="4"></td>
        </tr>
        <tr><td class="text-center">1</td><td class="text-center text-bold">GS19007</td><td>Tiếng Anh 1</td><td class="text-center">2</td><td class="text-center">x</td><td class="text-center">45</td><td class="text-center">15</td><td class="text-center">0</td></tr>
        <tr><td class="text-center">2</td><td class="text-center text-bold">GS33001</td><td>Toán A1 (Hàm 1 biến, chuỗi)</td><td class="text-center">4</td><td class="text-center">x</td><td class="text-center">60</td><td class="text-center">45</td><td class="text-center">0</td></tr>
        <tr><td class="text-center">3</td><td class="text-center text-bold">GS43001</td><td>Vật lý 1</td><td class="text-center">3</td><td class="text-center">x</td><td class="text-center">45</td><td class="text-center">30</td><td class="text-center">0</td></tr>
        <tr><td class="text-center">4</td><td class="text-center text-bold">GS49004</td><td>Thí nghiệm Vật lý_Phần 1</td><td class="text-center">1</td><td class="text-center">x</td><td class="text-center">15</td><td class="text-center">0</td><td class="text-center">15</td></tr>
        <tr><td class="text-center">5</td><td class="text-center text-bold">GS59001</td><td>Tin học đại cương</td><td class="text-center">2</td><td class="text-center">x</td><td class="text-center">30</td><td class="text-center">30</td><td class="text-center">0</td></tr>
        <tr><td class="text-center">6</td><td class="text-center text-bold">GS59002</td><td>Thực hành Tin học đại cương</td><td class="text-center">2</td><td class="text-center">x</td><td class="text-center">45</td><td class="text-center">0</td><td class="text-center">30</td></tr>
      </tbody>
    </table>
  `;

  printHtmlDocument('Chương trình đào tạo - STU', content);
}
