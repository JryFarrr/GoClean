# GoClean - Setup Script untuk SQL Server Lokal
# Jalankan script ini di PowerShell sebagai Administrator

Write-Host "=========================================" -ForegroundColor Green
Write-Host "GoClean - Local SQL Server Setup Script" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

# Check if SQL Server is running
Write-Host "[1/5] Memeriksa SQL Server..." -ForegroundColor Yellow
$sqlService = Get-Service -Name "MSSQLSERVER" -ErrorAction SilentlyContinue
$sqlExpressService = Get-Service -Name "MSSQL`$SQLEXPRESS" -ErrorAction SilentlyContinue

if ($sqlService -and $sqlService.Status -eq "Running") {
    Write-Host "  ✓ SQL Server sedang berjalan" -ForegroundColor Green
    $serverName = "localhost"
} elseif ($sqlExpressService -and $sqlExpressService.Status -eq "Running") {
    Write-Host "  ✓ SQL Server Express sedang berjalan" -ForegroundColor Green
    $serverName = "localhost\SQLEXPRESS"
} else {
    Write-Host "  ✗ SQL Server tidak ditemukan atau tidak berjalan!" -ForegroundColor Red
    Write-Host "    Pastikan SQL Server sudah terinstall dan service-nya berjalan." -ForegroundColor Red
    Write-Host ""
    Write-Host "  Untuk menginstall SQL Server Express:" -ForegroundColor Yellow
    Write-Host "  https://www.microsoft.com/en-us/sql-server/sql-server-downloads" -ForegroundColor Cyan
    exit 1
}

# Prompt for credentials
Write-Host ""
Write-Host "[2/5] Konfigurasi Database..." -ForegroundColor Yellow
$useWindowsAuth = Read-Host "Gunakan Windows Authentication? (y/n, default: n)"

if ($useWindowsAuth -eq "y" -or $useWindowsAuth -eq "Y") {
    $connectionString = "sqlserver://$serverName;database=goclean;integratedSecurity=true;trustServerCertificate=true"
    Write-Host "  → Menggunakan Windows Authentication" -ForegroundColor Cyan
} else {
    $sqlUser = Read-Host "Masukkan SQL Server username (default: sa)"
    if ([string]::IsNullOrEmpty($sqlUser)) { $sqlUser = "sa" }
    
    $sqlPass = Read-Host "Masukkan SQL Server password" -AsSecureString
    $sqlPassPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sqlPass))
    
    $connectionString = "sqlserver://$serverName`:1433;database=goclean;user=$sqlUser;password=$sqlPassPlain;trustServerCertificate=true"
    Write-Host "  → Menggunakan SQL Authentication dengan user: $sqlUser" -ForegroundColor Cyan
}

# Update .env file
Write-Host ""
Write-Host "[3/5] Mengupdate file .env..." -ForegroundColor Yellow
$envContent = @"
# Environment variables declared in this file are automatically loaded by Prisma.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

# DATABASE - SQL Server Local
DATABASE_URL="$connectionString"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="goclean-secret-key-for-development-only-change-in-production"
"@

Set-Content -Path ".env" -Value $envContent
Write-Host "  ✓ File .env berhasil diupdate" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "[4/5] Menginstall dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Gagal menginstall dependencies!" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Dependencies berhasil diinstall" -ForegroundColor Green

# Generate Prisma client and run migrations
Write-Host ""
Write-Host "[5/5] Setup Database dengan Prisma..." -ForegroundColor Yellow
Write-Host "  → Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Gagal generate Prisma client!" -ForegroundColor Red
    exit 1
}

Write-Host "  → Menjalankan database migrations..." -ForegroundColor Cyan
npx prisma db push
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Gagal menjalankan migrations!" -ForegroundColor Red
    Write-Host "    Pastikan database 'goclean' sudah dibuat di SQL Server." -ForegroundColor Yellow
    Write-Host "    Atau jalankan: CREATE DATABASE goclean; di SSMS" -ForegroundColor Yellow
    exit 1
}
Write-Host "  ✓ Database berhasil di-setup" -ForegroundColor Green

# Seed data (optional)
Write-Host ""
$runSeed = Read-Host "Ingin menjalankan seed data? (y/n, default: y)"
if ($runSeed -ne "n" -and $runSeed -ne "N") {
    Write-Host "  → Menjalankan seed data..." -ForegroundColor Cyan
    npx prisma db seed
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Seed data berhasil dijalankan" -ForegroundColor Green
    } else {
        Write-Host "  ! Seed data gagal (mungkin sudah ada data)" -ForegroundColor Yellow
    }
}

# Done!
Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Setup selesai! 🎉" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Untuk menjalankan aplikasi:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Buka browser di: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Default login:" -ForegroundColor Yellow
Write-Host "  Admin  : admin@goclean.com / admin123" -ForegroundColor Cyan
Write-Host "  TPS    : tps@goclean.com / tps123" -ForegroundColor Cyan
Write-Host "  User   : user@goclean.com / user123" -ForegroundColor Cyan
Write-Host ""
