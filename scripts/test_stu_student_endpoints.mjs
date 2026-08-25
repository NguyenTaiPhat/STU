import fs from 'fs';

async function testStudentAPIs() {
  const username = 'DH05260789';
  const password = '23122008';
  const payload = JSON.stringify({ username, password, uri: 'http://amis01.stu.edu.vn/#/home', vaitro: '' });
  const base64Code = Buffer.from(payload, 'utf-8').toString('base64');
  const targetUrl = 'http://amis01.stu.edu.vn/api/pn-signin?code=' + encodeURIComponent(base64Code) + '&gopage=&mgr=0';
  const authRes = await fetch(targetUrl, { redirect: 'manual' });
  const loc = authRes.headers.get('location') || '';
  const match = loc.match(/CurrUser=([^&]+)/);
  const userObj = JSON.parse(Buffer.from(decodeURIComponent(match[1]), 'base64').toString('utf-8'));
  const token = userObj.access_token;
  const headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json', 'idpc': '0' };

  // All student-relevant endpoints in STU AMIS
  const endpoints = [
    // 1. Sinh vien
    { name: 'info', url: 'http://amis01.stu.edu.vn/api/dkmh/w-locsinhvieninfo', body: {} },
    { name: 'quy_dinh', url: 'http://amis01.stu.edu.vn/api/dkmh/w-locdanhsachsinhvienquydinh', body: {} },
    // 2. TKB & Lịch thi
    { name: 'tkb_tuan', url: 'http://amis01.stu.edu.vn/api/sch/w-locdstkbtuanusertheohocky', body: { filter: { hoc_ky: 20261, ten_hoc_ky: '' }, additional: { paging: { limit: 100, page: 1 }, ordering: [{ name: null, order_type: null }] } } },
    { name: 'tkb_ngay', url: 'http://amis01.stu.edu.vn/api/sch/w-locdsthongtinlophoctrongngay', body: {} },
    { name: 'lich_thi_hocky', url: 'http://amis01.stu.edu.vn/api/sch/w-locdslichthisvtheohocky', body: { filter: { hoc_ky: 20261, ten_hoc_ky: '' }, additional: { paging: { limit: 100, page: 1 }, ordering: [{ name: null, order_type: null }] } } },
    // 3. Học phí & Công nợ
    { name: 'phieu_bao_hp', url: 'http://amis01.stu.edu.vn/api/merchant/w-locdsphieubaohocphisinhvien', body: {} },
    { name: 'thong_tin_cong_no', url: 'http://amis01.stu.edu.vn/api/merchant/w-locthongtinconnosinhvien', body: {} },
    // 4. Kết quả học tập
    { name: 'diem_hk', url: 'http://amis01.stu.edu.vn/api/srm/w-locketquadiemsinhvien', body: {} },
    { name: 'diem_tich_luy_ky_vong', url: 'http://amis01.stu.edu.vn/api/srm/w-xetdiemtichluykyvong', body: {} },
    // 5. Đăng ký môn học
    { name: 'kq_dkmh', url: 'http://amis01.stu.edu.vn/api/dkmh/w-locdskqdkmhsinhvien', body: {} },
    { name: 'ctdt_sv', url: 'http://amis01.stu.edu.vn/api/dkmh/w-locdsctdtsinhvien', body: {} },
    { name: 'ctdt_all', url: 'http://amis01.stu.edu.vn/api/dkmh/w-locdsctdt', body: {} },
    { name: 'mon_da_dk', url: 'http://amis01.stu.edu.vn/api/dkmh/w-locdsmonhocdadangky', body: { filter: { hoc_ky: 20261, ten_hoc_ky: '' }, additional: { paging: { limit: 100, page: 1 }, ordering: [{ name: null, order_type: null }] } } },
    // 6. Thông báo & Hệ thống
    { name: 'thong_bao', url: 'http://amis01.stu.edu.vn/api/dkmh/w-locdsthongbao', body: {} },
    { name: 'time_server', url: 'http://amis01.stu.edu.vn/api/hsba/w-gettimeserver', method: 'GET' }
  ];

  const results = {};

  for (const ep of endpoints) {
    try {
      const opt = { method: ep.method || 'POST', headers };
      if (ep.method !== 'GET') opt.body = JSON.stringify(ep.body || {});
      const res = await fetch(ep.url, opt);
      if (res.ok) {
        const j = await res.json();
        results[ep.name] = j;
        console.log('OK [200] ' + ep.name);
      } else {
        console.log('ERR [' + res.status + '] ' + ep.name);
      }
    } catch (e) {
      console.log('EXC ' + ep.name + ': ' + e.message);
    }
  }

  fs.writeFileSync('scripts/live_stu_data_dump.json', JSON.stringify(results, null, 2));
  console.log('\nDumped all live data into scripts/live_stu_data_dump.json');
}

testStudentAPIs();
