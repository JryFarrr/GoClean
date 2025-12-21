# 🔧 Cara Enable TCP/IP SQL Server - Step by Step

SQL Server Configuration Manager sudah dibuka. Ikuti langkah berikut:

---

## 📋 Langkah 1: Enable TCP/IP

1. **Di SQL Server Configuration Manager:**
   ```
   [+] SQL Server Network Configuration
       └─> Protocols for MSSQLSERVER
   ```

2. **Di panel kanan, cari "TCP/IP"**
   - Statusnya saat ini: **Disabled** ❌

3. **Enable TCP/IP:**
   - Right-click pada **TCP/IP**
   - Pilih **Properties**
   - Tab **Protocol**
   - Ubah **Enabled** = **Yes** ✅
   - Klik **OK**

---

## 📋 Langkah 2: Set Port 1433

1. **Right-click TCP/IP lagi → Properties**

2. **Pilih tab "IP Addresses"**

3. **Scroll ke bawah sampai ketemu section "IPAll"**
   ```
   IPAll
   ├─ Active: Yes
   ├─ Enabled: Yes
   ├─ TCP Dynamic Ports: 0        ← KOSONGKAN INI
   └─ TCP Port: (empty)           ← ISI DENGAN 1433
   ```

4. **Edit:**
   - **TCP Dynamic Ports**: (kosongkan/hapus)
   - **TCP Port**: `1433`

5. **Klik OK**

---

## 📋 Langkah 3: Restart SQL Server

1. **Di SQL Server Configuration Manager:**
   ```
   [+] SQL Server Services
       └─> SQL Server (MSSQLSERVER)
   ```

2. **Right-click** pada **SQL Server (MSSQLSERVER)**

3. **Pilih "Restart"**

4. **Tunggu sampai Status = Running** ✅

---

## ✅ Verifikasi

Setelah restart selesai, jalankan di PowerShell:

```powershell
# Test koneksi ke port 1433
Test-NetConnection -ComputerName localhost -Port 1433

# Jika berhasil, hasilnya:
# TcpTestSucceeded : True
```

Atau test dengan sqlcmd:
```powershell
sqlcmd -S localhost,1433 -U goclean_user -P GoClean2025! -C -Q "SELECT @@VERSION"
```

---

## 🐛 Troubleshooting

### Port 1433 masih tidak bisa diakses?

**Cek Windows Firewall:**
```powershell
# Allow port 1433
New-NetFirewallRule -DisplayName "SQL Server" -Direction Inbound -Protocol TCP -LocalPort 1433 -Action Allow
```

**Cek SQL Browser Service:**
```powershell
# Start SQL Browser
Set-Service -Name "SQLBrowser" -StartupType Automatic
Start-Service -Name "SQLBrowser"
```

---

## 📝 Summary

Setelah langkah di atas selesai:

✅ TCP/IP: **Enabled**  
✅ Port: **1433**  
✅ SQL Server: **Restarted**  

Lanjut ke migration! 🚀
