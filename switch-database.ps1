# ============================================
# Switch Database Schema
# ============================================
# Usage: .\switch-database.ps1 -Provider [sqlserver|mysql]

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("sqlserver", "mysql")]
    [string]$Provider
)

$schemaDir = ".\prisma"
$mainSchema = "$schemaDir\schema.prisma"
$sqlserverBackup = "$schemaDir\schema-sqlserver.prisma"
$mysqlSchema = "$schemaDir\schema-mysql.prisma"

Write-Host ""
Write-Host "Switching database provider to: $Provider" -ForegroundColor Cyan
Write-Host ""

try {
    if ($Provider -eq "mysql") {
        # Switch to MySQL
        Write-Host "Backing up current schema..." -ForegroundColor Yellow
        
        if (Test-Path $mainSchema) {
            # Only backup if it's the SQL Server version
            $content = Get-Content $mainSchema -Raw
            if ($content -match 'provider\s*=\s*"sqlserver"') {
                Copy-Item $mainSchema $sqlserverBackup -Force
                Write-Host "SUCCESS: Backed up SQL Server schema" -ForegroundColor Green
            }
        }
        
        Write-Host "Switching to MySQL schema..." -ForegroundColor Yellow
        
        if (Test-Path $mysqlSchema) {
            Copy-Item $mysqlSchema $mainSchema -Force
            Write-Host "SUCCESS: MySQL schema activated!" -ForegroundColor Green
        }
        else {
            Write-Host "ERROR: schema-mysql.prisma not found!" -ForegroundColor Red
            exit 1
        }
        
        Write-Host ""
        Write-Host "Generating Prisma Client..." -ForegroundColor Yellow
        npm run db:generate
        
        Write-Host ""
        Write-Host "SUCCESS: Successfully switched to MySQL!" -ForegroundColor Green
        Write-Host "REMINDER: Update DATABASE_URL in .env to point to TiDB Cloud" -ForegroundColor Yellow
        
    }
    elseif ($Provider -eq "sqlserver") {
        # Switch to SQL Server
        Write-Host "Switching to SQL Server schema..." -ForegroundColor Yellow
        
        if (Test-Path $sqlserverBackup) {
            Copy-Item $sqlserverBackup $mainSchema -Force
            Write-Host "SUCCESS: SQL Server schema restored from backup!" -ForegroundColor Green
        }
        else {
            Write-Host "WARNING: No backup found, schema may already be SQL Server" -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "Generating Prisma Client..." -ForegroundColor Yellow
        npm run db:generate
        
        Write-Host ""
        Write-Host "SUCCESS: Successfully switched to SQL Server!" -ForegroundColor Green
        Write-Host "REMINDER: Make sure DATABASE_URL in .env points to your local SQL Server" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Current schema provider: $Provider" -ForegroundColor Cyan
    Write-Host ""
    
}
catch {
    Write-Host ""
    Write-Host "ERROR: Error switching database:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
