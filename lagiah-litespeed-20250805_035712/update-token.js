// Script untuk memperbarui token di localStorage
(function() {
  // Token yang valid dari API login terbaru
  const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZDh3c29kOTAwMDBtbTNoaTVqdHJ1dDkiLCJlbWFpbCI6ImFkbWluQGxhZ2lhaC5jb20iLCJyb2xlIjoiQURNSU4iLCJpc0FjdGl2ZSI6dHJ1ZSwiaWF0IjoxNzUyOTI4MzQ2LCJleHAiOjE3NTU1MjAzNDZ9.Ovhl-0J6gs7CC6ae5W1e1FqFSvQybHbM4qT-aUQV8fg';

  // Simpan token di localStorage
  localStorage.setItem('auth_token', validToken);
  
  console.log('Token berhasil diperbarui di localStorage!');
  console.log('Token baru:', validToken.substring(0, 20) + '...');
  
  // Tambahkan pesan ke halaman
  const messageDiv = document.createElement('div');
  messageDiv.style.padding = '20px';
  messageDiv.style.margin = '20px';
  messageDiv.style.backgroundColor = '#d4edda';
  messageDiv.style.color = '#155724';
  messageDiv.style.borderRadius = '5px';
  messageDiv.style.textAlign = 'center';
  messageDiv.innerHTML = '<h3>Token berhasil diperbarui!</h3><p>Silakan kembali ke aplikasi dan refresh halaman.</p>';
  
  document.body.appendChild(messageDiv);
})(); 