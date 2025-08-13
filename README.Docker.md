# Docker Deployment Guide

This guide explains how to deploy the Car Lead Management System using Docker containers.

## Prerequisites

- Docker Engine 20.10+ 
- Docker Compose 2.0+
- 2GB+ RAM available
- 5GB+ disk space

## Quick Start

1. **Clone and setup environment**:
```bash
git clone <your-repository>
cd car-lead-system
cp .env.example .env
```

2. **Configure environment variables**:
```bash
# Edit .env file with your settings
nano .env

# Generate admin password hash
node -e "console.log(require('bcrypt').hashSync('your_admin_password', 10))"
# Copy the output to ADMIN_PASSWORD_HASH in .env
```

3. **Start the application**:
```bash
# Start database and app
docker-compose up -d

# View logs
docker-compose logs -f app
```

4. **Initialize database**:
```bash
# Run database migrations
docker-compose exec app npm run db:push

# Seed with sample data (optional)
docker-compose exec app npm run db:seed
```

5. **Access the application**:
- App: http://localhost:3000
- Database: localhost:5432

## Environment Configuration

### Required Variables
```env
DATABASE_URL=postgresql://postgres:password@postgres:5432/car_leads
SESSION_SECRET=your_32_character_session_secret_here
ADMIN_PASSWORD_HASH=your_bcrypt_hashed_password_here
```

### Optional Variables
```env
NODE_ENV=production
PORT=5000
```

## Production Deployment

### With SSL/Nginx
```bash
# Start with nginx reverse proxy
docker-compose --profile production up -d

# Add SSL certificates to ./ssl/ directory
# Update nginx.conf for your domain
```

### Resource Limits
Add to docker-compose.yml:
```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

## Database Management

### Backup
```bash
docker-compose exec postgres pg_dump -U postgres car_leads > backup.sql
```

### Restore
```bash
cat backup.sql | docker-compose exec -T postgres psql -U postgres car_leads
```

### Access database directly
```bash
docker-compose exec postgres psql -U postgres -d car_leads
```

## Troubleshooting

### Application won't start
```bash
# Check logs
docker-compose logs app

# Verify database connection
docker-compose exec app node -e "require('./server/db')"
```

### Database connection issues
```bash
# Check database status
docker-compose ps postgres
docker-compose logs postgres

# Test connection
docker-compose exec postgres pg_isready -U postgres
```

### Port conflicts
```bash
# Change external ports in docker-compose.yml
ports:
  - "8080:5000"  # Use port 8080 instead of 3000
```

### Reset everything
```bash
docker-compose down -v
docker-compose up -d
```

## Monitoring

### Health Checks
- App health: `curl http://localhost:3000/api/settings`
- Database health: Built into compose file

### Log Management
```bash
# View all logs
docker-compose logs

# Follow logs
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app
```

## Security Notes

1. **Change default passwords** in `.env`
2. **Use strong session secrets** (32+ characters)
3. **Enable SSL** in production with nginx profile
4. **Regular backups** of database
5. **Monitor logs** for suspicious activity
6. **Update images** regularly for security patches

## Performance Optimization

### PostgreSQL Tuning
Add to docker-compose.yml postgres service:
```yaml
command: |
  postgres
  -c max_connections=100
  -c shared_buffers=128MB
  -c effective_cache_size=256MB
```

### App Optimization
```yaml
environment:
  NODE_ENV: production
  UV_THREADPOOL_SIZE: 128
  NODE_OPTIONS: "--max-old-space-size=1024"
```

## Scaling

### Multiple App Instances
```yaml
services:
  app:
    scale: 3  # Run 3 instances
```

### Load Balancer
Use nginx upstream configuration for multiple app instances.

## Support

For issues with this Docker setup:
1. Check logs: `docker-compose logs`
2. Verify environment variables
3. Test database connectivity
4. Check port availability
5. Review Docker documentation