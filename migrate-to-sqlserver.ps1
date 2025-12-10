#!/usr/bin/env pwsh
# GoClean - Migration to SQL Server Script

Write-Host "🚀 GoClean SQL Server Migration Script" -ForegroundColor Green
Write-Host ""

# Check if .env exists
if (Test-Path .env) {
    Write-Host "✅ .env file found" -ForegroundColor Green
} else {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "📝 Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  Please edit .env file and add your DATABASE_URL" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Example SQL Server URLs:" -ForegroundColor Cyan
    Write-Host "Local: sqlserver://localhost:1433;database=goclean;user=sa;password=Pass123!;encrypt=true;trustServerCertificate=true" -ForegroundColor White
    Write-Host "Azure: sqlserver://server.database.windows.net:1433;database=goclean;user=admin;password=Pass123!;encrypt=true" -ForegroundColor White
    exit 1
}

# Read DATABASE_URL
$env_content = Get-Content .env
$db_url = ($env_content | Select-String "DATABASE_URL").Line

if ($db_url -match "sqlite") {
    Write-Host "❌ DATABASE_URL still using SQLite!" -ForegroundColor Red
    Write-Host "Please update DATABASE_URL to SQL Server in .env file" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "Local SQL Server:" -ForegroundColor Yellow
    Write-Host 'DATABASE_URL="sqlserver://localhost:1433;database=goclean;user=sa;password=YourPass123!;encrypt=true;trustServerCertificate=true"' -ForegroundColor White
    Write-Host ""
    Write-Host "Azure SQL Database:" -ForegroundColor Yellow
    Write-Host 'DATABASE_URL="sqlserver://yourserver.database.windows.net:1433;database=goclean;user=admin;password=YourPass123!;encrypt=true"' -ForegroundColor White
    exit 1
}

if ($db_url -notmatch "sqlserver://") {
    Write-Host "⚠️  DATABASE_URL doesn't look like SQL Server" -ForegroundColor Yellow
    Write-Host "Current: $db_url" -ForegroundColor White
    Write-Host ""
    Write-Host "Do you want to continue anyway? (Y/N)" -ForegroundColor Cyan
    $continue = Read-Host
    if ($continue -ne "Y" -and $continue -ne "y") {
        exit 1
    }
}

Write-Host "✅ SQL Server DATABASE_URL detected" -ForegroundColor Green
Write-Host ""

# Update schema.prisma
Write-Host "📝 Updating prisma/schema.prisma..." -ForegroundColor Yellow
$schema_path = "prisma/schema.prisma"
$schema_content = Get-Content $schema_path -Raw

if ($schema_content -match 'provider\s*=\s*"sqlite"') {
    $schema_content = $schema_content -replace 'provider\s*=\s*"sqlite"', 'provider = "sqlserver"'
    $schema_content | Set-Content $schema_path
    Write-Host "✅ Schema updated to SQL Server" -ForegroundColor Green
} elseif ($schema_content -match 'provider\s*=\s*"postgresql"') {
    $schema_content = $schema_content -replace 'provider\s*=\s*"postgresql"', 'provider = "sqlserver"'
    $schema_content | Set-Content $schema_path
    Write-Host "✅ Schema updated from PostgreSQL to SQL Server" -ForegroundColor Green
} else {
    Write-Host "✅ Schema already using SQL Server" -ForegroundColor Green
}

Write-Host ""

# Install SQL Server driver if needed
Write-Host "📦 Checking SQL Server dependencies..." -ForegroundColor Yellow
$package_json = Get-Content "package.json" -Raw | ConvertFrom-Json
if (-not $package_json.dependencies.Contains("mssql")) {
    Write-Host "Installing mssql driver..." -ForegroundColor Yellow
    npm install mssql
    Write-Host "✅ mssql driver installed" -ForegroundColor Green
} else {
    Write-Host "✅ mssql driver already installed" -ForegroundColor Green
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
Write-Host "This will create tables in your SQL Server database" -ForegroundColor Cyan
npx prisma migrate dev --name init
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Migration failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "1. Check SQL Server is running" -ForegroundColor White
    Write-Host "2. Verify DATABASE_URL credentials" -ForegroundColor White
    Write-Host "3. For Azure SQL: Check firewall allows your IP" -ForegroundColor White
    Write-Host "4. Database must exist (create it first)" -ForegroundColor White
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
        Write-Host ""
        Write-Host "Default users created:" -ForegroundColor Cyan
        Write-Host "User: user1@goclean.id / user123" -ForegroundColor White
        Write-Host "TPS: tps1@goclean.id / tps123" -ForegroundColor White
    } else {
        Write-Host "⚠️  Seeding failed" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✅ Migration to SQL Server completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Test locally: npm run dev" -ForegroundColor White
Write-Host "2. Open Prisma Studio: npm run db:studio" -ForegroundColor White
Write-Host "3. Push to GitHub: git add . && git commit -m 'Migrate to SQL Server' && git push" -ForegroundColor White
Write-Host "4. Deploy to Vercel/Azure: Follow instructions in DEPLOYMENT.md" -ForegroundColor White
Write-Host ""
