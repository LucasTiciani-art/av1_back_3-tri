const fs = require('fs/promises');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'database.json');

async function lerDatabase() {
  try {
    const conteudo = await fs.readFile(DB_PATH, 'utf8');

    try {
      return JSON.parse(conteudo);
    } catch (erroParse) {
      throw new Error('JSON inválido ou corrompido');
    }
  } catch (erro) {
    if (erro.code === 'ENOENT') {
      throw new Error('Arquivo de banco de dados não encontrado');
    }

    if (erro.code === 'EACCES' || erro.code === 'EPERM') {
      throw new Error('Sem permissão para acessar o banco de dados');
    }

    throw new Error('Não foi possível acessar o banco de dados');
  }
}

async function salvarDatabase(database) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(database, null, 2), 'utf8');
  } catch (erro) {
    if (erro.code === 'EACCES' || erro.code === 'EPERM') {
      throw new Error('Sem permissão para gravar o banco de dados');
    }

    if (erro.code === 'ENOSPC') {
      throw new Error('Disco cheio ou espaço insuficiente para gravar o banco de dados');
    }

    throw new Error('Não foi possível salvar o banco de dados');
  }
}

module.exports = {
  lerDatabase,
  salvarDatabase,
};
