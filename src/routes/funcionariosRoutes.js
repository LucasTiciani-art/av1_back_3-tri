const express = require('express');
const {
  listarFuncionarios,
  buscarFuncionarioPorId,
  criarFuncionario,
  atualizarFuncionario,
  removerFuncionario,
} = require('../controllers/funcionariosController');

const router = express.Router();

router.get('/', listarFuncionarios);
router.get('/:id', buscarFuncionarioPorId);
router.post('/', criarFuncionario);
router.put('/:id', atualizarFuncionario);
router.delete('/:id', removerFuncionario);

module.exports = router;
