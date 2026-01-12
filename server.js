import express from 'express';
import cors from 'cors';
import { playerOperations, gameOperations } from './database.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rotas da API

// GET /api/players - Listar todos os jogadores
app.get('/api/players', (req, res) => {
  try {
    const players = playerOperations.getAll();
    res.json(players);
  } catch (error) {
    console.error('Erro ao buscar jogadores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/players - Criar novo jogador
app.post('/api/players', (req, res) => {
  const { name, rating } = req.body;
  
  // Validar se rating é um número válido com incrementos de 0.5
  const isValidRating = (rating) => {
    return typeof rating === 'number' && 
           rating >= 0 && 
           rating <= 5 && 
           (rating * 2) % 1 === 0; // Verifica se é múltiplo de 0.5
  };
  
  if (!name || rating === undefined || !isValidRating(rating)) {
    return res.status(400).json({ 
      error: 'Nome é obrigatório e nota deve ser um número entre 0 e 5 com incrementos de 0.5 (ex: 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5)' 
    });
  }

  try {
    const newPlayer = playerOperations.create(name.trim(), rating);
    if (newPlayer) {
      res.status(201).json(newPlayer);
    } else {
      res.status(500).json({ error: 'Erro ao criar jogador' });
    }
  } catch (error) {
    console.error('Erro ao criar jogador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/players/:id - Atualizar jogador
app.put('/api/players/:id', (req, res) => {
  const { id } = req.params;
  const { name, rating } = req.body;
  
  // Validar se rating é um número válido com incrementos de 0.5
  const isValidRating = (rating) => {
    return typeof rating === 'number' && 
           rating >= 0 && 
           rating <= 5 && 
           (rating * 2) % 1 === 0; // Verifica se é múltiplo de 0.5
  };
  
  if (!name || rating === undefined || !isValidRating(rating)) {
    return res.status(400).json({ 
      error: 'Nome é obrigatório e nota deve ser um número entre 0 e 5 com incrementos de 0.5 (ex: 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5)' 
    });
  }

  try {
    const updatedPlayer = playerOperations.update(id, name.trim(), rating);
    if (updatedPlayer) {
      res.json(updatedPlayer);
    } else {
      res.status(404).json({ error: 'Jogador não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao atualizar jogador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/players/:id - Remover jogador
app.delete('/api/players/:id', (req, res) => {
  const { id } = req.params;
  
  try {
    const deletedPlayer = playerOperations.delete(id);
    if (deletedPlayer) {
      res.json({ message: 'Jogador removido com sucesso', player: deletedPlayer });
    } else {
      res.status(404).json({ error: 'Jogador não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao remover jogador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/players/stats - Estatísticas dos jogadores
app.get('/api/players/stats', (req, res) => {
  try {
    const stats = playerOperations.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/games - Salvar resultado de jogo
app.post('/api/games', (req, res) => {
  const { team1Players, team2Players, team1Score, team2Score } = req.body;
  
  if (!team1Players || !team2Players || !Array.isArray(team1Players) || !Array.isArray(team2Players)) {
    return res.status(400).json({ 
      error: 'team1Players e team2Players são obrigatórios e devem ser arrays' 
    });
  }

  try {
    const gameId = gameOperations.create(team1Players, team2Players, team1Score || 0, team2Score || 0);
    if (gameId) {
      res.status(201).json({ id: gameId, message: 'Jogo salvo com sucesso' });
    } else {
      res.status(500).json({ error: 'Erro ao salvar jogo' });
    }
  } catch (error) {
    console.error('Erro ao salvar jogo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/games - Listar jogos
app.get('/api/games', (req, res) => {
  try {
    const games = gameOperations.getAll();
    res.json(games);
  } catch (error) {
    console.error('Erro ao buscar jogos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}/api/players`);
  console.log(`💾 Banco de dados SQLite inicializado`);
});