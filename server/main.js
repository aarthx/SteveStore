const http = require('http')
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const caminhoBanco = path.join(__dirname, '../bd/banco.sqlite3');
const banco = new sqlite3.Database(caminhoBanco, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite');
  }
});

let roupas = []

banco.all('SELECT * FROM roupas', (err, roupasBanco) => {
            if (err) {
                console.error(err.message);
            } else {
                roupas = roupasBanco.map((roupa) => {
                    return {
                        id: roupa.id,
                        nome: roupa.nome,
                        preco: roupa.preco,
                        genero: roupa.genero,
                        imageURL: roupa.imageURL
                    }
                })
            }
});

const servidor = http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.statusCode = 204; // No Content
        res.end();
        return;
    }

    res.setHeader('Content-Type', 'application/json')
    
    if (req.url === '/roupas' && req.method === 'GET') {
        res.statusCode = 200
        res.end(JSON.stringify(roupas))
    } else if(req.url === '/usuarios' && req.method === 'POST') {
        let body = ''

        req.on('data', chunk => {
            body += chunk.toString(); 
        });

        req.on('end', () => {
            try {
                const dados = JSON.parse(body); 

                const { email, senha } = dados;
                const sql = `INSERT INTO usuarios (email, senha) VALUES (?, ?)`;
                banco.run(sql, [email, senha], function(err) {
                    if (err) {
                        res.statusCode = 500;
                        res.end(JSON.stringify({ error: 'Erro ao registrar, verifique se esse email já não está registrado' }));
                    } else {
                        res.statusCode = 200;
                        res.end(JSON.stringify({ message: 'Usuário Registrado com sucesso', id: this.lastID }));
                    }
                });
            } catch (error) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Erro ao processar dados do formulário' }));
            }
        });
    } else if(req.url === '/login' && req.method === 'POST') {
        let body = ''

        req.on('data', chunk => {
            body += chunk.toString(); 
        });

        req.on('end', () => {
            try {
                const dados = JSON.parse(body); 
                const { email, senha } = dados;
                banco.get(`SELECT * FROM Usuarios WHERE email = ?`, [email], (err, row) => {
                    if (err) {
                      console.error(err.message);
                      res.writeHead(500, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ success: false, message: 'Erro interno' }));
                    } else if (!row) {
                      // E-mail não encontrado
                      res.writeHead(401, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ success: false, message: 'Esse email não está registrado' }));
                    } else {
                      // Verifica a senha
                      if (row.senha === senha) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'Usuário logado com sucesso' }));
                      } else {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, message: 'Senha inválida' }));
                      }
                    }
                  });
            } catch (error) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Erro ao processar dados do formulário' }));
            }
        });
    }
})

servidor.listen(5000, () => console.log("Servidor da SteveStore ligado"))