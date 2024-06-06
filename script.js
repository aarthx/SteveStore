//Insere script para funcionando do ReCaptcha no front-end
function loadRecaptcha() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
loadRecaptcha()

//Verifica se o usuário já está logado
let userLogado = {}
init();
async function init() {
  const token = localStorage.getItem('token');
  if (token) {
      try {
          const data = await verificaLogado(token);
          if(data.valid) {
            userLogado = data.user;
            console.log(userLogado)
          } else {
            console.error('Token inválido, logue novamente');
            localStorage.removeItem('token')
          }
      } catch (e) {
          console.error('Erro ao verificar token:', e);
      }
  }
  if(userLogado.id) {
    const nav = document.querySelector('header > nav');
    nav.innerHTML = `
    <ul class="nav-bar">
      <li class="nav-menu-item" id="roupasMasculinas">Masculinas</li>
      <li class="nav-menu-item" id="roupasFemininas">Femininas</li>
      <li class="nav-menu-item" id="btnSair">Sair</li>
      <img src="/assets/favorite.svg" alt="botão para acessar roupas curtidas">
      <img src="/assets/kart2.svg" alt="botão para acessar carrinho e finalizar compras">
    </ul>
    `
    const btnSair = document.getElementById('btnSair');
    btnSair.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.reload();
    })
  }
  adicionaEventosIniciais()
}

async function verificaLogado(token) {
  const response = await fetch('http://localhost:5000/token', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(token)
  });

  const data = await response.json();
  return data
}

//Adiciona eventos inicias
function adicionaEventosIniciais() {
  const opcaoMasculinas = document.getElementById('roupasMasculinas')
  const opcaoFemininas = document.getElementById('roupasFemininas')
  if(opcaoMasculinas) opcaoMasculinas.addEventListener('click', () => carregaGenero('M'))
  if(opcaoFemininas) opcaoFemininas.addEventListener('click', () => carregaGenero('F'))
}

//Carrega Roupas do banco para o site - Codigo para index.html
let listaRoupasBanco = []
const roupasMostradas = document.querySelectorAll('.clothes > ul')
const conteudo = document.getElementById("conteudo")
const componente = document.getElementById("componente")
try {
  fetch('http://localhost:5000/roupas').then(response => response.json())
  .then(data => {
    listaRoupasBanco = data;
  })
  .then(() => {
    if(roupasMostradas.length) {
      carregarRoupasDoBanco()
    }
  })
} catch(e) {
  console.error('Erro ao buscar roupas:', error)
}

function carregarRoupasDoBanco() {

  for(let i = 0; i < 8; i++) {
    itemLi = Array.from(roupasMostradas[0].children)[i]
    roupaBanco = listaRoupasBanco[i]
    itemLi.innerHTML += `<img src="${roupaBanco.imageURL}" alt="${roupaBanco.nome}">
                                                              <p>${roupaBanco.nome}</p>
                                                              <h2>${formatarParaBRL(roupaBanco.preco)}</h2>`
    
    //Adiciona evento de click especifico para cada roupa usando um técnica de closure                                                         
    itemLi.addEventListener('click', (function(roupa) {
      return function() {
        carregaRoupaEspecifica(roupa.id, roupa.imageURL, roupa.nome, roupa.preco);
      };
    })(roupaBanco));
  }
  for(let i = 8; i < 16; i++) {
    itemLi = Array.from(roupasMostradas[1].children)[i - 8]
    roupaBanco = listaRoupasBanco[i]
    itemLi.innerHTML += `<img src="${roupaBanco.imageURL}" alt="${roupaBanco.nome}">
                                                              <p>${roupaBanco.nome}</p>
                                                              <h2>${formatarParaBRL(roupaBanco.preco)}</h2>`
    //Adiciona evento de click especifico para cada roupa usando um técnica de closure                                                         
    itemLi.addEventListener('click', (function(roupa) {
      return function() {
        carregaRoupaEspecifica(roupa.id, roupa.imageURL, roupa.nome, roupa.preco);
      };
    })(roupaBanco));
  }
}
function formatarParaBRL(valor) {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(valor);
}
function carregaGenero(genero) {
  let roupasGeneroBanco = listaRoupasBanco.filter(roupa => (roupa.genero === genero))
  const conteudoAtual = document.getElementById('conteudoPrincipal')
  conteudoAtual.style.marginTop = '15rem'
  conteudoAtual.innerHTML = `
  <div class="conteudo" id="conteudo"> 
    <div class="primary-bar"></div>
    <div class="clothes">
        <ul>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
        </ul>
    </div>
    <div class="secundary-bar"></div>
  </div>`
  const roupasGenero = document.querySelector('.clothes > ul')
  for(let i = 0; i < 8; i++) {
    itemLi = Array.from(roupasGenero.children)[i]
    roupaBanco = roupasGeneroBanco[i]
    itemLi.innerHTML += `<img src="${roupaBanco.imageURL}" alt="${roupaBanco.nome}">
                                                              <p>${roupaBanco.nome}</p>
                                                              <h2>${formatarParaBRL(roupaBanco.preco)}</h2>`
    //Adiciona evento de click especifico para cada roupa usando um técnica de closure                                                         
    itemLi.addEventListener('click', (function(roupa) {
      return function() {
        carregaRoupaEspecifica(roupa.id, roupa.imageURL, roupa.nome, roupa.preco);
      };
    })(roupaBanco));
  }
}

//Lida com formulario de registro - Código para registerPage.html
const registerForm = document.getElementById('registerForm')
if(registerForm) {
  registerForm.addEventListener('submit', event => {
  event.preventDefault(); 
  const testEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
  const testSenha = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/

  var response = grecaptcha.getResponse();
  if (response.length === 0) {
      // Nenhuma resposta do reCAPTCHA
      alert('Por favor preencha o reCAPTCHA');
  } else {
    // Obtém os dados do formulário
    const formData = new FormData(registerForm);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    //validações
    let validaEmail = testEmail.test(data.email)
    let validaSenha = testSenha.test(data.senha)
    let senhasIguais = data.senha == data.senhaCon

    if(!senhasIguais) {
      alert('As senhas digitadas não são iguais!')
      registerForm.reset()
    } else if(!validaEmail) {
      alert('Digite um email válido!')
      registerForm.reset()
    } else if(!validaSenha) {
      alert('Digite uma senha válida e forte (minimo 8 caracteres, 1 caracter especial, 1 letra maiuscula e 1 letra minúscula e 1 número)!')
      registerForm.reset()
    } else {
      registraUsuarioNoBanco(data);
    }
  }

  
  
  });
}
function registraUsuarioNoBanco(usuario) {
  try {
    fetch('http://localhost:5000/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(usuario)
    })
    .then(response => response.json())
    .then(result => {
      if(result.error) {
        alert(result.error)
        registerForm.reset()
      }
    })
  } catch(e) {
    console.error('Erro:', e);
    alert('Ocorreu um erro ao enviar a mensagem.');
  }
}

//Lida com formulario de login - Código para loginPage.html
const loginForm = document.getElementById('loginForm')
if(loginForm) {
  loginForm.addEventListener('submit', event => {
  event.preventDefault(); 

  var response = grecaptcha.getResponse();
  if (response.length === 0) {
      // Nenhuma resposta do reCAPTCHA
      alert('Por favor preencha o reCAPTCHA');
  } else {

    const formData = new FormData(loginForm);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    tentativaDeLogin(data);
    
  }
  });
}
function tentativaDeLogin(usuario) {
  try {
    fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(usuario)
    })
    .then(response => response.json())
    .then(result => {
      if(result.success == false) {
        alert(result.message)
        loginForm.reset()
      } else {
        localStorage.setItem('token', result.token);
        alert('Login bem-sucedido!');
        window.location.href = '/';
      }
    })
  } catch(e) {
    console.error('Erro:', e);
    alert('Ocorreu um erro ao enviar a mensagem.');
  }
}

//Lida com as páginas específicas de cada roupa
function carregaRoupaEspecifica(id, img, nome, preco) {
  const conteudoAtual = document.getElementById('conteudoPrincipal')
  conteudoAtual.innerHTML = 
  `
  <div roupa="${id}" class="roupa-especifica">
    <img src="${img}" alt="${nome}">
    <div class="descricao">
      <h1>${nome}</h1>
      <div class="preco">
        <h2>${formatarParaBRL(preco)}</h2>
        <img src="/assets/favorite.svg" alt="botão de favoritar roupa">
      </div>
      <button roupa="${id}">
        <img src="/assets/kart.svg" alt="ícone do carrinho">
        <p>Adicionar ao carrinho</p>
      </button>
    </div>
  </div>
  `
}
