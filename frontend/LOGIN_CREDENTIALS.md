# Login Credentials

## Available Users

| Email | Password | Role | Status |
|-------|----------|------|--------|
| `admin@lagiah.com` | `admin123` | ADMIN | ✅ Active |
| `finance@lagiah.com` | `finance123` | FINANCE | ✅ Active |
| `staff@lagiah.com` | `staff123` | STAFF | ✅ Active |
| `viewer@lagiah.com` | `viewer123` | VIEWER | ✅ Active |

## Important Notes

- **Password is `admin123` (not `admin1234`)**
- All users are active and can login
- Backend server must be running on port 3004
- Frontend server must be running on port 5173

## Troubleshooting

If you encounter login issues:

1. Make sure backend server is running: `cd backend && npm run dev`
2. Make sure frontend server is running: `cd frontend && npm run dev`
3. Check that you're using the correct password
4. Clear browser cache and localStorage if needed 