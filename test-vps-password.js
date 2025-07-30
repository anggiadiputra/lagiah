const axios = require('axios');

async function testVpsPassword() {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZGs2eTFhMDAwMDBtbWt2ZGY4Zms5MmsiLCJlbWFpbCI6ImFkbWluQGxhZ2lhaC5jb20iLCJyb2xlIjoiQURNSU4iLCJpc0FjdGl2ZSI6dHJ1ZSwiaWF0IjoxNzUzNTQ4NjIyLCJleHAiOjE3NTYxNDA2MjJ9.towywsUO-LKWvaJzUD6fb8vc-MaMPuNwHiBXz1jJSJU';
    
    // First get VPS list to get an ID
    console.log('1. Getting VPS list...');
    const vpsResponse = await axios.get('http://localhost:3004/api/v1/vps', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('VPS List Response:', JSON.stringify(vpsResponse.data, null, 2));
    
    if (vpsResponse.data.data.items.length > 0) {
      const vpsId = vpsResponse.data.data.items[0].id;
      console.log('2. Using VPS ID:', vpsId);
      
      // Get password for this VPS
      console.log('3. Getting VPS password...');
      const passwordResponse = await axios.get(`http://localhost:3004/api/v1/vps/${vpsId}/password`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Password Response:', JSON.stringify(passwordResponse.data, null, 2));
      
      if (passwordResponse.data.status === 'success') {
        console.log('✅ SUCCESS: Password retrieved:', passwordResponse.data.data.password);
      } else {
        console.log('❌ ERROR: Failed to get password');
      }
    } else {
      console.log('❌ No VPS found in list');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testVpsPassword(); 