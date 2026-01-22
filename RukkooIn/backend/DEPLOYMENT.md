# Contabo VPS Deployment Guide

## Prerequisites
- Node.js (v18 or higher)
- PM2 installed globally: `npm install -g pm2`
- MongoDB connection string
- All environment variables configured

## Step 1: Server Setup

### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Install PM2
```bash
sudo npm install -g pm2
```

## Step 2: Deploy Code

### Clone/Upload Code
```bash
cd /root/rukooin/RukkooIn/backend
```

### Install Dependencies
```bash
npm install
```

## Step 3: Environment Variables

Create/Update `.env` file with all required variables:
```env
PORT=5000
NODE_ENV=production
MONGODB_URL=your_mongodb_connection_string
FRONTEND_URL=https://rukkoo.in

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Firebase (if using)
# Add your Firebase service account configuration

# JWT
JWT_SECRET=your_jwt_secret
```

## Step 4: Start with PM2

### Using ecosystem config
```bash
pm2 start ecosystem.config.cjs
```

### Or manually
```bash
pm2 start server.js --name rukoin
```

### Save PM2 configuration
```bash
pm2 save
pm2 startup
```

## Step 5: Check Status

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs rukoin

# View real-time logs
pm2 logs rukoin --lines 50
```

## Step 6: Nginx Configuration (Optional but Recommended)

Create `/etc/nginx/sites-available/rukkoo-backend`:

```nginx
server {
    listen 80;
    server_name api.rukkoo.in;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/rukkoo-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Common Issues & Solutions

### Issue 1: CloudinaryStorage Constructor Error
**Solution:** Already fixed in `utils/cloudinary.js` using `createRequire`

### Issue 2: Port Already in Use
```bash
# Check what's using the port
sudo lsof -i :5000
# Kill the process or change PORT in .env
```

### Issue 3: MongoDB Connection Failed
- Check MongoDB URL in `.env`
- Ensure MongoDB Atlas IP whitelist includes VPS IP
- Check firewall settings

### Issue 4: Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue 5: Permission Denied
```bash
# Fix file permissions
chmod +x server.js
```

### Issue 6: PM2 Not Starting
```bash
# Check PM2 logs
pm2 logs rukoin --err

# Restart PM2
pm2 restart rukoin

# Delete and recreate
pm2 delete rukoin
pm2 start ecosystem.config.cjs
```

## Useful PM2 Commands

```bash
# Restart app
pm2 restart rukoin

# Stop app
pm2 stop rukoin

# Delete app
pm2 delete rukoin

# Monitor
pm2 monit

# View logs
pm2 logs rukoin

# Clear logs
pm2 flush
```

## Firewall Configuration

```bash
# Allow port 5000 (if not using Nginx)
sudo ufw allow 5000/tcp

# Or allow Nginx
sudo ufw allow 'Nginx Full'
```

## SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.rukkoo.in
```



