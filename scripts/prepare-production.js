// Prepare production build by switching to MySQL schema
const fs = require('fs');
const path = require('path');

console.log('🔄 Preparing production build...');

const schemaDir = path.join(__dirname, '..', 'prisma');
const mysqlSchema = path.join(schemaDir, 'schema-mysql.prisma');
const mainSchema = path.join(schemaDir, 'schema.prisma');
const backupSchema = path.join(schemaDir, 'schema-sqlserver.backup.prisma');

try {
  // Backup current schema
  if (fs.existsSync(mainSchema)) {
    fs.copyFileSync(mainSchema, backupSchema);
    console.log('✅ Backed up SQL Server schema to schema-sqlserver.backup.prisma');
  }

  // Copy MySQL schema to main schema
  if (fs.existsSync(mysqlSchema)) {
    fs.copyFileSync(mysqlSchema, mainSchema);
    console.log('✅ Switched to MySQL schema for production build');
  } else {
    console.error('❌ Error: schema-mysql.prisma not found!');
    process.exit(1);
  }

  console.log('✨ Production build preparation complete!');
} catch (error) {
  console.error('❌ Error preparing production build:', error.message);
  process.exit(1);
}
