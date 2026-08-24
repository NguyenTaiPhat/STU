import { defineConfig, type Plugin } from 'vite';

function stuLiveBridgePlugin(): Plugin {
  return {
    name: 'stu-live-bridge',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/stu-api/')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.url === '/stu-api/sync-all' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
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

              const [infoRes, scheduleRes, tuitionRes, gradesRes, noticesRes] = await Promise.allSettled([
                fetch('http://amis01.stu.edu.vn/api/dkmh/w-locsinhvieninfo', {
                  method: 'POST', headers, body: JSON.stringify({})
                }).then(r => r.json()),
                fetch('http://amis01.stu.edu.vn/api/sch/w-locdsthongtinlophoctrongngay', {
                  method: 'POST', headers, body: JSON.stringify({})
                }).then(r => r.json()),
                fetch('http://amis01.stu.edu.vn/api/merchant/w-locdsphieubaohocphisinhvien', {
                  method: 'POST', headers, body: JSON.stringify({})
                }).then(r => r.json()),
                fetch('http://amis01.stu.edu.vn/api/srm/w-locketquadiemsinhvien', {
                  method: 'POST', headers, body: JSON.stringify({})
                }).then(r => r.json()),
                fetch('http://amis01.stu.edu.vn/api/dkmh/w-locdsthongbao', {
                  method: 'POST', headers, body: JSON.stringify({})
                }).then(r => r.json())
              ]);

              const svInfo = infoRes.status === 'fulfilled' ? infoRes.value?.data : null;

              const resultPayload = {
                success: true,
                syncedAt: new Date().toISOString(),
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
                  classCode: svInfo?.lop || '',
                  major: svInfo?.nganh || '',
                  faculty: svInfo?.khoa || '',
                  degreeLevel: svInfo?.bac_he_dao_tao || '',
                  academicYear: svInfo?.nien_khoa || '',
                  advisor: svInfo?.ho_ten_cvht || ''
                },
                rawLive: {
                  info: svInfo,
                  schedule: scheduleRes.status === 'fulfilled' ? scheduleRes.value : null,
                  tuition: tuitionRes.status === 'fulfilled' ? tuitionRes.value : null,
                  grades: gradesRes.status === 'fulfilled' ? gradesRes.value : null,
                  notifications: noticesRes.status === 'fulfilled' ? noticesRes.value : null
                }
              };

              res.statusCode = 200;
              res.end(JSON.stringify(resultPayload));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message || 'Lỗi kết nối máy chủ STU' }));
            }
          });
          return;
        }

        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Endpoint không tồn tại' }));
      });
    }
  };
}

export default defineConfig({
  plugins: [stuLiveBridgePlugin()],
  server: {
    port: 3000,
    open: false
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
