const express = require('express');
const produtosRoutes = require('./routes/produtosRoutes');
const funcionariosRoutes = require('./routes/funcionariosRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    mensagem: 'API REST de produtos e funcionários em execução',
  });
});

app.use('/produtos', produtosRoutes);
app.use('/funcionarios', funcionariosRoutes);

app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido' });
  }

  return res.status(500).json({ erro: 'Erro interno do servidor' });
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
