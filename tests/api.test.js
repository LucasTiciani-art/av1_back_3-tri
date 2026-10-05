const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs/promises');
const path = require('path');

const app = require('../src/server');

const DB_PATH = path.join(__dirname, '..', 'database.json');

async function restaurarBanco() {
  const dadosOriginais = {
    produtos: [
      { id: 1, nome: 'Teclado Mecânico', sku: 'TEC-001', categoria: 'Periféricos', preco: 349.9, estoque: 25, ativo: true, criadoEm: '2026-01-10T10:00:00Z' },
      { id: 2, nome: 'Mouse Gamer', sku: 'MOU-002', categoria: 'Periféricos', preco: 189.5, estoque: 40, ativo: true, criadoEm: '2026-01-12T14:30:00Z' },
      { id: 3, nome: 'Monitor 27 Polegadas', sku: 'MON-003', categoria: 'Monitores', preco: 1499, estoque: 8, ativo: true, criadoEm: '2026-02-01T09:15:00Z' },
      { id: 4, nome: 'Headset Bluetooth', sku: 'HEA-004', categoria: 'Áudio', preco: 279.99, estoque: 0, ativo: false, criadoEm: '2026-02-05T16:45:00Z' },
      { id: 5, nome: 'Webcam Full HD', sku: 'WEB-005', categoria: 'Periféricos', preco: 229, estoque: 15, ativo: true, criadoEm: '2026-02-20T11:20:00Z' },
      { id: 6, nome: 'SSD 1TB', sku: 'SSD-006', categoria: 'Armazenamento', preco: 459.9, estoque: 30, ativo: true, criadoEm: '2026-03-03T08:00:00Z' },
      { id: 7, nome: 'Hub USB-C', sku: 'HUB-007', categoria: 'Acessórios', preco: 129.9, estoque: 50, ativo: true, criadoEm: '2026-03-15T13:10:00Z' },
      { id: 8, nome: 'Cadeira Ergonômica', sku: 'CAD-008', categoria: 'Móveis', preco: 1899, estoque: 3, ativo: true, criadoEm: '2026-04-02T17:30:00Z' }
    ],
    funcionarios: [
      { id: 1, nome: 'Ana Souza', email: 'ana.souza@empresa.com', cpf: '123.456.789-00', cargo: 'Desenvolvedora', departamento: 'TI', salario: 7500, dataAdmissao: '2023-03-01', ativo: true },
      { id: 2, nome: 'Bruno Lima', email: 'bruno.lima@empresa.com', cpf: '234.567.890-11', cargo: 'Analista de RH', departamento: 'RH', salario: 5200, dataAdmissao: '2022-07-15', ativo: true },
      { id: 3, nome: 'Carla Mendes', email: 'carla.mendes@empresa.com', cpf: '345.678.901-22', cargo: 'Gerente de Projetos', departamento: 'TI', salario: 11000, dataAdmissao: '2020-01-10', ativo: true },
      { id: 4, nome: 'Diego Rocha', email: 'diego.rocha@empresa.com', cpf: '456.789.012-33', cargo: 'Vendedor', departamento: 'Comercial', salario: 3800, dataAdmissao: '2024-05-20', ativo: false },
      { id: 5, nome: 'Eduarda Alves', email: 'eduarda.alves@empresa.com', cpf: '567.890.123-44', cargo: 'Designer', departamento: 'Marketing', salario: 6100, dataAdmissao: '2023-09-04', ativo: true },
      { id: 6, nome: 'Felipe Costa', email: 'felipe.costa@empresa.com', cpf: '678.901.234-55', cargo: 'Contador', departamento: 'Financeiro', salario: 6800, dataAdmissao: '2021-11-08', ativo: true },
      { id: 7, nome: 'Gabriela Nunes', email: 'gabriela.nunes@empresa.com', cpf: '789.012.345-66', cargo: 'Suporte Técnico', departamento: 'TI', salario: 3500, dataAdmissao: '2025-02-17', ativo: true },
      { id: 8, nome: 'Henrique Dias', email: 'henrique.dias@empresa.com', cpf: '890.123.456-77', cargo: 'Analista de Marketing', departamento: 'Marketing', salario: 5600, dataAdmissao: '2024-10-01', ativo: true }
    ]
  };

  await fs.writeFile(DB_PATH, JSON.stringify(dadosOriginais, null, 2), 'utf8');
}

let server;
let port;

test.before(async () => {
  await restaurarBanco();
  server = app.listen(0);
  port = (await new Promise((resolve) => server.once('listening', () => resolve(server.address().port))));
});

test.after(async () => {
  await restaurarBanco();
  await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
});

test('Deve listar produtos', async () => {
  const response = await fetch(`http://localhost:${port}/produtos`);
  assert.equal(response.status, 200);
  const produtos = await response.json();
  assert.equal(produtos.length, 8);
});

test('Deve buscar um produto existente', async () => {
  const response = await fetch(`http://localhost:${port}/produtos/1`);
  assert.equal(response.status, 200);
  const produto = await response.json();
  assert.equal(produto.nome, 'Teclado Mecânico');
});

test('Deve retornar 404 para produto inexistente', async () => {
  const response = await fetch(`http://localhost:${port}/produtos/999`);
  assert.equal(response.status, 404);
  const body = await response.json();
  assert.equal(body.erro, 'Produto não encontrado');
});

test('Deve criar um produto válido', async () => {
  const body = {
    nome: 'Monitor Curvo',
    sku: 'MON-009',
    categoria: 'Monitores',
    preco: 2500,
    estoque: 10,
    ativo: true,
  };

  const response = await fetch(`http://localhost:${port}/produtos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  assert.equal(response.status, 201);
  const data = await response.json();
  assert.equal(data.produto.nome, 'Monitor Curvo');
  await restaurarBanco();
});

test('Deve listar funcionários', async () => {
  const response = await fetch(`http://localhost:${port}/funcionarios`);
  assert.equal(response.status, 200);
  const funcionarios = await response.json();
  assert.equal(funcionarios.length, 8);
});

test('Deve buscar um funcionário existente', async () => {
  const response = await fetch(`http://localhost:${port}/funcionarios/2`);
  assert.equal(response.status, 200);
  const funcionario = await response.json();
  assert.equal(funcionario.nome, 'Bruno Lima');
});

test('Deve retornar 404 para funcionário inexistente', async () => {
  const response = await fetch(`http://localhost:${port}/funcionarios/999`);
  assert.equal(response.status, 404);
  const body = await response.json();
  assert.equal(body.erro, 'Funcionário não encontrado');
});

test('Deve criar um funcionário válido', async () => {
  const body = {
    nome: 'João Pereira',
    email: 'joao.pereira@empresa.com',
    cpf: '999.888.777-66',
    cargo: 'Analista',
    departamento: 'TI',
    salario: 7000,
    dataAdmissao: '2024-11-09',
    ativo: true,
  };

  const response = await fetch(`http://localhost:${port}/funcionarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  assert.equal(response.status, 201);
  const data = await response.json();
  assert.equal(data.funcionario.email, 'joao.pereira@empresa.com');
  await restaurarBanco();
});
