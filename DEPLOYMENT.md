# Deployment Guide

This guide covers deploying the Shop Management System to various platforms.

## Prerequisites

1. **Database Setup**: Choose either:
   - **Local SQLite** (for simple deployments)
   - **Turso/libSQL Cloud** (recommended for production)

2. **Environment Variables**: Create a `.env` file with required variables (see `.env.example`)

## Deployment Options

### 1. Vercel (Recommended for Next.js)

Vercel is the easiest way to deploy Next.js applications.

#### Steps:

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables**:
   In Vercel dashboard → Settings → Environment Variables, add:
   ```
   DATABASE_URL=libsql://your-database-url.turso.io
   TURSO_AUTH_TOKEN=your-turso-auth-token
   SESSION_SECRET=your-random-secret-key
   NODE_ENV=production
   ```

4. **Deploy**:
   - Vercel will automatically deploy on every push to main branch
   - Or click "Deploy" button

#### Using Turso Database:

1. Create account at [turso.tech](https://turso.tech)
2. Create a new database
3. Get your database URL and auth token
4. Add them to Vercel environment variables

### 2. Docker Deployment

#### Build and Run Locally:

```bash
# Build the image
docker build -t shop-management .

# Run the container
docker run -p 3000:3000 \
  -e DATABASE_URL="libsql://your-database-url.turso.io" \
  -e TURSO_AUTH_TOKEN="your-token" \
  -e SESSION_SECRET="your-secret" \
  shop-management
```

#### Using Docker Compose:

```bash
# Create .env file with your variables
cp .env.example .env
# Edit .env with your values

# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### 3. Railway

1. **Connect Repository**:
   - Go to [railway.app](https://railway.app)
   - New Project → Deploy from GitHub

2. **Add Environment Variables**:
   - DATABASE_URL
   - TURSO_AUTH_TOKEN
   - SESSION_SECRET
   - NODE_ENV=production

3. **Deploy**: Railway will automatically build and deploy

### 4. Render

1. **Create New Web Service**:
   - Connect your repository
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

2. **Environment Variables**:
   Add all required environment variables in Render dashboard

### 5. Self-Hosted (VPS/Server)

#### Using PM2:

```bash
# Install PM2
npm install -g pm2

# Build the application
npm run build

# Start with PM2
pm2 start npm --name "shop-management" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Using Systemd:

Create `/etc/systemd/system/shop-management.service`:

```ini
[Unit]
Description=Shop Management System
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/sqlite-project
Environment="NODE_ENV=production"
Environment="DATABASE_URL=libsql://your-database-url.turso.io"
Environment="TURSO_AUTH_TOKEN=your-token"
Environment="SESSION_SECRET=your-secret"
ExecStart=/usr/bin/npm start
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable shop-management
sudo systemctl start shop-management
```

## Database Setup for Production

### Option 1: Turso (Recommended)

1. Sign up at [turso.tech](https://turso.tech)
2. Create a database
3. Get connection URL and auth token
4. Set environment variables:
   ```
   DATABASE_URL=libsql://your-db.turso.io
   TURSO_AUTH_TOKEN=your-token
   ```

### Option 2: Local SQLite (Not Recommended for Production)

For local SQLite, ensure the database file is persisted:
- Use volumes in Docker
- Use persistent storage in cloud platforms
- Backup regularly

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database connected and tested
- [ ] Create admin user (run `npm run create-admin` or use API)
- [ ] Test authentication
- [ ] Test sales/receipt functionality
- [ ] Configure shop profile
- [ ] Set up SSL/HTTPS (most platforms do this automatically)
- [ ] Set up monitoring/logging
- [ ] Configure backups for database

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | Database connection URL | Yes | `file:./local.db` |
| `TURSO_AUTH_TOKEN` | Turso auth token (if using Turso) | Conditional | - |
| `SESSION_SECRET` | Secret for session encryption | Yes | - |
| `NODE_ENV` | Environment mode | Yes | `development` |

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check `TURSO_AUTH_TOKEN` if using Turso
- Ensure database is accessible from deployment platform

### Build Failures

- Check Node.js version (requires 18+)
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

### Runtime Errors

- Check environment variables are set correctly
- Verify database migrations are applied
- Check application logs

## Security Considerations

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Use strong `SESSION_SECRET`** - Generate with: `openssl rand -base64 32`
3. **Enable HTTPS** - Most platforms do this automatically
4. **Keep dependencies updated** - Run `npm audit` regularly
5. **Use Turso for production** - Local SQLite files can be lost

## Support

For issues or questions:
- Check application logs
- Review error messages
- Verify environment variables
- Test database connection

