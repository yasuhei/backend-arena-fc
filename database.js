import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Criar conexão com o banco SQLite
const db = new Database(path.join(__dirname, 'arena_fc.db'));

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

// Criar tabela de jogadores se não existir
const createPlayersTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      rating REAL NOT NULL CHECK (rating >= 0 AND rating <= 5 AND (rating * 2) = CAST((rating * 2) AS INTEGER)),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  db.exec(sql);
};

// Criar tabela de jogos (para futuras funcionalidades)
const createGamesTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      team1_players TEXT NOT NULL, -- JSON array de IDs dos jogadores
      team2_players TEXT NOT NULL, -- JSON array de IDs dos jogadores
      team1_score INTEGER DEFAULT 0,
      team2_score INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  db.exec(sql);
};

// Inicializar banco de dados
const initDatabase = () => {
  createPlayersTable();
  createGamesTable();
  
  console.log('🎯 Banco inicializado - pronto para receber jogadores personalizados!');
  console.log('📝 Use a interface para adicionar seus próprios jogadores');
};

// Inserir jogadores iniciais
const insertInitialPlayers = () => {
  // Não inserir dados iniciais - deixar para o usuário criar sua própria lista
  console.log('🎯 Banco inicializado - pronto para receber jogadores personalizados!');
};

// Operações CRUD para jogadores
export const playerOperations = {
  // Listar todos os jogadores
  getAll: () => {
    const sql = 'SELECT * FROM players ORDER BY name';
    return db.prepare(sql).all();
  },

  // Buscar jogador por ID
  getById: (id) => {
    const sql = 'SELECT * FROM players WHERE id = ?';
    return db.prepare(sql).get(id);
  },

  // Criar novo jogador
  create: (name, rating) => {
    const id = uuidv4();
    const sql = `
      INSERT INTO players (id, name, rating) 
      VALUES (?, ?, ?)
    `;
    
    const result = db.prepare(sql).run(id, name, rating);
    
    if (result.changes > 0) {
      return playerOperations.getById(id);
    }
    return null;
  },

  // Atualizar jogador
  update: (id, name, rating) => {
    const sql = `
      UPDATE players 
      SET name = ?, rating = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    const result = db.prepare(sql).run(name, rating, id);
    
    if (result.changes > 0) {
      return playerOperations.getById(id);
    }
    return null;
  },

  // Remover jogador
  delete: (id) => {
    const player = playerOperations.getById(id);
    if (!player) return null;
    
    const sql = 'DELETE FROM players WHERE id = ?';
    const result = db.prepare(sql).run(id);
    
    return result.changes > 0 ? player : null;
  },

  // Estatísticas
  getStats: () => {
    const totalSql = 'SELECT COUNT(*) as total FROM players';
    const ratingsSql = `
      SELECT rating, COUNT(*) as count 
      FROM players 
      GROUP BY rating
      ORDER BY rating DESC
    `;
    const avgRatingSql = 'SELECT AVG(rating) as average FROM players';
    
    const total = db.prepare(totalSql).get().total;
    const ratings = db.prepare(ratingsSql).all();
    const avgRating = db.prepare(avgRatingSql).get().average || 0;
    
    const byRating = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 };
    ratings.forEach(rating => {
      byRating[rating.rating] = rating.count;
    });
    
    return { 
      total, 
      byRating,
      averageRating: Math.round(avgRating * 100) / 100
    };
  }
};

// Operações para jogos (futuro)
export const gameOperations = {
  // Salvar resultado de jogo
  create: (team1Players, team2Players, team1Score = 0, team2Score = 0) => {
    const id = uuidv4();
    const sql = `
      INSERT INTO games (id, team1_players, team2_players, team1_score, team2_score, status) 
      VALUES (?, ?, ?, ?, ?, 'completed')
    `;
    
    const result = db.prepare(sql).run(
      id, 
      JSON.stringify(team1Players), 
      JSON.stringify(team2Players), 
      team1Score, 
      team2Score
    );
    
    return result.changes > 0 ? id : null;
  },

  // Listar jogos
  getAll: () => {
    const sql = 'SELECT * FROM games ORDER BY date DESC';
    const games = db.prepare(sql).all();
    
    // Parse JSON fields
    return games.map(game => ({
      ...game,
      team1_players: JSON.parse(game.team1_players),
      team2_players: JSON.parse(game.team2_players)
    }));
  }
};

// Inicializar banco ao importar o módulo
initDatabase();

export default db;