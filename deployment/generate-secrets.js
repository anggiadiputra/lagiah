#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔐 Generating Secure Secrets for Vercel Deployment\n');

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('JWT_SECRET:');
console.log(jwtSecret);
console.log('');

// Generate NextAuth Secret
const nextAuthSecret = crypto.randomBytes(32).toString('hex');
console.log('NEXTAUTH_SECRET:');
console.log(nextAuthSecret);
console.log('');

// Generate random password for database
const dbPassword = crypto.randomBytes(16).toString('hex');
console.log('Database Password (for reference):');
console.log(dbPassword);
console.log('');

console.log('📋 Copy these values to your Vercel Environment Variables:');
console.log('');
console.log('DATABASE_URL=postgresql://username:password@host:5432/database');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`NEXTAUTH_SECRET=${nextAuthSecret}`);
console.log('NEXTAUTH_URL=https://your-backend.vercel.app');
console.log('CORS_ORIGIN=https://yourdomain.com');
console.log('NODE_ENV=production');
console.log('');
console.log('🔒 Keep these secrets secure and don\'t share them publicly!'); 