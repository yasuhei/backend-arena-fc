import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'arena_fc.db');

// Função para migrar para suporte a decimais
const migrateToDecimal = () => {
  try {
    const db = new Database(dbPath);
    
    console.log('🔄 Iniciando migração para suporte a notas decimais...');
    
    // Verificar se há dados para migrar
    const players = db.prepare('SELECT * FROM players').all();
    console.log(`📊 Encontrados ${players.length} jogadores`);
    
    if (players.length === 0) {
      console.log('✅ Nenhum dado para migrar - banco vazio');
      db.close();
      return;
    }
    
    // Criar nova tabela com suporte a decimais
    db.exec(`
      CREATE TABLE players_decimal (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        rating REAL NOT NULL CHECK (rating >= 0 AND rating <= 5 AND (rating * 2) = CAST((rating * 2) AS INTEGER)),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Migrar dados (mantendo os valores atuais)
    const insertPlayer = db.prepare(`
      INSERT INTO players_decimal (id, name, rating, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?)
    `);
    
    let migratedCount = 0;
    for (const player of players) {
      // Manter o rating atual (já deve ser um número válido)
      insertPlayer.run(
        player.id, 
        player.name, 
        player.rating, // Manter valor atual
        player.created_at, 
        player.updated_at
      );
      migratedCount++;
    }
    
    // Substituir tabela antiga pela nova
    db.exec('DROP TABLE players');
    db.exec('ALTER TABLE players_decimal RENAME TO players');
    
    console.log(`✅ Migração concluída! ${migratedCount} jogadores migrados`);
    console.log('🎯 Agora o sistema suporta notas decimais (0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5)');
    
    db.close();
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  }
};

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateToDecimal();
}

export { migrateToDecimal };