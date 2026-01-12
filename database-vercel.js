import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

// Para Vercel, usar banco em memória
const db = new Database(':memory:');

console.log('🗄️ Usando banco em memória (Vercel)');

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

// Criar tabela de jogadores
const createPlayersTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      rating REAL NOT NULL CHECK (rating >= 0 AND rating <= 5),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  db.exec(sql);
};

// Criar tabela de jogos
const createGamesTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      team1_players TEXT NOT NULL,
      team2_players TEXT NOT NULL,
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
  try {
    createPlayersTable();
    createGamesTable();
    console.log('🎯 Banco em memória inicializado (Vercel)');
  } catch (error) {
    console.error('Erro ao inicializar banco:', error);
  }
};

// Operações CRUD para jogadores
export const playerOperations = {
  // Listar todos os jogadores
  getAll: () => {
    try {
      const sql = 'SELECT * FROM players ORDER BY name';
      return db.prepare(sql).all();
    } catch (error) {
      console.error('Erro ao buscar jogadores:', error);
      return [];
    }
  },

  // Buscar jogador por ID
  getById: (id) => {
    try {
      const sql = 'SELECT * FROM players WHERE id = ?';
      return db.prepare(sql).get(id);
    } catch (error) {
      console.error('Erro ao buscar jogador por ID:', error);
      return null;
    }
  },

  // Criar novo jogador
  create: (name, rating) => {
    try {
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
    } catch (error) {
      console.error('Erro ao criar jogador:', error);
      return null;
    }
  },

  // Atualizar jogador
  update: (id, name, rating) => {
    try {
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
    } catch (error) {
      console.error('Erro ao atualizar jogador:', error);
      return null;
    }
  },

  // Remover jogador
  delete: (id) => {
    try {
      const player = playerOperations.getById(id);
      if (!player) return null;
      
      const sql = 'DELETE FROM players WHERE id = ?';
      const result = db.prepare(sql).run(id);
      
      return result.changes > 0 ? player : null;
    } catch (error) {
      console.error('Erro ao remover jogador:', error);
      return null;
    }
  },

  // Estatísticas
  getStats: () => {
    try {
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
      
      const byRating = { 5: 0, 4.5: 0, 4: 0, 3.5: 0, 3: 0, 2.5: 0, 2: 0, 1.5: 0, 1: 0, 0.5: 0, 0: 0 };
      ratings.forEach(rating => {
        byRating[rating.rating] = rating.count;
      });
      
      return { 
        total, 
        byRating,
        averageRating: Math.round(avgRating * 100) / 100
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return { total: 0, byRating: {}, averageRating: 0 };
    }
  }
};

// Inicializar banco ao importar o módulo
initDatabase();

export default db;