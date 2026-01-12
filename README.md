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

## Deploy na Vercel

1. Instale a CLI da Vercel:
```bash
npm i -g vercel
```

2. Faça login na Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

O projeto está configurado para usar banco em memória na Vercel automaticamente.

## API Endpoints

### Jogadores

- `GET /api/players` - Lista todos os jogadores
- `POST /api/players` - Cria novo jogador
- `PUT /api/players/:id` - Atualiza jogador
- `DELETE /api/players/:id` - Remove jogador
- `GET /api/players/stats` - Estatísticas dos jogadores

### Jogos

- `POST /api/games` - Salva resultado de jogo
- `GET /api/games` - Lista jogos

### Exemplos de uso

#### Criar jogador
```bash
curl -X POST http://localhost:3001/api/players \
  -H "Content-Type: application/json" \
  -d '{"name": "Novo Jogador", "rating": 4.5}'
```

#### Listar jogadores
```bash
curl http://localhost:3001/api/players
```

#### Atualizar jogador
```bash
curl -X PUT http://localhost:3001/api/players/ID_DO_JOGADOR \
  -H "Content-Type: application/json" \
  -d '{"name": "Nome Atualizado", "rating": 3.5}'
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
  "rating": 4.5 // 0 a 5 com incrementos de 0.5
}
```

## Ambiente

- **Desenvolvimento**: Usa SQLite local (`database.js`)
- **Produção (Vercel)**: Usa banco em memória (`database-vercel.js`)