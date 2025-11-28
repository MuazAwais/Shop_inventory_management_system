# Admin User Setup Guide

## Creating an Admin User

### Using the Script (Recommended)

Run the admin creation script:

```bash
npm run create-admin
```

This will create an admin user with default credentials:
- **Username:** `admin`
- **Password:** `Admin@123`
- **Name:** `Administrator`

**Custom credentials:**
```bash
npm run create-admin <username> <password> <name>
```

Example:
```bash
npm run create-admin myadmin MyPassword123 "My Admin"
```

**Note:** This script connects directly to your Turso database and requires `.env.local` to be configured with `DATABASE_URL` and `TURSO_AUTH_TOKEN`.

⚠️ **Important:** Change the password immediately after first login!

## Admin Permissions

Admin users have complete access to:
- All dashboard features
- User management
- System settings
- All reports and data
- Full CRUD operations on all resources

## Troubleshooting

### "Admin user already exists"
If you see this message, an admin user already exists. You can:
- Use the existing admin credentials
- Create additional admins through the register page
- Modify the script to allow multiple admins

### "Failed to create admin user"
Check:
1. Database is running and accessible
2. Database migrations have been applied (`npm run db:migrate`)
3. `.env.local` file exists with correct `DATABASE_URL` and `TURSO_AUTH_TOKEN`
4. No connection errors in the console

## Security Notes

- Admin accounts have full system access
- Use strong passwords for admin accounts
- Limit the number of admin users
- Regularly audit admin account activity
- Consider implementing 2FA for admin accounts in production

