#  Referência de comandos e sintaxe do SQLite3

##  COMANDOS SQL

- **CREATE TABLE**: Cria uma nova tabela no banco de dados, definindo sua estrutura com colunas, tipos de dados e restrições.  
Exemplo:  
```sql
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE,
    idade INTEGER CHECK(idade >= 0),
    ativo BOOLEAN DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);
```  
Resultado: Cria uma tabela chamada "usuarios" com 6 colunas, incluindo chave primária auto-incrementada, restrições de unicidade e validação de dados.

---

- **IF NOT EXISTS**: Modificador usado com CREATE TABLE para evitar erros caso a tabela já exista.  
Exemplo:  
```sql
CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY,
    nome TEXT NOT NULL,
    preco REAL
);
```  
Resultado: Cria a tabela "produtos" apenas se ela ainda não existir no banco de dados. Se já existir, o comando é ignorado silenciosamente.

---

- **INSERT INTO**: Insere novos registros (linhas) em uma tabela existente.  
Exemplo:  
```sql
INSERT INTO usuarios (nome, email, idade) 
VALUES ('Maria Silva', 'maria@email.com', 28);
```  
Resultado: Adiciona um novo registro na tabela "usuarios" com os valores especificados para nome, email e idade.

---

- **UPDATE**: Modifica valores existentes em registros de uma tabela.  
Exemplo:  
```sql
UPDATE usuarios 
SET idade = 29, email = 'maria.nova@email.com' 
WHERE id = 1;
```  
Resultado: Atualiza o registro com id=1, alterando a idade para 29 e o email para o novo valor.

---

- **DELETE**: Remove registros de uma tabela.  
Exemplo:  
```sql
DELETE FROM usuarios 
WHERE id = 1;
```  
Resultado: Remove permanentemente o registro com id=1 da tabela "usuarios".

---

- **SELECT**: Recupera dados de uma ou mais tabelas. É o comando mais utilizado para consultas.  
Exemplo:  
```sql
SELECT nome, email, idade 
FROM usuarios 
WHERE ativo = 1;
```  
Resultado: Retorna todas as colunas nome, email e idade dos usuários onde a coluna "ativo" é igual a 1 (verdadeiro).

---

- **WHERE**: Clausula que filtra registros baseado em condições específicas.  
Exemplo:  
```sql
SELECT * FROM produtos 
WHERE preco > 50 AND estoque > 0;
```  
Resultado: Retorna todos os produtos com preço maior que 50 E que possuem estoque disponível.

---

- **ORDER BY**: Ordena os resultados da consulta em ordem ascendente (ASC) ou descendente (DESC).  
Exemplo:  
```sql
SELECT nome, preco FROM produtos 
WHERE categoria = 'Eletrônicos' 
ORDER BY preco DESC;
```  
Resultado: Lista produtos da categoria "Eletrônicos" ordenados do maior para o menor preço.

---

- **LIMIT**: Restringe o número de registros retornados pela consulta.  
Exemplo:  
```sql
SELECT * FROM usuarios 
ORDER BY criado_em DESC 
LIMIT 10;
```  
Resultado: Retorna apenas os 10 usuários mais recentemente cadastrados, ordenados do mais novo para o mais antigo.

---

##  TIPOS DE DADOS

- **VARCHAR**: Tipo de dados para armazenar strings de texto com comprimento variável. No SQLite3, é tratado como TEXT.  
Exemplo:  
```sql
CREATE TABLE clientes (
    nome VARCHAR(100),
    telefone VARCHAR(20)
);
INSERT INTO clientes (nome, telefone) VALUES ('João Pedro', '(11) 98765-4321');
```  
Resultado: Cria colunas que armazenam textos com limites de caracteres sugeridos (100 e 20), embora o SQLite não enforce o limite estritamente.

---

- **TEXT**: Tipo para armazenar dados textuais de qualquer tamanho (strings, documentos, etc.).  
Exemplo:  
```sql
CREATE TABLE artigos (
    titulo TEXT,
    conteudo TEXT
);
INSERT INTO artigos (titulo, conteudo) VALUES ('Introdução ao SQL', 'SQL é uma linguagem poderosa...');
```  
Resultado: Armazena textos de qualquer comprimento, desde pequenas strings até documentos longos.

---

- **INTEGER**: Tipo numérico para armazenar números inteiros (positivos, negativos ou zero).  
Exemplo:  
```sql
CREATE TABLE estoque (
    produto_id INTEGER,
    quantidade INTEGER
);
INSERT INTO estoque (produto_id, quantidade) VALUES (101, 500);
```  
Resultado: Armazena o valor inteiro 500 na coluna quantidade. Pode armazenar valores de -9223372036854775808 a 9223372036854775807.

---

- **REAL**: Tipo para números de ponto flutuante (decimais).  
Exemplo:  
```sql
CREATE TABLE precos (
    produto TEXT,
    valor REAL
);
INSERT INTO precos (produto, valor) VALUES ('Notebook', 2999.99);
```  
Resultado: Armazena o valor decimal 2999.99. Útil para preços, medições científicas e cálculos que requerem precisão fracionária.

---

- **BOOLEAN**: Tipo lógico para valores verdadeiro/falso. No SQLite, armazenado como INTEGER (0 = falso, 1 = verdadeiro).  
Exemplo:  
```sql
CREATE TABLE tarefas (
    descricao TEXT,
    concluida BOOLEAN
);
INSERT INTO tarefas (descricao, concluida) VALUES ('Estudar SQL', 1);
INSERT INTO tarefas (descricao, concluida) VALUES ('Fazer compras', 0);
```  
Resultado: Armazena 1 para tarefa concluída e 0 para não concluída. Ao recuperar, pode ser interpretado como verdadeiro/falso.

---

- **NULL**: Representa a ausência de valor ou dado desconhecido.  
Exemplo:  
```sql
CREATE TABLE contatos (
    nome TEXT NOT NULL,
    telefone TEXT,
    email TEXT
);
INSERT INTO contatos (nome, telefone) VALUES ('Ana', '1234-5678');
-- email será NULL automaticamente
```  
Resultado: O campo email recebe NULL (nulo) indicando que não há valor definido para este contato.

---

- **DATETIME**: Tipo para armazenar datas e horários. No SQLite, armazenado como TEXT (ISO8601), REAL (Julian day) ou INTEGER (Unix timestamp). Em geral, pode adotar o formato 'aaaa-mm-dd' onde 'a' representa dígitos do ano (ex: 2007), 'm' dígitos do mês (ex: 06 para Junho), 'd' para dígitos do dia (ex: 08)
Exemplo:  
```sql
CREATE TABLE eventos (
    nome TEXT,
    data_hora DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO eventos (nome) VALUES ('Reunião de equipe');
```  
Resultado: Armazena a data e hora atual automaticamente (ex: '2026-04-16 02:19:00') no formato ISO8601.

```sql
INSERT INTO datas_comemorativas (evento, data)
VALUES ('adoção do meu primeiro bichinho', '2009-03-23');
```  
Resultado: Insere na tabela datas_comemorativas o valor 'adoção do meu primeiro bichinho' com a data '2009-03-23' correspondendo ao dia 3 de Março de 2009.

---

##  MODIFICADORES DE COLUNAS

- **PRIMARY KEY**: Define uma coluna (ou conjunto de colunas) como identificador único de cada registro na tabela.  
Exemplo:  
```sql
CREATE TABLE departamentos (
    id INTEGER PRIMARY KEY,
    nome TEXT NOT NULL
);
INSERT INTO departamentos (nome) VALUES ('Vendas');
INSERT INTO departamentos (nome) VALUES ('Marketing');
```  
Resultado: A coluna 'id' se torna a chave primária. O SQLite atribui automaticamente valores únicos sequenciais (1, 2, 3...) se for INTEGER.

---

- **FOREIGN KEY**: Estabelece um relacionamento entre tabelas, referenciando a chave primária de outra tabela.  
Exemplo:  
```sql
CREATE TABLE funcionarios (
    id INTEGER PRIMARY KEY,
    nome TEXT NOT NULL,
    dept_id INTEGER,
    FOREIGN KEY (dept_id) REFERENCES departamentos(id)
);
INSERT INTO funcionarios (nome, dept_id) VALUES ('Carlos', 1);
```  
Resultado: A coluna dept_id referencia o departamento. Garante integridade referencial (deve existir departamento com id=1). *Requer: PRAGMA foreign_keys = ON;*

---

- **AUTOINCREMENT**: Faz com que valores inteiros sejam gerados automaticamente de forma sequencial e única.  
Exemplo:  
```sql
CREATE TABLE pedidos (
    numero INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente TEXT,
    valor REAL
);
INSERT INTO pedidos (cliente, valor) VALUES ('Cliente A', 150.00);
INSERT INTO pedidos (cliente, valor) VALUES ('Cliente B', 230.50);
```  
Resultado: Os números de pedido são gerados automaticamente como 1, 2, 3... mesmo que registros sejam excluídos, os números não são reutilizados.

---

- **UNIQUE**: Garante que todos os valores em uma coluna (ou combinação de colunas) sejam distintos.  
Exemplo:  
```sql
CREATE TABLE contas (
    id INTEGER PRIMARY KEY,
    usuario TEXT UNIQUE,
    senha TEXT
);
INSERT INTO contas (usuario, senha) VALUES ('admin', '123456');
INSERT INTO contas (usuario, senha) VALUES ('admin', 'abcdef'); -- ERRO!
```  
Resultado: A segunda inserção falha porque 'admin' já existe. Impede usuários duplicados.

---

- **CHECK**: Define uma condição que valores da coluna devem satisfazer.  
Exemplo:  
```sql
CREATE TABLE produtos (
    id INTEGER PRIMARY KEY,
    nome TEXT,
    preco REAL CHECK(preco > 0),
    estoque INTEGER CHECK(estoque >= 0)
);
INSERT INTO produtos (nome, preco, estoque) VALUES ('Caneta', -5.00, 10); -- ERRO!
```  
Resultado: A inserção é rejeitada porque preco não satisfaz a condição CHECK(preco > 0). Garante dados válidos.

---

- **NOT NULL**: Impede que uma coluna aceite valores NULL (vazios).  
Exemplo:  
```sql
CREATE TABLE alunos (
    matricula INTEGER PRIMARY KEY,
    nome TEXT NOT NULL,
    curso TEXT NOT NULL,
    telefone TEXT
);
INSERT INTO alunos (matricula, nome) VALUES (1001, 'Pedro');
INSERT INTO alunos (matricula, curso) VALUES (1002, 'Engenharia'); -- ERRO!
```  
Resultado: A segunda inserção falha porque 'nome' é NOT NULL e não foi fornecido. O telefone pode ser NULL.

---

