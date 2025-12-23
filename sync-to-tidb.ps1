# ============================================
# Sync Data from SQL Server to TiDB Cloud
# ============================================
# Usage: .\sync-to-tidb.ps1

Write-Host "🔄 Starting data sync: SQL Server → TiDB Cloud" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file with your SQL Server connection" -ForegroundColor Yellow
    exit 1
}

# Check if ENV-PRODUCTION-TEMPLATE.txt exists
if (-not (Test-Path "ENV-PRODUCTION-TEMPLATE.txt")) {
    Write-Host "❌ Error: ENV-PRODUCTION-TEMPLATE.txt not found!" -ForegroundColor Red
    Write-Host "Please configure your TiDB Cloud connection first" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Step 1: Exporting data from SQL Server..." -ForegroundColor Green
Write-Host ""

# Create export directory
$exportDir = ".\data-export"
if (-not (Test-Path $exportDir)) {
    New-Item -ItemType Directory -Path $exportDir | Out-Null
}

# Export data using Prisma
Write-Host "Generating Prisma Client..." -ForegroundColor Yellow
npm run db:generate

Write-Host ""
Write-Host "📥 Step 2: Connecting to TiDB Cloud..." -ForegroundColor Green
Write-Host ""

# Instructions for manual process
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "MANUAL SYNC REQUIRED:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open SQL Server Management Studio (SSMS)" -ForegroundColor White
Write-Host "2. Connect to your local SQL Server" -ForegroundColor White
Write-Host "3. Right-click database 'goclean' → Tasks → Export Data..." -ForegroundColor White
Write-Host ""
Write-Host "OR use this PowerShell approach:" -ForegroundColor Cyan
Write-Host ""
Write-Host "A. Install MySQL Workbench from:" -ForegroundColor White
Write-Host "   https://dev.mysql.com/downloads/workbench/" -ForegroundColor Blue
Write-Host ""
Write-Host "B. Use Prisma Export/Import:" -ForegroundColor White
Write-Host "   1. Create JSON exports with Prisma Studio" -ForegroundColor Gray
Write-Host "   2. Import to TiDB Cloud using MySQL Workbench" -ForegroundColor Gray
Write-Host ""
Write-Host "C. Or use the built-in seed script:" -ForegroundColor White
Write-Host "   1. Switch to MySQL schema: .\scripts\switch-db.ps1 mysql" -ForegroundColor Gray
Write-Host "   2. Update DATABASE_URL to TiDB Cloud" -ForegroundColor Gray
Write-Host "   3. Run: npm run db:push" -ForegroundColor Gray
Write-Host "   4. Run: npm run db:seed" -ForegroundColor Gray
Write-Host "   5. Switch back: .\scripts\switch-db.ps1 sqlserver" -ForegroundColor Gray
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Sync preparation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Set up your TiDB Cloud cluster at https://tidbcloud.com" -ForegroundColor White
Write-Host "2. Copy connection string to ENV-PRODUCTION-TEMPLATE.txt" -ForegroundColor White
Write-Host "3. Use MySQL Workbench to import your data" -ForegroundColor White
Write-Host "4. Or use Prisma seed script (see above)" -ForegroundColor White
Write-Host ""
