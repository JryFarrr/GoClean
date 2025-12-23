# 🔗 MySQL Workbench Setup Guide

Panduan setup MySQL Workbench sebagai alternatif SSMS untuk manage TiDB Cloud database.

---

## 📥 Download & Install

### Windows:

1. **Download:**
   - Buka: https://dev.mysql.com/downloads/workbench/
   - Klik "Download" untuk Windows version
   - No need login, klik "No thanks, just start my download"

2. **Install:**
   - Run installer `.msi`
   - Accept license
   - Choose "Complete" installation
   - Install

### Verify Installation:

```
MySQL Workbench version 8.0+ installed ✅
```

---

## 🔗 Connect to TiDB Cloud

### 1. Get TiDB Connection Details

From TiDB Cloud dashboard:
```
Host:     gateway01.ap-southeast-1.prod.aws.tidbcloud.com
Port:     4000
Username: 4vKxxxxx.root
Password: [your-password]
Database: goclean
```

### 2. Create Connection

1. **Open MySQL Workbench**
2. **Click "+"** next to "MySQL Connections"
3. **Fill Connection Details:**

```
Connection Name: GoClean Production (TiDB Cloud)
Hostname:        gateway01.ap-southeast-1.prod.aws.tidbcloud.com
Port:            4000
Username:        4vKxxxxx.root
Password:        [click "Store in Keychain" and enter]
Default Schema:  goclean
```

4. **SSL Settings:**
   - Click "SSL" tab
   - Use SSL: ✅ Require
   - SSL Mode: REQUIRED

5. **Test Connection:**
   - Click "Test Connection"
   - Success! ✅

6. **Save:**
   - Click "OK"

### 3. Connect

- Double-click connection "GoClean Production"
- Enter password if prompted
- Connected! 🎉

---

## 🎯 Common Tasks

### View Tables

```sql
SHOW TABLES;
```

Output:
```
+-----------------------+
| Tables_in_goclean     |
+-----------------------+
| Area                  |
| DriverLocations       |
| Jalan                 |
| Kategori              |
| Kecamatan             |
| Notification          |
| ObjekPoint            |
| PickupRequest         |
| TPSLocation           |
| TPSProfile            |
| Transaction           |
| User                  |
| WasteItem             |
| WastePrice            |
+-----------------------+
```

### Query Data

```sql
-- View all users
SELECT id, email, name, role, createdAt 
FROM User 
ORDER BY createdAt DESC;

-- View pickup requests
SELECT pr.id, u.name as userName, pr.status, pr.createdAt
FROM PickupRequest pr
JOIN User u ON pr.userId = u.id
ORDER BY pr.createdAt DESC
LIMIT 10;

-- View TPS locations
SELECT name, kecamatan, address, isActive
FROM TPSLocations
ORDER BY kecamatan, name;
```

### Export Data

1. **Server → Data Export**
2. **Select:**
   - Schema: `goclean`
   - Tables: Select all or specific
3. **Export Options:**
   - Export to Self-Contained File
   - Include Create Schema: ✅
4. **File:**
   - Choose location: `C:\backup\goclean-backup.sql`
5. **Start Export**

### Import Data

1. **Server → Data Import**
2. **Import from Self-Contained File:**
   - Select `.sql` file
3. **Default Target Schema:**
   - Select `goclean`
4. **Start Import**

### Create Backup

**Manual:**
```sql
-- Right-click database → "Create Schema Export"
```

**Automated:**
- TiDB Cloud has auto backups
- Every 6 hours
- Retained 7 days

---

## 🔄 Sync Data (SQL Server ↔ TiDB)

### Export dari SQL Server (SSMS)

1. **Open SSMS**
2. **Right-click database `goclean`**
3. **Tasks → Generate Scripts...**
4. **Choose Objects:**
   - Specific tables: Select all
5. **Set Scripting Options:**
   - Save to file: `goclean-data.sql`
   - Advanced → Types of data to script: **Data only**
6. **Generate**

### Import ke TiDB (MySQL Workbench)

1. **Open MySQL Workbench**
2. **Connect to TiDB**
3. **Server → Data Import**
4. **Import from Self-Contained File:**
   - Select `goclean-data.sql`
5. **Start Import**

⚠️ **Note:** SQL Server syntax mungkin perlu penyesuaian untuk MySQL!

### Alternative: Using DBeaver

**DBeaver** supports both SQL Server AND MySQL:

1. **Download:** https://dbeaver.io/
2. **Connect to SQL Server (source)**
3. **Connect to TiDB Cloud (target)**
4. **Right-click table → Export Data →** Choose target database
5. **DBeaver will auto-convert!** ✨

---

## 🛠️ Advanced Features

### ER Diagram

View database relationships:

1. **Database → Reverse Engineer**
2. **Select connection & schema**
3. **Execute**
4. **View visual schema!**

### Query History

```
Query → History
```
Shows all your previous queries!

### SQL Editor Shortcuts

| Action | Shortcut |
|--------|----------|
| Execute | `Ctrl + Enter` |
| Execute All | `Ctrl + Shift + Enter` |
| Format SQL | `Ctrl + B` |
| Auto-complete | `Ctrl + Space` |
| New Query Tab | `Ctrl + T` |

---

## 📊 Performance Monitoring

### Slow Query Log

```sql
-- View slow queries
SELECT * FROM INFORMATION_SCHEMA.SLOW_QUERY;
```

### Connection Status

```sql
SHOW PROCESSLIST;
```

### Database Size

```sql
SELECT 
  table_schema AS 'Database',
  SUM(data_length + index_length) / 1024 / 1024 AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = 'goclean'
GROUP BY table_schema;
```

---

## 🆘 Troubleshooting

### Connection Timeout

**Error:** "Lost connection to MySQL server"

**Fix:**
- Edit Connection → Advanced
- Set `timeout` values:
  ```
  connectTimeout: 60
  readTimeout: 60
  writeTimeout: 60
  ```

### SSL Errors

**Error:** "SSL connection error"

**Fix:**
- SSL tab → Download CA certificate
- Use SSL: Require and Self-Signed

### Authentication Failed

**Error:** "Access denied"

**Check:**
1. ✅ Username format: `{cluster-id}.root`
2. ✅ Password correct
3. ✅ IP whitelisted di TiDB Cloud
4. ✅ Cluster status = Available

---

## 🔄 Compare with SSMS

| Feature | SSMS | MySQL Workbench |
|---------|------|-----------------|
| **Database** | SQL Server | MySQL, TiDB |
| **ER Diagram** | ✅ | ✅ |
| **Query Editor** | ✅ | ✅ |
| **Export/Import** | ✅ | ✅ |
| **Visual Designer** | ✅ | ✅ |
| **Cost** | Free | Free |
| **Platform** | Windows | Windows, Mac, Linux |

**Verdict:** MySQL Workbench adalah SSMS-nya MySQL! 🎯

---

## 💡 Tips

### Save Favorite Queries

Right-click query → **Add to Snippets**

### Multiple Connections

Setup connections untuk:
- **Local:** SQL Server (development)
- **Production:** TiDB Cloud (production)
- **Staging:** TiDB Cloud staging cluster

### Keyboard Productivity

Customize keyboard shortcuts:
```
Edit → Preferences → SQL Editor → SQL Shortcuts
```

---

## ✅ Quick Reference

### Connect to TiDB

```
Host:     [gateway-url].tidbcloud.com
Port:     4000
User:     [cluster-id].root
Password: [your-password]
SSL:      Required
```

### Common Queries

```sql
-- Show all tables
SHOW TABLES;

-- Describe table structure
DESCRIBE User;

-- Count records
SELECT COUNT(*) FROM PickupRequest;

-- Recent activity
SELECT * FROM PickupRequest ORDER BY createdAt DESC LIMIT 10;
```

---

**🎉 MySQL Workbench siap digunakan! Alternative sempurna untuk manage TiDB Cloud database!**

---

## 📚 Related Guides

- [DUAL-DATABASE-SETUP.md](./DUAL-DATABASE-SETUP.md) - Main setup guide
- [TIDB-MIGRATION.md](./TIDB-MIGRATION.md) - TiDB Cloud setup
- [DATA-SYNC-GUIDE.md](./DATA-SYNC-GUIDE.md) - Data synchronization
