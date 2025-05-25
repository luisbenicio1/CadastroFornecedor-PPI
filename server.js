const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

let fornecedores = [];
const usuarios = 
[
    { username: 'admin', password: 'admin123' }
];
let loggedIn = false;

function checkAuth(req, res, next) 
{
    if (req.path === '/login' || req.path === '/auth' || loggedIn) 
        {
        return next();
    }
    res.redirect('/login');
}

app.use(checkAuth);

app.get('/', (req, res) => 
{
    res.send
    (`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Home</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                nav { background: #f0f0f0; padding: 10px; margin-bottom: 20px; }
                nav a { margin-right: 15px; text-decoration: none; }
                .error { color: red; }
                .success { color: green; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            ${renderMenu()}
            <h1>Bem-vindo ao Sistema de Cadastro</h1>
            <p>Selecione uma opção no menu acima.</p>
        </body>
        </html>
    `);
});

app.get('/cadastro-fornecedor', (req, res) => 
{
    res.send
    (`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Cadastro de Fornecedor</title>
            <style>
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
            </style>
        </head>
        <body>
            ${renderMenu()}
            <h1>Cadastro de Fornecedor</h1>
            <form method="POST" action="/cadastrar-fornecedor">
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
                    <option value="AC">AC</option>
                    <option value="AL">AL</option>
                    <option value="AP">AP</option>
                    <option value="AM">AM</option>
                    <option value="BA">BA</option>
                    <option value="CE">CE</option>
                    <option value="DF">DF</option>
                    <option value="ES">ES</option>
                    <option value="GO">GO</option>
                    <option value="MA">MA</option>
                    <option value="MT">MT</option>
                    <option value="MS">MS</option>
                    <option value="MG">MG</option>
                    <option value="PA">PA</option>
                    <option value="PB">PB</option>
                    <option value="PR">PR</option>
                    <option value="PE">PE</option>
                    <option value="PI">PI</option>
                    <option value="RJ">RJ</option>
                    <option value="RN">RN</option>
                    <option value="RS">RS</option>
                    <option value="RO">RO</option>
                    <option value="RR">RR</option>
                    <option value="SC">SC</option>
                    <option value="SP">SP</option>
                    <option value="SE">SE</option>
                    <option value="TO">TO</option>
                </select>
                
                <label for="cep">CEP:</label>
                <input type="text" id="cep" name="cep" required>
                
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required>
                
                <label for="telefone">Telefone:</label>
                <input type="text" id="telefone" name="telefone" required>
                
                <button type="submit">Cadastrar</button>
            </form>
            
            ${renderFornecedores()}
        </body>
        </html>
    `);
});

app.post('/cadastrar-fornecedor', (req, res) => 
{
    const { cnpj, razao_social, nome_fantasia, endereco, cidade, uf, cep, email, telefone } = req.body;
    
    const camposObrigatorios = 
    [
        { nome: 'CNPJ', valor: cnpj },
        { nome: 'Razão Social', valor: razao_social },
        { nome: 'Nome Fantasia', valor: nome_fantasia },
        { nome: 'Endereço', valor: endereco },
        { nome: 'Cidade', valor: cidade },
        { nome: 'UF', valor: uf },
        { nome: 'CEP', valor: cep },
        { nome: 'Email', valor: email },
        { nome: 'Telefone', valor: telefone }
    ];
    
    const camposVazios = camposObrigatorios.filter(campo => !campo.valor);
    
    if (camposVazios.length > 0) 
    {
        const mensagensErro = camposVazios.map(campo => `${campo.nome} é obrigatório`).join('<br>');
        return res.send
        (`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Erro no Cadastro</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    nav { background: #f0f0f0; padding: 10px; margin-bottom: 20px; }
                    nav a { margin-right: 15px; text-decoration: none; }
                    .error { color: red; }
                </style>
            </head>
            <body>
                ${renderMenu()}
                <h1>Erro no Cadastro</h1>
                <div class="error">${mensagensErro}</div>
                <a href="/cadastro-fornecedor">Voltar ao formulário</a>
            </body>
            </html>
        `);
    }
    
    fornecedores.push(
     {
        cnpj, razao_social, nome_fantasia, endereco, cidade, uf, cep, email, telefone
    });
    
    res.redirect('/cadastro-fornecedor');
});

app.get('/login', (req, res) => 
{
    if (loggedIn)
    {
        return res.redirect('/');
    }
    
    res.send
    (`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Login</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                nav { background: #f0f0f0; padding: 10px; margin-bottom: 20px; }
                nav a { margin-right: 15px; text-decoration: none; }
                .error { color: red; }
                form { max-width: 300px; margin: 0 auto; }
                label { display: block; margin-top: 10px; }
                input { width: 100%; padding: 8px; margin-top: 5px; }
                button { margin-top: 15px; padding: 10px 15px; background: #4CAF50; color: white; border: none; cursor: pointer; }
                button:hover { background: #45a049; }
            </style>
        </head>
        <body>
            ${renderMenu()}
            <h1>Login</h1>
            <form method="POST" action="/auth">
                <label for="username">Usuário:</label>
                <input type="text" id="username" name="username" required>
                
                <label for="password">Senha:</label>
                <input type="password" id="password" name="password" required>
                
                <button type="submit">Entrar</button>
            </form>
        </body>
        </html>
    `);
});

app.post('/auth', (req, res) => 
{
    const { username, password } = req.body;
    const usuario = usuarios.find(u => u.username === username && u.password === password);
    
    if (usuario) 
    {
        loggedIn = true;
        res.send
        (`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Login Bem-sucedido</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    nav { background: #f0f0f0; padding: 10px; margin-bottom: 20px; }
                    nav a { margin-right: 15px; text-decoration: none; }
                    .success { color: green; }
                </style>
            </head>
            <body>
                ${renderMenu()}
                <h1>Login Bem-sucedido</h1>
                <p class="success">Você foi autenticado com sucesso!</p>
                <a href="/">Ir para a página inicial</a>
            </body>
            </html>
        `);
    } else 
    {
        res.send
        (`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Falha no Login</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                    nav { background: #f0f0f0; padding: 10px; margin-bottom: 20px; }
                    nav a { margin-right: 15px; text-decoration: none; }
                    .error { color: red; }
                </style>
            </head>
            <body>
                ${renderMenu()}
                <h1>Falha no Login</h1>
                <p class="error">Usuário ou senha incorretos.</p>
                <a href="/login">Tentar novamente</a>
            </body>
            </html>
        `);
    }
});

app.get('/logout', (req, res) => 
{
    loggedIn = false;
    res.send
    (`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Logout</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                nav { background: #f0f0f0; padding: 10px; margin-bottom: 20px; }
                nav a { margin-right: 15px; text-decoration: none; }
                .success { color: green; }
            </style>
        </head>
        <body>
            ${renderMenu()}
            <h1>Logout</h1>
            <p class="success">Logout efetuado com sucesso!</p>
            <a href="/">Ir para a página inicial</a>
        </body>
        </html>
    `);
});

function renderMenu() 
{
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

function renderFornecedores() 
{
    if (fornecedores.length === 0) 
    {
        return '<p>Nenhum fornecedor cadastrado ainda.</p>';
    }
    
    let html = '<h2>Fornecedores Cadastrados</h2><table><tr><th>CNPJ</th><th>Razão Social</th><th>Nome Fantasia</th><th>Cidade/UF</th></tr>';
    
    fornecedores.forEach(fornecedor => 
    {
        html += `
            <tr>
                <td>${fornecedor.cnpj}</td>
                <td>${fornecedor.razao_social}</td>
                <td>${fornecedor.nome_fantasia}</td>
                <td>${fornecedor.cidade}/${fornecedor.uf}</td>
            </tr>
        `;
    });
    
    html += '</table>';
    return html;
}

app.listen(PORT, () => 
{
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});