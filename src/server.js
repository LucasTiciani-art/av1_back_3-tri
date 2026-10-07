
//AS BLIBLIOTECAS
const express = require('express');
const { lerDatabase, salvarDatabase } = require('./utils/database');
const { validarIdParam, validarFuncionario, validarProduto } = require('./utils/validacoes');

const app = express();
const PORT = process.env.PORT || 3000;

const asyncHandler = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);



//PEGAR A BASE DE DADOS
function obterProximoId(registros) {
  if (!Array.isArray(registros) || registros.length === 0) {
    return 1;
  }

  return Math.max(...registros.map((item) => Number(item.id) || 0), 0) + 1;
}

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    mensagem: 'API REST de produtos e funcionários em execução',
  });
});



//LISTAR OS PRODUTOS
app.get('/produtos', asyncHandler(async (req, res) => {
  const database = await lerDatabase();
  return res.status(200).json(database.produtos ?? []);
}));



//BUSCAR PRODUTOS
app.get('/produtos/:id', asyncHandler(async (req, res) => {//BUSCAR PRODUTOS
  const idValidado = validarIdParam(req.params.id, 'produto');

  if (!idValidado.ok) {
    return res.status(400).json({ erro: idValidado.erro });
  }

  const database = await lerDatabase();
  const produto = (database.produtos ?? []).find((item) => item.id === idValidado.id);

  if (!produto) {
    return res.status(404).json({ erro: 'Produto não encontrado' });
  }

  return res.status(200).json(produto);
}));



//CRIAR PRODUTOS
app.post('/produtos', asyncHandler(async (req, res) => {
  const validacao = validarProduto(req.body);

  if (!validacao.ok) {
    return res.status(400).json({ erro: validacao.erro });
  }

  const database = await lerDatabase();
  const produtos = database.produtos ?? [];

  const skuJaExiste = produtos.some(
    (item) => item.sku.toLowerCase() === validacao.dados.sku.toLowerCase(),
  );

  if (skuJaExiste) {
    return res.status(409).json({ erro: 'Já existe um produto com este SKU' });
  }

  const novoProduto = {
    id: obterProximoId(produtos),
    nome: validacao.dados.nome,
    sku: validacao.dados.sku,
    categoria: validacao.dados.categoria,
    preco: validacao.dados.preco,
    estoque: validacao.dados.estoque,
    ativo: validacao.dados.ativo,
    criadoEm: new Date().toISOString(),
  };

  database.produtos = [...produtos, novoProduto];
  await salvarDatabase(database);

  return res.status(201).json({ mensagem: 'Produto criado com sucesso', produto: novoProduto });
}));



//ATUALIZAR
app.put('/produtos/:id', asyncHandler(async (req, res) => {
  const idValidado = validarIdParam(req.params.id, 'produto');

  if (!idValidado.ok) {
    return res.status(400).json({ erro: idValidado.erro });//caso não encontre nenhun id
  }

  const validacao = validarProduto(req.body);

  if (!validacao.ok) {
    return res.status(400).json({ erro: validacao.erro });//caso os dados do produto sejam inválidos
  }

  const database = await lerDatabase();
  const produtos = database.produtos ?? [];
  const indice = produtos.findIndex((item) => item.id === idValidado.id);

  if (indice === -1) {
    return res.status(404).json({ erro: 'Produto não encontrado' });//caso não encontre o produto
  }

  const skuDuplicado = produtos.some(
    (item, index) => index !== indice && item.sku.toLowerCase() === validacao.dados.sku.toLowerCase(),
  );

  if (skuDuplicado) {
    return res.status(409).json({ erro: 'Já existe um produto com este SKU' });
  }

  const produtoAtual = produtos[indice];
  const produtoAtualizado = {
    ...produtoAtual,
    ...validacao.dados,
    id: produtoAtual.id,
    criadoEm: produtoAtual.criadoEm,
  };

  produtos[indice] = produtoAtualizado;
  database.produtos = produtos;
  await salvarDatabase(database);

  return res.status(200).json({ mensagem: 'Produto atualizado com sucesso', produto: produtoAtualizado });
}));



//REMOVER PRODUTOS
app.delete('/produtos/:id', asyncHandler(async (req, res) => {
  const idValidado = validarIdParam(req.params.id, 'produto');

  if (!idValidado.ok) {
    return res.status(400).json({ erro: idValidado.erro });//caso não encontre o id
  }

  const database = await lerDatabase();
  const produtos = database.produtos ?? [];
  const indice = produtos.findIndex((item) => item.id === idValidado.id);

  if (indice === -1) {
    return res.status(404).json({ erro: 'Produto não encontrado' });//caso não encontre o produto
  }

  produtos.splice(indice, 1);
  database.produtos = produtos;
  await salvarDatabase(database);

  return res.status(200).json({ mensagem: 'Produto removido com sucesso' });
}));



//PARA LISTAR OS FUNCIONARIOS
app.get('/funcionarios', asyncHandler(async (req, res) => {
  const database = await lerDatabase();
  return res.status(200).json(database.funcionarios ?? []);
}));



//BUSCAR OS FUNCIONARIOS POR ID
app.get('/funcionarios/:id', asyncHandler(async (req, res) => {
  const idValidado = validarIdParam(req.params.id, 'funcionário');

  if (!idValidado.ok) {
    return res.status(400).json({ erro: idValidado.erro });//caso não encontre o id
  }

  const database = await lerDatabase();
  const funcionario = (database.funcionarios ?? []).find((item) => item.id === idValidado.id);

  if (!funcionario) {
    return res.status(404).json({ erro: 'Funcionário não encontrado' });//caso não encontre o funcionário
  }

  return res.status(200).json(funcionario);
}));



//CRIAR OS FUNCIONARIOS
app.post('/funcionarios', asyncHandler(async (req, res) => {
  const validacao = validarFuncionario(req.body);

  if (!validacao.ok) {
    return res.status(400).json({ erro: validacao.erro });
  }

  const database = await lerDatabase();
  const funcionarios = database.funcionarios ?? [];

  const emailDuplicado = funcionarios.some(
    (item) => item.email.toLowerCase() === validacao.dados.email.toLowerCase(),
  );

  if (emailDuplicado) {
    return res.status(409).json({ erro: 'Já existe um funcionário cadastrado com este email' });
  }

  const cpfDuplicado = funcionarios.some((item) => item.cpf === validacao.dados.cpf);

  if (cpfDuplicado) {
    return res.status(409).json({ erro: 'Já existe um funcionário cadastrado com este CPF' });
  }

  const novoFuncionario = {
    id: obterProximoId(funcionarios),
    ...validacao.dados,
  };

  database.funcionarios = [...funcionarios, novoFuncionario];
  await salvarDatabase(database);

  return res.status(201).json({ mensagem: 'Funcionário criado com sucesso', funcionario: novoFuncionario });
}));



//ATUALIZAR OS FUNCIONARIOSS
app.put('/funcionarios/:id', asyncHandler(async (req, res) => {
  const idValidado = validarIdParam(req.params.id, 'funcionário');

  if (!idValidado.ok) {
    return res.status(400).json({ erro: idValidado.erro });//caso não encontre o id
  }

  const validacao = validarFuncionario(req.body);

  if (!validacao.ok) {
    return res.status(400).json({ erro: validacao.erro });//caso os dados do funcionário sejam inválidos
  }

  const database = await lerDatabase();
  const funcionarios = database.funcionarios ?? [];
  const indice = funcionarios.findIndex((item) => item.id === idValidado.id);

  if (indice === -1) {
    return res.status(404).json({ erro: 'Funcionário não encontrado' });//caso não encontre o funcionário
  }

  const emailDuplicado = funcionarios.some(
    (item, index) => index !== indice && item.email.toLowerCase() === validacao.dados.email.toLowerCase(),
  );

  if (emailDuplicado) {
    return res.status(409).json({ erro: 'Já existe um funcionário cadastrado com este email' });
  }

  const cpfDuplicado = funcionarios.some(
    (item, index) => index !== indice && item.cpf === validacao.dados.cpf,
  );

  if (cpfDuplicado) {
    return res.status(409).json({ erro: 'Já existe um funcionário cadastrado com este CPF' });
  }

  const funcionarioAtual = funcionarios[indice];
  const funcionarioAtualizado = {
    ...funcionarioAtual,
    ...validacao.dados,
    id: funcionarioAtual.id,
  };

  funcionarios[indice] = funcionarioAtualizado;
  database.funcionarios = funcionarios;
  await salvarDatabase(database);

  return res.status(200).json({ mensagem: 'Funcionário atualizado com sucesso', funcionario: funcionarioAtualizado });
}));



//E AQUI É PRA REMOVER
app.delete('/funcionarios/:id', asyncHandler(async (req, res) => {
  const idValidado = validarIdParam(req.params.id, 'funcionário');

  if (!idValidado.ok) {
    return res.status(400).json({ erro: idValidado.erro });//caso não encontre o id
  }

  const database = await lerDatabase();
  const funcionarios = database.funcionarios ?? [];
  const indice = funcionarios.findIndex((item) => item.id === idValidado.id);

  if (indice === -1) {
    return res.status(404).json({ erro: 'Funcionário não encontrado' });//caso não encontre o funcionário
  }

  funcionarios.splice(indice, 1);
  database.funcionarios = funcionarios;
  await salvarDatabase(database);

  return res.status(200).json({ mensagem: 'Funcionário removido com sucesso' });
}));


//TRATAMENTO DE ERROS 
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido' });//caso o json seja inválido
  }

  return res.status(500).json({ erro: err.message || 'Erro interno do servidor' });
});

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor em execução na porta ${PORT}`);
  });
}

module.exports = app;


//cansei de fazer brayam jkkkkk