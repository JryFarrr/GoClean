#!/usr/bin/env pwsh
# Test SQL Server TCP/IP Connection on Port 1433

Write-Host ""
Write-Host "🔍 Testing SQL Server TCP/IP Connection..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Port 1433
Write-Host "Test 1: Checking if port 1433 is open..." -ForegroundColor Yellow
try {
    $tcpTest = Test-NetConnection -ComputerName localhost -Port 1433 -WarningAction SilentlyContinue
    if ($tcpTest.TcpTestSucceeded) {
        Write-Host "✅ Port 1433 is OPEN and accessible!" -ForegroundColor Green
    } else {
        Write-Host "❌ Port 1433 is NOT accessible" -ForegroundColor Red
        Write-Host "   Make sure you've enabled TCP/IP and restarted SQL Server" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Cannot test port 1433" -ForegroundColor Red
}

Write-Host ""

# Test 2: SQL Server Connection
Write-Host "Test 2: Testing SQL Server connection..." -ForegroundColor Yellow
try {
    $result = sqlcmd -S "localhost,1433" -U "goclean_user" -P "GoClean2025!" -C -Q "SELECT 'Connected!' AS Status" -h -1 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ SQL Server connection successful!" -ForegroundColor Green
        Write-Host "   Response: $($result.Trim())" -ForegroundColor Gray
    } else {
        Write-Host "❌ SQL Server connection failed" -ForegroundColor Red
        Write-Host "   Error: $result" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Connection test failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 3: Database Access
Write-Host "Test 3: Testing database 'goclean' access..." -ForegroundColor Yellow
try {
    $dbTest = sqlcmd -S "localhost,1433" -U "goclean_user" -P "GoClean2025!" -d "goclean" -C -Q "SELECT DB_NAME() AS CurrentDB" -h -1 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database 'goclean' accessible!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Database test: $dbTest" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Database test failed: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($tcpTest.TcpTestSucceeded) {
    Write-Host "✅ SQL Server is ready for Prisma migration!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Run: npx prisma migrate dev --name init_sqlserver" -ForegroundColor White
    Write-Host "2. Run: npm run db:seed" -ForegroundColor White
    Write-Host "3. Run: npm run dev" -ForegroundColor White
} else {
    Write-Host "❌ Please complete TCP/IP configuration first" -ForegroundColor Red
    Write-Host ""
    Write-Host "Steps:" -ForegroundColor Yellow
    Write-Host "1. Open SQL Server Configuration Manager" -ForegroundColor White
    Write-Host "2. Enable TCP/IP" -ForegroundColor White
    Write-Host "3. Set Port 1433" -ForegroundColor White
    Write-Host "4. Restart SQL Server" -ForegroundColor White
    Write-Host "5. Run this test again: .\test-sqlserver-connection.ps1" -ForegroundColor White
}

Write-Host ""
