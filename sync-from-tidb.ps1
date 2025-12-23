# ============================================
# Sync Data from TiDB Cloud to SQL Server  
# ============================================
# Usage: .\sync-from-tidb.ps1

Write-Host "🔄 Starting data sync: TiDB Cloud → SQL Server" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    exit 1
}

Write-Host "📥 Pulling production data from TiDB Cloud..." -ForegroundColor Green
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "MANUAL SYNC REQUIRED:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1: Using MySQL Workbench" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "1. Open MySQL Workbench" -ForegroundColor White
Write-Host "2. Connect to TiDB Cloud" -ForegroundColor White
Write-Host "3. Server → Data Export → Select 'goclean' database" -ForegroundColor White
Write-Host "4. Export to Self-Contained File (.sql)" -ForegroundColor White
Write-Host "5. Open SSMS → Connect to local SQL Server" -ForegroundColor White
Write-Host "6. Manually recreate tables and import data" -ForegroundColor White
Write-Host ""
Write-Host "Option 2: Using Prisma Studio" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "1. Switch DATABASE_URL to TiDB Cloud (temporarily)" -ForegroundColor White
Write-Host "2. Run: npx prisma studio" -ForegroundColor White
Write-Host "3. Export data manually table by table" -ForegroundColor White
Write-Host "4. Switch back to SQL Server DATABASE_URL" -ForegroundColor White
Write-Host "5. Import data using Prisma Studio" -ForegroundColor White
Write-Host ""
Write-Host "Option 3: Database Migration Tool" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "Use tools like DBeaver or DataGrip for cross-database sync" -ForegroundColor White
Write-Host "- DBeaver: Free, supports both SQL Server and MySQL" -ForegroundColor Gray
Write-Host "- DataGrip: Paid, powerful data sync features" -ForegroundColor Gray
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "⚠️  IMPORTANT:" -ForegroundColor Yellow
Write-Host "- Backup your local SQL Server database first!" -ForegroundColor White
Write-Host "- Data types may differ (VARCHAR vs NVARCHAR)" -ForegroundColor White
Write-Host "- Test imports on a copy of your database" -ForegroundColor White
Write-Host ""

Write-Host "✅ Instructions displayed!" -ForegroundColor Green
Write-Host ""
