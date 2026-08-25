import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Phương thức không được hỗ trợ' }));
    return;
  }

  let body = '';
  if (typeof req.body === 'object' && req.body !== null) {
    body = JSON.stringify(req.body);
  } else {
    for await (const chunk of req) {
      body += chunk;
    }
  }

  try {
    const { username, password } = JSON.parse(body || '{}');
    if (!username || !password) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Thiếu thông tin đăng nhập' }));
      return;
    }

    // 1. Authenticate with STU AMIS
    const payload = JSON.stringify({
      username,
      password,
      uri: 'http://amis01.stu.edu.vn/#/home',
      vaitro: ''
    });
    const base64Code = Buffer.from(payload, 'utf-8').toString('base64');
    const targetUrl = `http://amis01.stu.edu.vn/api/pn-signin?code=${encodeURIComponent(base64Code)}&gopage=&mgr=0`;

    const authRes = await fetch(targetUrl, { redirect: 'manual' });
    const loc = authRes.headers.get('location') || '';
    const match = loc.match(/CurrUser=([^&]+)/);

    if (!match || match[1] === 'null') {
      res.statusCode = 401;
      res.end(JSON.stringify({ error: 'Đăng nhập STU AMIS thất bại. Kiểm tra tài khoản/mật khẩu.' }));
      return;
    }

    const userObj = JSON.parse(Buffer.from(decodeURIComponent(match[1]), 'base64').toString('utf-8'));
    const token = userObj.access_token;
    const idsv = userObj.id;

    // 2. Fetch live data across STU endpoints
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'idpc': '0'
    };

    const [infoRes, scheduleRes, tuitionRes, gradesRes, noticesRes, serverTimeRes, registeredCoursesRes, ctdtRes] = await Promise.allSettled([
      fetch('http://amis01.stu.edu.vn/api/dkmh/w-locsinhvieninfo', {
        method: 'POST', headers, body: JSON.stringify({})
      }).then(r => r.json()),
      fetch('http://amis01.stu.edu.vn/api/sch/w-locdstkbtuanusertheohocky', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          filter: { hoc_ky: 20261, ten_hoc_ky: '' },
          additional: { paging: { limit: 100, page: 1 }, ordering: [{ name: null, order_type: null }] }
        })
      }).then(r => r.json()),
      fetch('http://amis01.stu.edu.vn/api/merchant/w-locdsphieubaohocphisinhvien', {
        method: 'POST', headers, body: JSON.stringify({})
      }).then(r => r.json()),
      fetch('http://amis01.stu.edu.vn/api/srm/w-locketquadiemsinhvien', {
        method: 'POST', headers, body: JSON.stringify({})
      }).then(r => r.json()),
      fetch('http://amis01.stu.edu.vn/api/dkmh/w-locdsthongbao', {
        method: 'POST', headers, body: JSON.stringify({})
      }).then(r => r.json()),
      fetch('http://amis01.stu.edu.vn/api/hsba/w-gettimeserver', {
        method: 'GET', headers
      }).then(r => r.json()),
      fetch('http://amis01.stu.edu.vn/api/dkmh/w-locdskqdkmhsinhvien', {
        method: 'POST', headers, body: JSON.stringify({})
      }).then(r => r.json()),
      fetch('http://amis01.stu.edu.vn/api/dkmh/w-locdsctdtsinhvien', {
        method: 'POST', headers, body: JSON.stringify({})
      }).then(r => r.json())
    ]);

    const svInfo = infoRes.status === 'fulfilled' ? infoRes.value?.data : null;
    const serverTime = serverTimeRes.status === 'fulfilled' ? serverTimeRes.value?.thoigianht : null;

    const resultPayload = {
      success: true,
      syncedAt: new Date().toISOString(),
      serverTime,
      user: {
        id: svInfo?.ma_sv || userObj.userName,
        fullName: svInfo?.ten_day_du || userObj.FullName,
        principal: userObj.principal,
        roles: userObj.roles,
        rawId: idsv,
        dob: svInfo?.ngay_sinh || '',
        gender: (function(raw: any): 'Nam' | 'Nữ' {
          if (raw === undefined || raw === null || raw === '') return 'Nam';
          const str = String(raw).trim().toLowerCase();
          if (str === '0' || str === 'nữ' || str === 'nu' || str === 'female' || str === 'gái' || raw === false) {
            return 'Nữ';
          }
          return 'Nam';
        })(svInfo?.gioi_tinh),
        citizenId: svInfo?.so_cmnd || '',
        status: svInfo?.hien_dien_sv || 'Đang học',
        classCode: svInfo?.lop || '',
        blockCode: svInfo?.khoi || '',
        major: svInfo?.nganh || '',
        faculty: svInfo?.khoa || '',
        degreeLevel: svInfo?.bac_he_dao_tao || '',
        academicYear: svInfo?.nien_khoa || '',
        semesterIn: svInfo?.str_nhhk_vao || 'Học kỳ 1 Năm học 2026-2027',
        semesterOut: svInfo?.str_nhhk_ra || 'Học kỳ 2 Năm học 2030-2031',
        universityName: svInfo?.ten_truong || 'Trường Đại Học Công Nghệ Sài Gòn',
        email: (svInfo?.email && !svInfo.email.includes('@domain.com')) ? svInfo.email : '',
        email2: svInfo?.email2 || '',
        advisor: svInfo?.ho_ten_cvht || ''
      },
      rawLive: {
        info: svInfo,
        schedule: scheduleRes.status === 'fulfilled' ? scheduleRes.value : null,
        tuition: tuitionRes.status === 'fulfilled' ? tuitionRes.value : null,
        grades: gradesRes.status === 'fulfilled' ? gradesRes.value : null,
        notifications: noticesRes.status === 'fulfilled' ? noticesRes.value : null,
        registeredCourses: registeredCoursesRes.status === 'fulfilled' ? registeredCoursesRes.value : null,
        ctdt: ctdtRes.status === 'fulfilled' ? ctdtRes.value : null,
        serverTime: serverTimeRes.status === 'fulfilled' ? serverTimeRes.value : null
      }
    };

    res.statusCode = 200;
    res.end(JSON.stringify(resultPayload));
  } catch (err: any) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message || 'Lỗi kết nối máy chủ STU' }));
  }
}
