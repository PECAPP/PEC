// test_login.mjs
import fetch from 'node-fetch';

const loginData = {
  email: 'student@pec.edu',
  password: 'password123'
};

try {
  const res = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginData)
  });
  
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Response:', text);
} catch (err) {
  console.error('Error:', err.message);
}
