const { lerDatabase, salvarDatabase } = require('../utils/database');
const { validarIdParam, validarProduto } = require('../utils/validacoes');


//proximo id
function obterProximoId(registros) {
  if (!Array.isArray(registros) || registros.length === 0) {
    return 1;
  }

  return Math.max(...registros.map((item) => Number(item.id) || 0), 0) + 1;
}


//LISTAR OS PRODUTOS
async function listarProdutos(req, res) {
  try {
    const database = await lerDatabase();
    return res.status(200).json(database.produtos ?? []);//deu certo
  } catch (erro) {
    return res.status(500).json({ erro: erro.message || 'Não foi possível acessar o banco de dados' });//bd não caregoui
  }
}


//BUSCAR PRODUTOS
async function buscarProdutoPorId(req, res) {
  const idValidado = validarIdParam(req.params.id, 'produto');

  if (!idValidado.ok) {
    return res.status(400).json({ erro: idValidado.erro });//se a avalidação por ID não deu certo
  }

  try {
    const database = await lerDatabase();
    const produto = (database.produtos ?? []).find((item) => item.id === idValidado.id);

    if (!produto) {
      return res.status(404).json({ erro: 'Produto não encontrado' });//não encontrou o produto
    }

    return res.status(200).json(produto);//certin
  } catch (erro) {
    return res.status(500).json({ erro: erro.message || 'Não foi possível acessar o banco de dados' });//bd encomodando
  }
}


//CRIAR PRODUTOS
async function criarProduto(req, res) {
  const validacao = validarProduto(req.body);

  if (!validacao.ok) {
    return res.status(400).json({ erro: validacao.erro });//se a avalidação der errado
  }

  try {
    const database = await lerDatabase();

    const skuJaExiste = (database.produtos ?? []).some(
      (item) => item.sku.toLowerCase() === validacao.dados.sku.toLowerCase(),
    );

    if (skuJaExiste) {
      return res.status(409).json({ erro: 'Já existe um produto com este SKU' });//duplicação
    }

    const novoProduto = {//criando
      id: obterProximoId(database.produtos ?? []),
      nome: validacao.dados.nome,
      sku: validacao.dados.sku,
      categoria: validacao.dados.categoria,
      preco: validacao.dados.preco,
      estoque: validacao.dados.estoque,
      ativo: validacao.dados.ativo,
      criadoEm: new Date().toISOString(),
    };

    database.produtos = [...(database.produtos ?? []), novoProduto];
    await salvarDatabase(database);

    return res.status(201).json({ mensagem: 'Produto criado com sucesso', produto: novoProduto });//a criação deu certo
  } catch (erro) {
    if (erro.message === 'Já existe um produto com este SKU') {
      return res.status(409).json({ erro: erro.message });//se quando eu criar algun que eu ja existe
    }

    return res.status(500).json({ erro: erro.message || 'Não foi possível acessar o banco de dados' });//bd taincomodando dnv
  }
}


//ATUALIZAR
async function atualizarProduto(req, res) {
  const idValidado = validarIdParam(req.params.id, 'produto');

  if (!idValidado.ok) {
    return res.status(400).json({ erro: idValidado.erro });//se a avalidação por ID não der
  }

  const validacao = validarProduto(req.body);

  if (!validacao.ok) {
    return res.status(400).json({ erro: validacao.erro }); //se a avalidação não der bom 
  }

  try {
    const database = await lerDatabase();
    const produtos = database.produtos ?? [];
    const indice = produtos.findIndex((item) => item.id === idValidado.id);

    if (indice === -1) {
      return res.status(404).json({ erro: 'Produto não encontrado' });//ta literalmente escrito no lado
    }

    const skuDuplicado = produtos.some(
      (item, index) => index !== indice && item.sku.toLowerCase() === validacao.dados.sku.toLowerCase(),
    );

    if (skuDuplicado) {
      return res.status(409).json({ erro: 'Já existe um produto com este SKU' });//duplicação
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

    return res.status(200).json({ mensagem: 'Produto atualizado com sucesso', produto: produtoAtualizado });//atuaizado certo
  } catch (erro) {
    return res.status(500).json({ erro: erro.message || 'Não foi possível acessar o banco de dados' });//bd deu pal
  }
}


//REMOVER PRODUTOS
async function removerProduto(req, res) {
  const idValidado = validarIdParam(req.params.id, 'produto');

  if (!idValidado.ok) {
    return res.status(400).json({ erro: idValidado.erro });//se a avalidação por ID não der certo
  }

  try {
    const database = await lerDatabase();
    const produtos = database.produtos ?? [];
    const indice = produtos.findIndex((item) => item.id === idValidado.id);

    if (indice === -1) {
      return res.status(404).json({ erro: 'Produto não encontrado' });//não foi possivel encontrar o produto
    }

    produtos.splice(indice, 1);
    database.produtos = produtos;
    await salvarDatabase(database);

    return res.status(200).json({ mensagem: 'Produto removido com sucesso' });//foi removido certo
  } catch (erro) {
    return res.status(500).json({ erro: erro.message || 'Não foi possível acessar o banco de dados' });//banco de dados não foi carregado 
  }
}

module.exports = {
  listarProdutos,
  buscarProdutoPorId,
  criarProduto,
  atualizarProduto,
  removerProduto,
};
