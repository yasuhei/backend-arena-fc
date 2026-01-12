import { v4 as uuidv4 } from 'uuid';

// Banco de dados em memória simples (sem SQLite)
let players = [];
let games = [];

console.log('🗄️ Usando banco em memória simples (Vercel)');

// Função para validar rating
const isValidRating = (rating) => {
  return typeof rating === 'number' && 
         rating >= 0 && 
         rating <= 5 && 
         (rating * 2) % 1 === 0;
};

// Operações CRUD para jogadores
export const playerOperations = {
  // Listar todos os jogadores
  getAll: () => {
    try {
      return [...players].sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Erro ao buscar jogadores:', error);
      return [];
    }
  },

  // Buscar jogador por ID
  getById: (id) => {
    try {
      return players.find(p => p.id === id) || null;
    } catch (error) {
      console.error('Erro ao buscar jogador por ID:', error);
      return null;
    }
  },

  // Criar novo jogador
  create: (name, rating) => {
    try {
      if (!name || !isValidRating(rating)) {
        return null;
      }

      const newPlayer = {
        id: uuidv4(),
        name: name.trim(),
        rating: rating,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      players.push(newPlayer);
      return newPlayer;
    } catch (error) {
      console.error('Erro ao criar jogador:', error);
      return null;
    }
  },

  // Atualizar jogador
  update: (id, name, rating) => {
    try {
      if (!name || !isValidRating(rating)) {
        return null;
      }

      const playerIndex = players.findIndex(p => p.id === id);
      if (playerIndex === -1) {
        return null;
      }

      players[playerIndex] = {
        ...players[playerIndex],
        name: name.trim(),
        rating: rating,
        updated_at: new Date().toISOString()
      };

      return players[playerIndex];
    } catch (error) {
      console.error('Erro ao atualizar jogador:', error);
      return null;
    }
  },

  // Remover jogador
  delete: (id) => {
    try {
      const playerIndex = players.findIndex(p => p.id === id);
      if (playerIndex === -1) {
        return null;
      }

      const deletedPlayer = players.splice(playerIndex, 1)[0];
      return deletedPlayer;
    } catch (error) {
      console.error('Erro ao remover jogador:', error);
      return null;
    }
  },

  // Estatísticas
  getStats: () => {
    try {
      const total = players.length;
      const byRating = { 5: 0, 4.5: 0, 4: 0, 3.5: 0, 3: 0, 2.5: 0, 2: 0, 1.5: 0, 1: 0, 0.5: 0, 0: 0 };
      
      let totalRating = 0;
      players.forEach(player => {
        byRating[player.rating] = (byRating[player.rating] || 0) + 1;
        totalRating += player.rating;
      });

      const averageRating = total > 0 ? Math.round((totalRating / total) * 100) / 100 : 0;
      
      return { 
        total, 
        byRating,
        averageRating
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return { total: 0, byRating: {}, averageRating: 0 };
    }
  }
};

// Operações para jogos
export const gameOperations = {
  create: (team1Players, team2Players, team1Score = 0, team2Score = 0) => {
    try {
      const newGame = {
        id: uuidv4(),
        date: new Date().toISOString(),
        team1_players: team1Players,
        team2_players: team2Players,
        team1_score: team1Score,
        team2_score: team2Score,
        status: 'completed',
        created_at: new Date().toISOString()
      };

      games.push(newGame);
      return newGame.id;
    } catch (error) {
      console.error('Erro ao criar jogo:', error);
      return null;
    }
  },

  getAll: () => {
    try {
      return [...games].sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('Erro ao buscar jogos:', error);
      return [];
    }
  }
};

console.log('🎯 Banco em memória simples inicializado');