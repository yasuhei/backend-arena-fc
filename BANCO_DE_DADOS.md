# 💾 Guia do Banco de Dados

## SQLite (Atual)

### Vantagens
- ✅ **Simples**: Não precisa instalar nada
- ✅ **Leve**: Um arquivo único
- ✅ **Rápido**: Ideal para aplicações pequenas/médias
- ✅ **Portável**: Funciona em qualquer sistema
- ✅ **Confiável**: Transações ACID

### Limitações
- ❌ Não suporta múltiplos escritores simultâneos
- ❌ Não é ideal para aplicações web com muitos usuários
- ❌ Sem recursos avançados de banco

## Migração para PostgreSQL (Futuro)

Se você quiser migrar para PostgreSQL no futuro, aqui está o guia:

### 1. Instalar PostgreSQL
```bash
# Windows (com Chocolatey)
choco install postgresql

# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS (com Homebrew)
brew install postgresql
```

### 2. Instalar dependências Node.js
```bash
cd backend
npm install pg
npm uninstall better-sqlite3
```

### 3. Configurar conexão
```javascript
// database-pg.js
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'arena_fc_user',
  host: 'localhost',
  database: 'arena_fc',
  password: 'sua_senha',
  port: 5432,
});
```

### 4. Criar tabelas PostgreSQL
```sql
-- Conectar ao PostgreSQL
psql -U postgres

-- Criar banco
CREATE DATABASE arena_fc;
CREATE USER arena_fc_user WITH PASSWORD 'sua_senha';
GRANT ALL PRIVILEGES ON DATABASE arena_fc TO arena_fc_user;

-- Conectar ao banco
\c arena_fc

-- Criar tabelas
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  level VARCHAR(1) CHECK (level IN ('A', 'B', 'C')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  team1_players JSONB NOT NULL,
  team2_players JSONB NOT NULL,
  team1_score INTEGER DEFAULT 0,
  team2_score INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Script de migração
```javascript
// migrate-to-pg.js
import Database from 'better-sqlite3';
import pg from 'pg';

const sqlite = new Database('arena_fc.db');
const pgPool = new pg.Pool({
  user: 'arena_fc_user',
  host: 'localhost',
  database: 'arena_fc',
  password: 'sua_senha',
  port: 5432,
});

// Migrar jogadores
const players = sqlite.prepare('SELECT * FROM players').all();
for (const player of players) {
  await pgPool.query(
    'INSERT INTO players (id, name, level, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)',
    [player.id, player.name, player.level, player.created_at, player.updated_at]
  );
}

console.log(`Migrados ${players.length} jogadores`);
```

## Backup e Restore

### Backup Automático
```bash
# Criar backup
node scripts/backup.js create

# Listar backups
node scripts/backup.js list

# Restaurar backup
node scripts/backup.js restore backups/backup_2026-01-12T12-00-00-000Z.db
```

### Backup Manual
```bash
# Copiar arquivo do banco
cp backend/arena_fc.db backup/arena_fc_backup_$(date +%Y%m%d_%H%M%S).db
```

## Monitoramento

### Ver dados diretamente
```bash
# Instalar sqlite3 CLI (se não tiver)
# Windows: choco install sqlite
# Ubuntu: sudo apt install sqlite3
# macOS: brew install sqlite

# Conectar ao banco
sqlite3 backend/arena_fc.db

# Comandos úteis
.tables                    # Listar tabelas
.schema players           # Ver estrutura da tabela
SELECT * FROM players;    # Ver todos os jogadores
SELECT COUNT(*) FROM players GROUP BY level;  # Estatísticas
.quit                     # Sair
```

### Logs do servidor
O servidor já registra todas as operações no console. Para logs em arquivo:

```javascript
// Adicionar ao server.js
import fs from 'fs';

const logFile = 'logs/database.log';
const originalConsoleLog = console.log;

console.log = (...args) => {
  const timestamp = new Date().toISOString();
  const message = `[${timestamp}] ${args.join(' ')}\n`;
  fs.appendFileSync(logFile, message);
  originalConsoleLog(...args);
};
```

## Performance

### Índices (se necessário)
```sql
-- Criar índices para consultas mais rápidas
CREATE INDEX idx_players_level ON players(level);
CREATE INDEX idx_players_name ON players(name);
CREATE INDEX idx_games_date ON games(date);
```

### Otimizações SQLite
```javascript
// Adicionar ao database.js
db.pragma('journal_mode = WAL');  // Write-Ahead Logging
db.pragma('synchronous = NORMAL'); // Melhor performance
db.pragma('cache_size = 1000');    // Cache maior
db.pragma('temp_store = MEMORY');  // Temp tables em memória
```

## Troubleshooting

### Banco corrompido
```bash
# Verificar integridade
sqlite3 arena_fc.db "PRAGMA integrity_check;"

# Reparar (se possível)
sqlite3 arena_fc.db ".recover" | sqlite3 arena_fc_recovered.db
```

### Backup automático diário
```bash
# Adicionar ao crontab (Linux/macOS)
0 2 * * * cd /path/to/backend && node scripts/backup.js create

# Windows Task Scheduler
# Criar tarefa que executa: node scripts/backup.js create
```

### Monitoramento de espaço
```bash
# Ver tamanho do banco
ls -lh backend/arena_fc.db

# Ver estatísticas detalhadas
sqlite3 arena_fc.db "PRAGMA database_list; PRAGMA table_info(players);"
```