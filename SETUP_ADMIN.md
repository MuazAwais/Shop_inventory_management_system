# Admin User Setup Guide

## Creating an Admin User

There are two ways to create an admin user:

### Method 1: Using the Script (Recommended)

Run the admin creation script:

```bash
npm run create-admin
```

This will create an admin user with default credentials:
- **Username:** `admin`
- **Password:** `admin123`
- **Name:** `Administrator`

**Custom credentials:**
```bash
npm run create-admin <username> <password> <name>
```

Example:
```bash
npm run create-admin myadmin mypassword123 "My Admin"
```

### Method 2: Using the Register Page

1. Go to `/register` in your browser
2. Fill in the registration form
3. Select "Admin" from the Role dropdown
4. Submit the form

**Note:** The script method is recommended for the first admin user, as it ensures proper setup.

## Default Admin Credentials

After running the script, you can log in with:
- **Username:** `admin`
- **Password:** `admin123`

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
2. Database migrations have been applied (`npm run db:push`)
3. No connection errors in the console

## Security Notes

- Admin accounts have full system access
- Use strong passwords for admin accounts
- Limit the number of admin users
- Regularly audit admin account activity
- Consider implementing 2FA for admin accounts in production

