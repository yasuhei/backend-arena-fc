import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'arena_fc.db');

// Função para migrar de level para rating
const migrateToRating = () => {
  try {
    const db = new Database(dbPath);
    
    // Verificar se a coluna level ainda existe
    const tableInfo = db.prepare("PRAGMA table_info(players)").all();
    const hasLevelColumn = tableInfo.some(col => col.name === 'level');
    const hasRatingColumn = tableInfo.some(col => col.name === 'rating');
    
    if (!hasLevelColumn) {
      console.log('✅ Migração não necessária - tabela já usa sistema de rating');
      db.close();
      return;
    }
    
    if (hasRatingColumn) {
      console.log('✅ Migração já realizada anteriormente');
      db.close();
      return;
    }
    
    console.log('🔄 Iniciando migração de level para rating...');
    
    // Backup dos dados atuais
    const players = db.prepare('SELECT * FROM players').all();
    console.log(`📊 Encontrados ${players.length} jogadores para migrar`);
    
    // Criar nova tabela com rating
    db.exec(`
      CREATE TABLE players_new (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 5),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Migrar dados convertendo level para rating
    const insertPlayer = db.prepare(`
      INSERT INTO players_new (id, name, rating, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const levelToRating = {
      'A': 4, // Nível A = 4 estrelas
      'B': 3, // Nível B = 3 estrelas  
      'C': 2  // Nível C = 2 estrelas
    };
    
    let migratedCount = 0;
    for (const player of players) {
      const rating = levelToRating[player.level] || 3; // Default para 3 se level inválido
      insertPlayer.run(
        player.id, 
        player.name, 
        rating, 
        player.created_at, 
        player.updated_at
      );
      migratedCount++;
    }
    
    // Substituir tabela antiga pela nova
    db.exec('DROP TABLE players');
    db.exec('ALTER TABLE players_new RENAME TO players');
    
    console.log(`✅ Migração concluída! ${migratedCount} jogadores migrados`);
    console.log('📋 Conversão aplicada:');
    console.log('   Nível A → 4 estrelas');
    console.log('   Nível B → 3 estrelas');
    console.log('   Nível C → 2 estrelas');
    
    db.close();
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  }
};

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateToRating();
}

export { migrateToRating };