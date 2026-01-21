const http = require('http');

function post(path, data) {
  return new Promise((resolve, reject) => {
    const json = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(json)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body: body });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(json);
    req.end();
  });
}

(async function(){
  try {
    console.log('Testing mock OTP flow...\n');
    
    console.log('1. Sending send-otp request...');
    const s = await post('/api/auth/send-otp', { phone: '+919999999999' });
    console.log('   Response:', s.status, s.body.success ? '✓' : '✗');
    console.log('   OTP returned:', s.body.otp || 'N/A');

    console.log('\n2. Verifying with OTP "12345" (mock)...');
    const v = await post('/api/auth/verify-otp', { phone: '+919999999999', otp: '12345' });
    console.log('   Response:', v.status, v.body.success ? '✓' : '✗');
    console.log('   Token:', v.body.token ? 'Generated ✓' : 'None');
    console.log('   User ID:', v.body.user?.id || 'N/A');
    
    console.log('\n✓ Mock authentication flow works! Any OTP accepted in dev mode.');
  } catch (e) {
    console.error('Error:', e);
  }
})();
