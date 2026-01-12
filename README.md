# Backend Arena FC

Backend para gerenciar jogadores do Arena FC.

## Instalação

```bash
cd backend
npm install
```

## Executar

```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start
```

## API Endpoints

### Jogadores

- `GET /api/players` - Lista todos os jogadores
- `POST /api/players` - Cria novo jogador
- `PUT /api/players/:id` - Atualiza jogador
- `DELETE /api/players/:id` - Remove jogador
- `GET /api/players/stats` - Estatísticas dos jogadores

### Exemplos de uso

#### Criar jogador
```bash
curl -X POST http://localhost:3001/api/players \
  -H "Content-Type: application/json" \
  -d '{"name": "Novo Jogador", "level": "B"}'
```

#### Listar jogadores
```bash
curl http://localhost:3001/api/players
```

#### Atualizar jogador
```bash
curl -X PUT http://localhost:3001/api/players/ID_DO_JOGADOR \
  -H "Content-Type: application/json" \
  -d '{"name": "Nome Atualizado", "level": "A"}'
```

#### Remover jogador
```bash
curl -X DELETE http://localhost:3001/api/players/ID_DO_JOGADOR
```

## Estrutura dos Dados

```json
{
  "id": "uuid-gerado-automaticamente",
  "name": "Nome do Jogador",
  "rating": 4 // 0 a 5 estrelas
}
```