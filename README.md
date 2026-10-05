# API CRUD com Express e database.json

Esta API REST foi construída em Node.js + Express e usa o arquivo `database.json` como armazenamento local.

## Estrutura

```text
api-crud/
├── src/
│   ├── controllers/
│   │   ├── produtosController.js
│   │   └── funcionariosController.js
│   ├── routes/
│   │   ├── produtosRoutes.js
│   │   └── funcionariosRoutes.js
│   ├── utils/
│   │   ├── database.js
│   │   └── validacoes.js
│   └── server.js
├── database.json
├── package.json
└── README.md
```

## Como executar

```bash
npm install
npm start
```

O servidor estará disponível em `http://localhost:3000`.

## Endpoints

### Produtos

- `GET /produtos`
- `GET /produtos/:id`
- `POST /produtos`
- `PUT /produtos/:id`
- `DELETE /produtos/:id`

### Funcionários

- `GET /funcionarios`
- `GET /funcionarios/:id`
- `POST /funcionarios`
- `PUT /funcionarios/:id`
- `DELETE /funcionarios/:id`

## Exemplos

### Criar produto

```bash
curl -X POST http://localhost:3000/produtos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Notebook Gamer",
    "sku": "NOT-009",
    "categoria": "Computadores",
    "preco": 4999.9,
    "estoque": 12,
    "ativo": true
  }'
```

### Buscar funcionário

```bash
curl http://localhost:3000/funcionarios/1
```

## Tratamento de erros

A leitura e gravação no `database.json` usam `try/catch` em funções dedicadas, evitando que falhas de arquivo, JSON inválido ou permissões derrubem o servidor Express. Em caso de erro, a API retorna `500` com mensagem clara.
