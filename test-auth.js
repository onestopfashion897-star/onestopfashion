const fetch = require('node-fetch');

async function testAuth() {
  try {
    console.log('Testing authentication flow...');
    
    // Test login
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'john@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (loginData.success && loginData.data.token) {
      const token = loginData.data.token;
      console.log('Login successful, testing /api/auth/me with token...');
      
      // Test /api/auth/me with the token
      const meResponse = await fetch('http://localhost:3000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const meData = await meResponse.json();
      console.log('Auth/me response:', meData);
      
      if (meData.success) {
        console.log('✅ Authentication flow is working correctly!');
      } else {
        console.log('❌ Auth/me failed:', meData.error);
      }
    } else {
      console.log('❌ Login failed:', loginData.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAuth();