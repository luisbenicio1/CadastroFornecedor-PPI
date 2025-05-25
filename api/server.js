const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

let fornecedores = [];
const usuarios = [
  { username: 'admin', password: 'admin123' }
];
let loggedIn = false;

function checkAuth(req, res, next) {
  const allowedPaths = ['/login', '/auth', '/public', '/favicon.ico'];
  if (allowedPaths.includes(req.path) || loggedIn) {
    return next();
  }
  res.redirect('/login');
}
app.use(checkAuth);

app.use('/public', express.static('public'));

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Home</title>
      <style>${getCommonStyles()}</style>
    </head>
    <body>
      ${renderMenu()}
      <h1>Bem-vindo ao Sistema de Cadastro</h1>
      <p>Selecione uma opção no menu acima.</p>
    </body>
    </html>
  `);
});

app.get('/cadastro-fornecedor', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Cadastro de Fornecedor</title>
      <style>${getCommonStyles()}</style>
    </head>
    <body>
      ${renderMenu()}
      <h1>Cadastro de Fornecedor</h1>
      <form method="POST" action="/cadastrar-fornecedor">
        ${renderFormFields()}
        <button type="submit">Cadastrar</button>
      </form>
      ${renderFornecedores()}
    </body>
    </html>
  `);
});

app.post('/cadastrar-fornecedor', (req, res) => {
  const { cnpj, razao_social, nome_fantasia, endereco, cidade, uf, cep, email, telefone } = req.body;

  const requiredFields = [
    { name: 'CNPJ', value: cnpj },
    { name: 'Razão Social', value: razao_social },
    { name: 'Nome Fantasia', value: nome_fantasia },
    { name: 'Endereço', value: endereco },
    { name: 'Cidade', value: cidade },
    { name: 'UF', value: uf },
    { name: 'CEP', value: cep },
    { name: 'Email', value: email },
    { name: 'Telefone', value: telefone }
  ];
  
  const missingFields = requiredFields.filter(field => !field.value);
  
  if (missingFields.length > 0) {
    const errorMessages = missingFields.map(field => `${field.name} é obrigatório`).join('<br>');
    return res.status(400).send(renderPage('Erro no Cadastro', `
      <h1>Erro no Cadastro</h1>
      <div class="error">${errorMessages}</div>
      <a href="/cadastro-fornecedor">Voltar ao formulário</a>
    `));
  }

  fornecedores.push({
    cnpj, razao_social, nome_fantasia, endereco, cidade, uf, cep, email, telefone,
    id: Date.now().toString()
  });
  
  res.redirect('/cadastro-fornecedor');
});

app.get('/login', (req, res) => {
  if (loggedIn) return res.redirect('/');
  
  res.send(renderPage('Login', `
    <h1>Login</h1>
    <form method="POST" action="/auth">
      <label for="username">Usuário:</label>
      <input type="text" id="username" name="username" required>
      
      <label for="password">Senha:</label>
      <input type="password" id="password" name="password" required>
      
      <button type="submit">Entrar</button>
    </form>
  `));
});

app.post('/auth', (req, res) => {
  const { username, password } = req.body;
  const user = usuarios.find(u => u.username === username && u.password === password);
  
  if (user) {
    loggedIn = true;
    res.send(renderPage('Login Bem-sucedido', `
      <h1>Login Bem-sucedido</h1>
      <p class="success">Você foi autenticado com sucesso!</p>
      <a href="/">Ir para a página inicial</a>
    `));
  } else {
    res.status(401).send(renderPage('Falha no Login', `
      <h1>Falha no Login</h1>
      <p class="error">Usuário ou senha incorretos.</p>
      <a href="/login">Tentar novamente</a>
    `));
  }
});

app.get('/logout', (req, res) => {
  loggedIn = false;
  res.send(renderPage('Logout', `
    <h1>Logout</h1>
    <p class="success">Logout efetuado com sucesso!</p>
    <a href="/">Ir para a página inicial</a>
  `));
});

function renderPage(title, content) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>${getCommonStyles()}</style>
    </head>
    <body>
      ${renderMenu()}
      ${content}
    </body>
    </html>
  `;
}

function getCommonStyles() {
  return `
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
    nav { background: #f0f0f0; padding: 10px; margin-bottom: 20px; }
    nav a { margin-right: 15px; text-decoration: none; }
    .error { color: red; }
    .success { color: green; }
    form { max-width: 600px; margin: 0 auto; }
    label { display: block; margin-top: 10px; }
    input, select { width: 100%; padding: 8px; margin-top: 5px; }
    button { margin-top: 15px; padding: 10px 15px; background: #4CAF50; color: white; border: none; cursor: pointer; }
    button:hover { background: #45a049; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
  `;
}

function renderMenu() {
  return `
    <nav>
      <a href="/">Home</a>
      <a href="/cadastro-fornecedor">Cadastro de Fornecedor</a>
      ${loggedIn 
        ? '<a href="/logout">Logout</a>' 
        : '<a href="/login">Login</a>'
      }
    </nav>
  `;
}

function renderFormFields() {
  return `
    <label for="cnpj">CNPJ:</label>
    <input type="text" id="cnpj" name="cnpj" required>
    
    <label for="razao_social">Razão Social/Nome do Fornecedor:</label>
    <input type="text" id="razao_social" name="razao_social" required>
    
    <label for="nome_fantasia">Nome Fantasia:</label>
    <input type="text" id="nome_fantasia" name="nome_fantasia" required>
    
    <label for="endereco">Endereço:</label>
    <input type="text" id="endereco" name="endereco" required>
    
    <label for="cidade">Cidade:</label>
    <input type="text" id="cidade" name="cidade" required>
    
    <label for="uf">UF:</label>
    <select id="uf" name="uf" required>
      <option value="">Selecione</option>
      ${['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
         'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
         .map(uf => `<option value="${uf}">${uf}</option>`).join('')}
    </select>
    
    <label for="cep">CEP:</label>
    <input type="text" id="cep" name="cep" required>
    
    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>
    
    <label for="telefone">Telefone:</label>
    <input type="text" id="telefone" name="telefone" required>
  `;
}

function renderFornecedores() {
  if (fornecedores.length === 0) return '<p>Nenhum fornecedor cadastrado ainda.</p>';
  
  return `
    <h2>Fornecedores Cadastrados</h2>
    <table>
      <tr>
        <th>CNPJ</th>
        <th>Razão Social</th>
        <th>Nome Fantasia</th>
        <th>Cidade/UF</th>
      </tr>
      ${fornecedores.map(fornecedor => `
        <tr>
          <td>${fornecedor.cnpj}</td>
          <td>${fornecedor.razao_social}</td>
          <td>${fornecedor.nome_fantasia}</td>
          <td>${fornecedor.cidade}/${fornecedor.uf}</td>
        </tr>
      `).join('')}
    </table>
  `;
}

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}
