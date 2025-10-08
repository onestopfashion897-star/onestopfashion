// Test authentication flow
const fetch = require('node-fetch');

async function testAuthFlow() {
  try {
    console.log('Testing authentication flow...');
    
    // Step 1: Login
    console.log('\n1. Logging in...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginData.success) {
      console.error('Login failed!');
      return;
    }
    
    const token = loginData.data.token;
    console.log('Token received:', token.substring(0, 50) + '...');
    
    // Step 2: Test /api/auth/me with the token
    console.log('\n2. Testing /api/auth/me with token...');
    const meResponse = await fetch('http://localhost:3000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const meData = await meResponse.json();
    console.log('Me response status:', meResponse.status);
    console.log('Me response data:', meData);
    
    // Step 3: Simulate what happens on page refresh
    console.log('\n3. Simulating page refresh scenario...');
    console.log('This is what the AuthContext should do:');
    console.log('- Get token from localStorage:', token.substring(0, 50) + '...');
    console.log('- Call /api/auth/me with Authorization header');
    console.log('- If successful, set user state');
    
    if (meResponse.ok && meData.success) {
      console.log('✅ Authentication flow should work correctly!');
      console.log('User should be:', meData.data.user.name, '(' + meData.data.user.email + ')');
    } else {
      console.log('❌ Authentication flow has issues!');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAuthFlow();