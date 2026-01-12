import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', 'arena_fc.db');

// Função para limpar todos os jogadores
const clearAllPlayers = () => {
  try {
    const db = new Database(dbPath);
    
    // Contar jogadores atuais
    const count = db.prepare('SELECT COUNT(*) as count FROM players').get();
    console.log(`📊 Encontrados ${count.count} jogadores no banco`);
    
    if (count.count === 0) {
      console.log('✅ Banco já está vazio - nenhuma ação necessária');
      db.close();
      return;
    }
    
    // Confirmar ação
    console.log('🗑️  Removendo todos os jogadores...');
    
    // Limpar tabela de jogadores
    const result = db.prepare('DELETE FROM players').run();
    
    console.log(`✅ ${result.changes} jogadores removidos com sucesso!`);
    console.log('🎯 Banco agora está vazio e pronto para seus jogadores personalizados');
    
    db.close();
    
  } catch (error) {
    console.error('❌ Erro ao limpar jogadores:', error);
    throw error;
  }
};

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  clearAllPlayers();
}

export { clearAllPlayers };