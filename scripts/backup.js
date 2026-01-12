import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'arena_fc.db');
const backupDir = path.join(__dirname, '..', 'backups');

// Criar diretório de backup se não existir
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Função para fazer backup
export const createBackup = () => {
  try {
    const db = new Database(dbPath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup_${timestamp}.db`);
    
    db.backup(backupPath);
    db.close();
    
    console.log(`✅ Backup criado: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('❌ Erro ao criar backup:', error);
    throw error;
  }
};

// Função para restaurar backup
export const restoreBackup = (backupPath) => {
  try {
    if (!fs.existsSync(backupPath)) {
      throw new Error('Arquivo de backup não encontrado');
    }
    
    // Fazer backup do banco atual antes de restaurar
    const currentBackup = createBackup();
    console.log(`📦 Backup atual salvo em: ${currentBackup}`);
    
    // Copiar backup para o local do banco principal
    fs.copyFileSync(backupPath, dbPath);
    
    console.log(`✅ Banco restaurado de: ${backupPath}`);
  } catch (error) {
    console.error('❌ Erro ao restaurar backup:', error);
    throw error;
  }
};

// Função para listar backups
export const listBackups = () => {
  try {
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('backup_') && file.endsWith('.db'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        created: fs.statSync(path.join(backupDir, file)).birthtime
      }))
      .sort((a, b) => b.created - a.created);
    
    return files;
  } catch (error) {
    console.error('❌ Erro ao listar backups:', error);
    return [];
  }
};

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  switch (command) {
    case 'create':
      createBackup();
      break;
    case 'restore':
      const backupFile = process.argv[3];
      if (!backupFile) {
        console.error('❌ Especifique o arquivo de backup');
        process.exit(1);
      }
      restoreBackup(backupFile);
      break;
    case 'list':
      const backups = listBackups();
      console.log('📋 Backups disponíveis:');
      backups.forEach((backup, index) => {
        console.log(`${index + 1}. ${backup.name} (${backup.created.toLocaleString()})`);
      });
      break;
    default:
      console.log(`
Uso: node backup.js <comando>

Comandos:
  create                    - Criar novo backup
  restore <arquivo>         - Restaurar backup
  list                      - Listar backups disponíveis

Exemplos:
  node backup.js create
  node backup.js restore backups/backup_2026-01-12T12-00-00-000Z.db
  node backup.js list
      `);
  }
}