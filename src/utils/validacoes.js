function normalizarTexto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

function validarIdParam(valor, nomeEntidade) {
  const id = Number(valor);

  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, erro: `ID de ${nomeEntidade} inválido` };
  }

  return { ok: true, id };
}

function validarProduto(produto) {
  const dados = produto ?? {};
  const camposObrigatorios = ['nome', 'sku', 'categoria', 'preco', 'estoque', 'ativo'];

  for (const campo of camposObrigatorios) {
    if (!(campo in dados)) {
      return { ok: false, erro: `O campo ${campo} é obrigatório` };
    }
  }

  if (typeof dados.nome !== 'string' || normalizarTexto(dados.nome) === '') {
    return { ok: false, erro: 'O nome do produto deve ser uma string não vazia' };
  }

  if (typeof dados.sku !== 'string' || normalizarTexto(dados.sku) === '') {
    return { ok: false, erro: 'O SKU do produto deve ser uma string não vazia' };
  }

  if (typeof dados.categoria !== 'string' || normalizarTexto(dados.categoria) === '') {
    return { ok: false, erro: 'A categoria do produto deve ser uma string não vazia' };
  }

  if (typeof dados.preco !== 'number' || Number.isNaN(dados.preco) || dados.preco < 0) {
    return { ok: false, erro: 'O preço do produto não pode ser negativo e deve ser numérico' };
  }

  if (!Number.isInteger(dados.estoque) || dados.estoque < 0) {
    return { ok: false, erro: 'O estoque do produto deve ser um inteiro não negativo' };
  }

  if (typeof dados.ativo !== 'boolean') {
    return { ok: false, erro: 'O campo ativo deve ser booleano' };
  }

  return {
    ok: true,
    dados: {
      nome: normalizarTexto(dados.nome),
      sku: normalizarTexto(dados.sku),
      categoria: normalizarTexto(dados.categoria),
      preco: Number(dados.preco),
      estoque: Number(dados.estoque),
      ativo: Boolean(dados.ativo),
    },
  };
}

function validarFuncionario(funcionario) {
  const dados = funcionario ?? {};
  const camposObrigatorios = ['nome', 'email', 'cpf', 'cargo', 'departamento', 'salario', 'dataAdmissao', 'ativo'];

  for (const campo of camposObrigatorios) {
    if (!(campo in dados)) {
      return { ok: false, erro: `O campo ${campo} é obrigatório` };
    }
  }

  if (typeof dados.nome !== 'string' || normalizarTexto(dados.nome) === '') {
    return { ok: false, erro: 'O nome do funcionário deve ser uma string não vazia' };
  }

  if (typeof dados.email !== 'string' || normalizarTexto(dados.email) === '') {
    return { ok: false, erro: 'O email do funcionário deve ser uma string não vazia' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizarTexto(dados.email))) {
    return { ok: false, erro: 'O email do funcionário deve ter um formato válido' };
  }

  if (typeof dados.cpf !== 'string' || normalizarTexto(dados.cpf) === '') {
    return { ok: false, erro: 'O CPF do funcionário deve ser uma string não vazia' };
  }

  if (typeof dados.cargo !== 'string' || normalizarTexto(dados.cargo) === '') {
    return { ok: false, erro: 'O cargo do funcionário deve ser uma string não vazia' };
  }

  if (typeof dados.departamento !== 'string' || normalizarTexto(dados.departamento) === '') {
    return { ok: false, erro: 'O departamento do funcionário deve ser uma string não vazia' };
  }

  if (typeof dados.salario !== 'number' || Number.isNaN(dados.salario) || dados.salario < 0) {
    return { ok: false, erro: 'O salário do funcionário não pode ser negativo e deve ser numérico' };
  }

  if (typeof dados.dataAdmissao !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(normalizarTexto(dados.dataAdmissao))) {
    return { ok: false, erro: 'A data de admissão deve seguir o formato YYYY-MM-DD' };
  }

  const dataValidada = new Date(normalizarTexto(dados.dataAdmissao));
  if (Number.isNaN(dataValidada.getTime())) {
    return { ok: false, erro: 'A data de admissão informada é inválida' };
  }

  if (typeof dados.ativo !== 'boolean') {
    return { ok: false, erro: 'O campo ativo deve ser booleano' };
  }

  return {
    ok: true,
    dados: {
      nome: normalizarTexto(dados.nome),
      email: normalizarTexto(dados.email).toLowerCase(),
      cpf: normalizarTexto(dados.cpf),
      cargo: normalizarTexto(dados.cargo),
      departamento: normalizarTexto(dados.departamento),
      salario: Number(dados.salario),
      dataAdmissao: normalizarTexto(dados.dataAdmissao),
      ativo: Boolean(dados.ativo),
    },
  };
}

module.exports = {
  validarIdParam,
  validarProduto,
  validarFuncionario,
};
