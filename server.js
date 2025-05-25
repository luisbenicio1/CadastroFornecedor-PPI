
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session(
{
  secret: 'segredo123',
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'ejs');

const usuarios = { admin: '123' };
const fornecedores = [];

function autenticado(req, res, next) 
{
  if (req.session.usuario) next();
  else res.redirect('/login');
}

app.get('/', (req, res) => 
{
  res.render('home', { usuario: req.session.usuario });
});

app.get('/login', (req, res) => 
{
  res.render('login', { erro: null });
});

app.post('/login', (req, res) => 
{
  const { usuario, senha } = req.body;
  if (usuarios[usuario] && usuarios[usuario] === senha) 
  {
    req.session.usuario = usuario;
    res.redirect('/');
  } else 
  {
    res.render('login', { erro: 'Usuário ou senha inválidos.' });
  }
});

app.get('/logout', (req, res) => 
{
  req.session.destroy(() => 
  {
    res.send('<p>Logout efetuado com sucesso! <a href="/">Voltar</a></p>');
  });
});

app.get('/fornecedor', autenticado, (req, res) => 
{
  res.render('fornecedor', { erros: {}, dados: {}, fornecedores });
});

app.post('/fornecedor', autenticado, (req, res) => 
{
  const campos = ['cnpj', 'razao', 'fantasia', 'endereco', 'cidade', 'uf', 'cep', 'email', 'telefone'];
  const dados = {};
  const erros = {};

  campos.forEach(campo => 
  {
    dados[campo] = req.body[campo]?.trim();
    if (!dados[campo]) erros[campo] = 'Campo obrigatório';
  });

  if (Object.keys(erros).length > 0) 
  {
    res.render('fornecedor', { erros, dados, fornecedores });
  } else 
  {
    fornecedores.push(dados);
    res.redirect('/fornecedor');
  }
});

app.listen(3000, () => 
{
  console.log('Servidor rodando em http://localhost:3000');
});
