// Script to update auth token in localStorage
const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtZDh3c29kOTAwMDBtbTNoaTVqdHJ1dDkiLCJlbWFpbCI6ImFkbWluQGxhZ2lhaC5jb20iLCJyb2xlIjoiQURNSU4iLCJpc0FjdGl2ZSI6dHJ1ZSwiaWF0IjoxNzUyOTI4Mjg2LCJleHAiOjE3NTMwMTQ2ODZ9.WvcZHbrkkyiYMmMol77IKHNt7yzHVKGvY1xiDN5i85I'

console.log('Updating auth token in localStorage...')
localStorage.setItem('auth_token', validToken)
console.log('Token updated successfully!')
console.log('New token:', localStorage.getItem('auth_token')) 