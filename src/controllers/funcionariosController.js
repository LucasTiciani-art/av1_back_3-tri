
//PEGAR A BASE DE DADOS
const { lerDatabase, salvarDatabase } = require('../utils/database');
const { validarIdParam, validarFuncionario } = require('../utils/validacoes');


//só para ter o proximo id
function obterProximoId(registros) {
  if (!Array.isArray(registros) || registros.length === 0) {
    return 1;
  }

  return Math.max(...registros.map((item) => Number(item.id) || 0), 0) + 1;
}



//PARA LISTAR OS FUNCIONARIOS
async function listarFuncionarios(req, res) {
  try {
    const database = await lerDatabase();
    return res.status(200).json(database.funcionarios ?? []);//banco de dados dos foncionariios foi carregado até aqui
  } catch (erro) {
    return res.status(500).json({ erro: erro.message || 'Não foi possível acessar o banco de dados' });//aqui não foi
  }
}


//BUSCAR OS FUNCIONARIOS POR ID
async function buscarFuncionarioPorId(req, res) {
  const idValidado = validarIdParam(req.params.id, 'funcionário');

  if (!idValidado.ok) {
    return res.status(400).json({ erro: idValidado.erro });//se a avalidação por ID não der certo
  }

  try {
    const database = await lerDatabase();
    const funcionario = (database.funcionarios ?? []).find((item) => item.id === idValidado.id);

    if (!funcionario) {
      return res.status(404).json({ erro: 'Funcionário não encontrado' });//caso não encontre nenhun id
    }

    return res.status(200).json(funcionario);
  } catch (erro) {
    return res.status(500).json({ erro: erro.message || 'Não foi possível acessar o banco de dados' });//quando não carrega o bd
  }
}


//CRIAR OS FUNCIONARIOS
async function criarFuncionario(req, res) {
  const validacao = validarFuncionario(req.body);

  if (!validacao.ok) {
    return res.status(400).json({ erro: validacao.erro });//se não tiver funcionando a validação
  }

  try {
    const database = await lerDatabase();
    const funcionarios = database.funcionarios ?? [];

    const emailDuplicado = funcionarios.some(
      (item) => item.email.toLowerCase() === validacao.dados.email.toLowerCase(),
    );

    if (emailDuplicado) {
      return res.status(409).json({ erro: 'Já existe um funcionário cadastrado com este email' });//QUNADO TA DUPLICANDO os emails
    }

    const cpfDuplicado = funcionarios.some((item) => item.cpf === validacao.dados.cpf);

    if (cpfDuplicado) {
      return res.status(409).json({ erro: 'Já existe um funcionário cadastrado com este CPF' });//mesma coisa com os cpfs
    }

    const novoFuncionario = {
      id: obterProximoId(funcionarios),
      ...validacao.dados,
    };

    database.funcionarios = [...funcionarios, novoFuncionario];
    await salvarDatabase(database);

    return res.status(201).json({ mensagem: 'Funcionário criado com sucesso', funcionario: novoFuncionario });//aqui deu certo 
  } catch (erro) {
    return res.status(500).json({ erro: erro.message || 'Não foi possível acessar o banco de dados' });//aqui nem o banco ta acessando
  }
}



//ATUALIZAR OS FUNCIONARIOSS
async function atualizarFuncionario(req, res) {
  const idValidado = validarIdParam(req.params.id, 'funcionário');

  if (!idValidado.ok) {
    return res.status(400).json({ erro: idValidado.erro });//se a avalidação por ID não der
  }

  const validacao = validarFuncionario(req.body);

  if (!validacao.ok) {
    return res.status(400).json({ erro: validacao.erro });//se não tiver funcionando a validação
  }

  try {
    const database = await lerDatabase();
    const funcionarios = database.funcionarios ?? [];
    const indice = funcionarios.findIndex((item) => item.id === idValidado.id);

    if (indice === -1) {
      return res.status(404).json({ erro: 'Funcionário não encontrado' });
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
  } catch (erro) {
    return res.status(500).json({ erro: erro.message || 'Não foi possível acessar o banco de dados' });
  }
}




//E AQUI É PRA REMOVER
async function removerFuncionario(req, res) {
  const idValidado = validarIdParam(req.params.id, 'funcionário');

  if (!idValidado.ok) {
    return res.status(400).json({ erro: idValidado.erro });//se a avalidação por ID não der
  }

  try {
    const database = await lerDatabase();
    const funcionarios = database.funcionarios ?? [];
    const indice = funcionarios.findIndex((item) => item.id === idValidado.id);

    if (indice === -1) {
      return res.status(404).json({ erro: 'Funcionário não encontrado' });//não foi encontrado o funcionario
    }

    funcionarios.splice(indice, 1);
    database.funcionarios = funcionarios;
    await salvarDatabase(database);

    return res.status(200).json({ mensagem: 'Funcionário removido com sucesso' });//tudo certo 
  } catch (erro) {
    return res.status(500).json({ erro: erro.message || 'Não foi possível acessar o banco de dados' })//não deu por causa do bd
  }
}

module.exports = {
  listarFuncionarios,
  buscarFuncionarioPorId,
  criarFuncionario,
  atualizarFuncionario,
  removerFuncionario,
};

//e ai Brayam
