# Referência Rápida: Node.js e Express

## O que são o Node e o Express

O **Node.js** é uma plataforma que permite ao seu computador entender e executar código JavaScript fora do navegador. Antes do Node, o JavaScript só funcionava dentro de sites (no Chrome, Firefox, etc.). Com o Node, você pode usar JavaScript para criar programas, ferramentas e servidores web, que serão o foco da disciplina.

> **Servidor** = um computador (ou programa) que recebe pedidos da internet e responde com páginas, dados, imagens, etc.


O **Express** é uma biblioteca (um pacote de código pronto) para Node.js que facilita a criação de servidores web. Ele traz algumas funcionalidades prontas que são comuns a maior parte dos servidores.

---

## Instalação Rápida

No nosso projeto, o express já foi configurado como dependência da aplicação, mas para instalar em um projeto novo utilize o comando abaixo:

```bash
npm install express
```

---

## Estrutura Básica de um Servidor Express

Todo servidor Express tem essa "receita básica":

```javascript
// 1. Importe o Express
const express = require('express');

// 2. Cria uma aplicação usando o Express
const app = express();

// 3. Diz ao Express para entender JSON no corpo das requisições
app.use(express.json());

// 4. Define as rotas (os endereços que o servidor responde)
// Teremos exemplos das rotas abaixo

// 5. Liga o servidor na porta 3000
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
```

> **Rota** = um endereço (URL) que o servidor reconhece e sabe como responder.  
> Exemplo: `http://localhost:3000/alunos`

---

## Os 4 Métodos HTTP Básicos

Quando você acessa um site ou app, seu navegador faz **requisições** (pedidos) ao servidor. Os 4 métodos mais comuns são:

| Método | Para que serve? | Analogia |
|--------|----------------|----------|
| **GET** | Buscar/pegar dados | "Abrir o perfil de alguém no TikTok" |
| **POST** | Criar/enviar novos dados | "Postar um comentário no vídeo de alguém" |
| **PUT** | Atualizar dados existentes | "Editar o comentário que você escreveu" |
| **DELETE** | Apagar dados | "Apagar o comentário que você escreveu após levar votos negativos" |

---

## Exemplo 1: Resposta em HTML

Vamos criar uma página simples que aparece no navegador:

```javascript
const express = require('express');
const app = express();

// GET na página inicial
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head><title>Minha Página</title></head>
            <body>
                <h1>Exemplo mega-simples</h1>
                <p>Esta é uma resposta HTML direta</p>
            </body>
        </html>
    `);
});

app.listen(3000, () => {
    console.log('Servidor rodando! Acesse http://localhost:3000');
});
```

> `res.send()` envia uma resposta para quem fez o pedido.  
> Quando você abre `http://localhost:3000` no navegador, vê essa página HTML!

---

## Exemplo 2: Resposta em JSON

JSON é um formato de dados muito usado em APIs (Application Programming Interface), que são um conjunto de regras que estabelece como um programa pode se comunicar com o outro. O JSON é usado por já ser muito parecido com a estrutura de "objetos" do JavaScript (JSON significa JavaScrip Object Notation, ou "Notação de Objetos JavaScript"). É como uma "lista organizada" que programas entendem facilmente:

```javascript
const express = require('express');
const app = express();

// Lista de alunos (nosso "banco de dados" simples)
const alunos = [
    { id: 1, nome: 'Ana', idade: 16 },
    { id: 2, nome: 'Bruno', idade: 17 },
    { id: 3, nome: 'Carla', idade: 15 }
];

// GET - Lista todos os alunos em JSON
app.get('/alunos', (req, res) => {
    res.json(alunos);
});

// GET - Mostra apenas um aluno pelo ID
app.get('/alunos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const aluno = alunos.find(a => a.id === id);
    res.json(aluno);
});

app.listen(3000, () => {
    console.log('Servidor rodando! Acesse http://localhost:3000/alunos');
});
```

> `res.json()` envia dados no formato JSON.  
> Acesse `http://localhost:3000/alunos` e verá a lista inteira.  
> Acesse `http://localhost:3000/alunos/1` e verá só o aluno Ana.

---

## Exemplo 3: Os 4 Métodos (GET, POST, PUT, DELETE)

Abaixo, exemplos mais completos utilizando os 4 métodos:

```javascript
const express = require('express');
const app = express();

// Permite que o servidor entenda JSON no corpo das requisições
app.use(express.json());

// Nosso "banco de dados" em memória
let alunos = [
    { id: 1, nome: 'Ana', idade: 16 },
    { id: 2, nome: 'Bruno', idade: 17 }
];

// ---------- GET ----------
// Busca todos os alunos
app.get('/alunos', (req, res) => {
    res.json(alunos);
});

// Busca um aluno específico pelo ID
app.get('/alunos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const aluno = alunos.find(a => a.id === id);
    res.json(aluno);
});

// ---------- POST ----------
// Cria um novo aluno
app.post('/alunos', (req, res) => {
    const novoAluno = {
        id: alunos.length + 1,
        nome: req.body.nome,
        idade: req.body.idade
    };
    alunos.push(novoAluno);
    res.json(novoAluno);
});

// ---------- PUT ----------
// Atualiza um aluno existente
app.put('/alunos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const aluno = alunos.find(a => a.id === id);
    
    aluno.nome = req.body.nome;
    aluno.idade = req.body.idade;
    
    res.json(aluno);
});

// ---------- DELETE ----------
// Remove um aluno
app.delete('/alunos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    alunos = alunos.filter(a => a.id !== id);
    res.json({ mensagem: 'Aluno removido com sucesso!' });
});

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
```

---

## Como Testar os Métodos?

- **GET**: Basta digitar a URL no navegador. Ex: `http://localhost:3000/alunos`
- **POST, PUT, DELETE**: Use ferramentas como o **Postman** ou extensões do VS Code como **Thunder Client** ou **REST Client**. Também é possível usar o console de desenvolvimento do próprio navegador para criar uma nova requisição.

### Exemplo de como enviar um POST (corpo da requisição em JSON):

```json
{
    "nome": "Daniel",
    "idade": 16
}
```

## Glossário de outros elementos

1. **`req` (request)** = o pedido que chega ao servidor (dados, URL, etc.)
2. **`res` (response)** = a resposta que o servidor envia de volta
3. **`req.params`** = valores que vêm na própria URL (como o `:id`)
4. **`req.body`** = dados que vêm no "corpo" da requisição (usado em POST e PUT)
5. **`app.use(express.json())`** é essencial para o servidor entender JSON!

