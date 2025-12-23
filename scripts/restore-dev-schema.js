// Restore SQL Server schema after production build
const fs = require('fs');
const path = require('path');

console.log('🔄 Restoring development schema...');

const schemaDir = path.join(__dirname, '..', 'prisma');
const backupSchema = path.join(schemaDir, 'schema-sqlserver.backup.prisma');
const mainSchema = path.join(schemaDir, 'schema.prisma');

try {
    if (fs.existsSync(backupSchema)) {
        fs.copyFileSync(backupSchema, mainSchema);
        console.log('✅ Restored SQL Server schema for local development');

        // Clean up backup
        fs.unlinkSync(backupSchema);
        console.log('✅ Cleaned up backup file');
    } else {
        console.warn('⚠️  No backup schema found, skipping restore');
    }

    console.log('✨ Schema restore complete!');
} catch (error) {
    console.error('❌ Error restoring schema:', error.message);
    process.exit(1);
}
