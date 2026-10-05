const express = require('express');
const {
  listarProdutos,
  buscarProdutoPorId,
  criarProduto,
  atualizarProduto,
  removerProduto,
} = require('../controllers/produtosController');

const router = express.Router();

router.get('/', listarProdutos);
router.get('/:id', buscarProdutoPorId);
router.post('/', criarProduto);
router.put('/:id', atualizarProduto);
router.delete('/:id', removerProduto);

module.exports = router;
