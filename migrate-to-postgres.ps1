#!/usr/bin/env pwsh
# GoClean - Migration to PostgreSQL Script

Write-Host "🚀 GoClean PostgreSQL Migration Script" -ForegroundColor Green
Write-Host ""

# Check if .env exists
if (Test-Path .env) {
    Write-Host "✅ .env file found" -ForegroundColor Green
} else {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "📝 Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  Please edit .env file and add your DATABASE_URL" -ForegroundColor Yellow
    exit 1
}

# Read DATABASE_URL
$env_content = Get-Content .env
$db_url = ($env_content | Select-String "DATABASE_URL").Line

if ($db_url -match "sqlite") {
    Write-Host "❌ DATABASE_URL still using SQLite!" -ForegroundColor Red
    Write-Host "Please update DATABASE_URL to PostgreSQL in .env file" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Example:" -ForegroundColor Cyan
    Write-Host 'DATABASE_URL="postgresql://user:pass@host:5432/dbname?schema=public"' -ForegroundColor White
    exit 1
}

Write-Host "✅ PostgreSQL DATABASE_URL detected" -ForegroundColor Green
Write-Host ""

# Update schema.prisma
Write-Host "📝 Updating prisma/schema.prisma..." -ForegroundColor Yellow
$schema_path = "prisma/schema.prisma"
$schema_content = Get-Content $schema_path -Raw

if ($schema_content -match 'provider\s*=\s*"sqlite"') {
    $schema_content = $schema_content -replace 'provider\s*=\s*"sqlite"', 'provider = "postgresql"'
    $schema_content | Set-Content $schema_path
    Write-Host "✅ Schema updated to PostgreSQL" -ForegroundColor Green
} else {
    Write-Host "✅ Schema already using PostgreSQL" -ForegroundColor Green
}

Write-Host ""

# Generate Prisma Client
Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Yellow
npm run db:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma Client generated" -ForegroundColor Green
Write-Host ""

# Create migration
Write-Host "🗄️  Creating database migration..." -ForegroundColor Yellow
npx prisma migrate dev --name init
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Migration failed" -ForegroundColor Red
    Write-Host "Please check your DATABASE_URL and try again" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Migration created successfully" -ForegroundColor Green
Write-Host ""

# Ask to seed
Write-Host "🌱 Do you want to seed the database? (Y/N)" -ForegroundColor Cyan
$seed = Read-Host
if ($seed -eq "Y" -or $seed -eq "y") {
    Write-Host "🌱 Seeding database..." -ForegroundColor Yellow
    npm run db:seed
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database seeded successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Seeding failed (this is optional)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ Migration to PostgreSQL completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Test locally: npm run dev" -ForegroundColor White
Write-Host "2. Push to GitHub: git add . && git commit -m 'Migrate to PostgreSQL' && git push" -ForegroundColor White
Write-Host "3. Deploy to Vercel: Follow instructions in DEPLOYMENT.md" -ForegroundColor White
Write-Host ""
