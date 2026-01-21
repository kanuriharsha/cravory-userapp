(async () => {
  try {
    const phone = "+917878787878";
    console.log('Sending OTP to', phone);

    const send = await fetch('http://localhost:5000/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    const sendJson = await send.json();
    console.log('send-otp response:', sendJson);

    const otp = sendJson?.otp || '12345';
    console.log('Using OTP:', otp);

    const verify = await fetch('http://localhost:5000/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });
    const verifyJson = await verify.json();
    console.log('verify-otp response:', verifyJson);
  } catch (err) {
    console.error('Test failed', err);
  }
})();
