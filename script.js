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

document.addEventListener('DOMContentLoaded', async () => {
  await redirecionaPaginas();
})

document.addEventListener('redirect', async () => {
  await redirecionaPaginas();
})

async function redirecionaPaginas() {
  await testaToken()
  let acao = localStorage.getItem('acao')
  if(acao === null) {
    acao = '';
  }
  if(userLogado.id) {
    carregaNavBarLogado();
    adicionaRedirecionamento()
  } else {
    adicionaEventosIniciais()
  }
  if(acao === 'removercarrinho') {
    carregarCarrinho(userLogado.id)
    showSnackbar("Roupa removida do carrinho!", 'red', 'white')

    localStorage.setItem('acao', '')
  }
  if(acao.startsWith('addroupa')) {
    let acaoDividida = acao.split('-')
    if(acaoDividida.length === 3) {
      let {id, imageURL, nome, preco} = listaRoupasBanco[acaoDividida[2] - 1]
      carregaRoupaEspecifica(id, imageURL, nome, preco)
      showSnackbar("Roupa adicionada ao carrinho", 'green', 'black')
      
      localStorage.setItem('acao', '')
    } else {
      carregarListaDesejos(userLogado.id)
      showSnackbar("roupa adicionada ao carrinho", "green", "black")
      localStorage.setItem('acao', '')
    }
  }
  if(acao.startsWith('adddesejo')) {
    let acaoDividida = acao.split('-')
    let {id, imageURL, nome, preco} = listaRoupasBanco[acaoDividida[1] - 1]
    carregaRoupaEspecifica(id, imageURL, nome, preco)
    showSnackbar("Roupa adicionada a lista de desejos", 'green', 'black')

    localStorage.setItem('acao', '')
  }
  if(acao === "removerdesejos") {
    carregarListaDesejos();
    showSnackbar("Roupa removida a lista de desejos", 'green', 'black')

    localStorage.setItem('acao', '')
  }
  if(acao === "comprafinalizada") {
    carregarCarrinho(userLogado.id)
    showSnackbar("Compra finalizada, obrigado e volte sempre!", 'green', 'black')

    localStorage.setItem('acao', '')
  }
  
}

async function testaToken() {
  const token = localStorage.getItem('token');
  if (token) {
      try {
          const data = await verificaLogado(token);
          if(data.valid) {
            userLogado = data.user;
            userLogado.favoritas = JSON.parse(userLogado.favoritas);
            userLogado.carrinho = JSON.parse(userLogado.carrinho);
          } else {
            console.error('Token inválido, logue novamente');
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          }
      } catch (e) {
          console.error('Erro ao verificar token:', e);
      }
  }
}

function adicionaRedirecionamento() {
  const currentPath = window.location.pathname;
  if (currentPath.includes("loginPage.html") || currentPath.includes("registerPage.html")) {
    if(userLogado.id) {
      // Se o usuário estiver logado e estiver na página de login ou registro, redirecionar para a página principal
      redirectTo("/index.html");
    }
  }
}

//Cria função de redirecionamento para trata-lo como evento
function redirectTo(url) {
  const redirectEvent = new Event('redirect');
  window.location.href = url;
  document.dispatchEvent(redirectEvent);
}

function carregaNavBarLogado() {
  const nav = document.querySelector('header > nav');
  nav.innerHTML = `
  <ul class="nav-bar">
    <li class="nav-menu-item" id="roupasMasculinas">Masculinas</li>
    <li class="nav-menu-item" id="roupasFemininas">Femininas</li>
    <li class="nav-menu-item" id="btnSair">Sair</li>
    <img src="/assets/favorite.svg" id="btnListaDesejos" alt="botão para acessar roupas curtidas">
    <img src="/assets/kart2.svg" id="btnListaCarrinho" alt="botão para acessar carrinho e finalizar compras">
  </ul>
  `
  adicionaEventosIniciais()
  const btnSair = document.getElementById('btnSair');
  btnSair.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  })
  const btnListaDesejos = document.getElementById('btnListaDesejos')
  btnListaDesejos.addEventListener('click', () => carregarListaDesejos(userLogado.id))
  const btnListaCarrinho = document.getElementById('btnListaCarrinho')
  btnListaCarrinho.addEventListener('click', () => carregarCarrinho(userLogado.id))
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
        redirectTo("/index.html");
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
        <img src="/assets/favorite.svg" alt="botão de favoritar roupa" id="adicionarAFavoritos" roupa="${id}">
      </div>
      <button roupa="${id}" id="btnRoupaCarrinho">
        <img src="/assets/kart.svg" alt="ícone do carrinho" >
        <p>Adicionar ao carrinho</p>
      </button>
    </div>
    <div id="snackbar"></div>
  </div>
  `
  const btnRoupaCarrinho = document.getElementById('btnRoupaCarrinho')
  btnRoupaCarrinho.addEventListener('click', async () => {
    if(userLogado.id) {
      let roupaID = btnRoupaCarrinho.getAttribute('roupa')
      await adicionaRoupaCarrinho(userLogado.carrinho, roupaID, 'especifica')
    } else {
      redirectTo('./pages/loginPage.html');
    }
  })
  const adicionarAFavoritos = document.getElementById('adicionarAFavoritos')
  adicionarAFavoritos.addEventListener('click', async () => {
    let roupaID = adicionarAFavoritos.getAttribute('roupa')
    await adicionaRoupaDesejos(userLogado.favoritas, roupaID)
  })
}

//Redirects vindo das paginas de login e registro
window.onload = function() {
  if (localStorage.getItem('carregarGenero') === 'M') {
      localStorage.removeItem('carregarGenero');
      carregaGenero('M');
  } else if(localStorage.getItem('carregarGenero') === 'F') {
      localStorage.removeItem('carregarGenero');
      carregaGenero('F');
  }
}


//Página de lista de desejos
function carregarListaDesejos() {
  const conteudoAtual = document.getElementById('conteudoPrincipal')
  conteudoAtual.style = ''
  conteudoAtual.innerHTML = 
  `
  <div class="componente-lista-desejos">
    <h1>Lista de desejos</h1>
    <div class="desejos-box" id="desejosBox">
      
    </div>
    <div id="snackbar"></div>
  </div>
  `
  const caixaRoupasCurtidas = document.getElementById('desejosBox')
  userLogado.favoritas.forEach(roupaID => {
    let {id, imageURL, nome, preco} =  listaRoupasBanco[roupaID - 1]
    caixaRoupasCurtidas.innerHTML += 
    `
    <div class="desejos-box-roupa" roupa="${id}">
      <img src="${imageURL}" alt="${nome}">
      <div class="descricao-desejos">
        <h1>${nome}</h1>
        <div class="preco">
          <h2>${formatarParaBRL(preco)}</h2>
        </div>
        <div class="btn-desejo">
          <button class="btn-kart" roupa="${id}" id="addRoupaCarrinho">
            <img src="/assets/kart.svg" alt="ícone do carrinho">
          </button>
          <button class="btn-remove desejos" roupa="${id}">
            <p>Remover</p>
          </button>
        </div>
      </div>
    </div>
    `
  })
  const btnKart = document.querySelectorAll('.btn-kart')
  btnKart.forEach(btnKartRoupa => {
    btnKartRoupa.addEventListener('click', async () => {
      let roupaID = btnKartRoupa.getAttribute('roupa')
      adicionaRoupaCarrinho(userLogado.carrinho, roupaID, 'desejo')
    })
  })
  const botoesRemoverDesejos = document.querySelectorAll('.btn-remove.desejos')
  botoesRemoverDesejos.forEach(botao => {
    botao.addEventListener('click', async () => {
      let roupaID = botao.getAttribute('roupa')
      await removeRoupaDesejos(userLogado.favoritas, roupaID)

    })
  })

}
async function removeRoupaDesejos(userCurtidas, roupaID) {
  localStorage.setItem('acao', 'removerdesejos')
  roupaID = Number(roupaID)
  let indexDaRoupa = userCurtidas.indexOf(roupaID);
  
  if (indexDaRoupa !== -1) {
    userCurtidas.splice(indexDaRoupa, 1);
  }
  await atualizaDesejos(userCurtidas)
}
async function adicionaRoupaDesejos(userCurtidas, roupaID) {
  
  localStorage.setItem('acao', `adddesejo-${roupaID}`)
  roupaID = Number(roupaID)
  if(!userCurtidas.includes(roupaID)) {
    userCurtidas.push(roupaID);
    await atualizaDesejos(userCurtidas)
  } else {
    showSnackbar("Roupa já esta na lista de desejos", 'red', 'white')
  }
}

//Página de carrinho
function carregarCarrinho(userID) {

  const conteudoAtual = document.getElementById('conteudoPrincipal')
  conteudoAtual.style = ''
  conteudoAtual.innerHTML = 
  `
  <div class="componente-lista-desejos" id="paginaCarrinho">
    <h1>Carrinho</h1>
    <div class="desejos-box" id="desejosBox">
      
    </div>
  </div>
  `
  const caixaRoupasCurtidas = document.getElementById('desejosBox')
  userLogado.carrinho.forEach(id => {
    let {imageURL, nome, preco} =  listaRoupasBanco[id - 1]
    caixaRoupasCurtidas.innerHTML += 
    `
    <div class="desejos-box-roupa" roupa="${id}">
      <img src="${imageURL}" alt="${nome}">
      <div class="descricao-desejos">
        <h1>${nome}</h1>
        <div class="preco">
          <h2>${formatarParaBRL(preco)}</h2>
        </div>
        <div class="btn-desejo">
          <button class="btn-remove" roupa="${id}">
            <p>Remover do carrinho</p>
          </button>
        </div>
      </div>
    </div>
    `
  })
  caixaRoupasCurtidas.innerHTML += 
  `
  <button class="btn-finalizar" roupas="${userID.carrinho}" usuario="${userID}">
    <p>Finalizar Compra</p>
    <div id="snackbar"></div>
  </button>
  `
  adicionarEventosCarrinho(userID);
}
function adicionarEventosCarrinho() {
  // Adicionar eventos de clique para todos os botões de remover
  const btnsRemoverCarrinho = document.querySelectorAll('.btn-remove');
  btnsRemoverCarrinho.forEach(button => {
    button.addEventListener('click', async (e) => {
    e.preventDefault(); // Prevenir o comportamento padrão de envio do formulário
    const roupaId = button.getAttribute('roupa');
    await removeRoupaCarrinho(userLogado.carrinho, roupaId);

    });
  });

  // Adicionar evento de clique para o botão de finalizar compra
  const btnFinalizarCompra = document.querySelector('.btn-finalizar');
  btnFinalizarCompra.addEventListener('click', async () => {
    if(userLogado.carrinho.length >= 1) {
      await finalizaCompra(userLogado.carrinho)
      userLogado.carrinho = []
      localStorage.setItem('acao', 'comprafinalizada')
      await atualizaCarrinho(userLogado.carrinho)

    } else {
      showSnackbar("Adicione pelo menos um item no carrinho", 'red', 'white')
    }
  });

}
async function finalizaCompra(userKart) {
  let token = localStorage.getItem('token')
  try {
    const response = await fetch(`http://localhost:5000/usuario/kart/finalizar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userKart }),
    });

    if (!response.ok) {
        throw new Error('Erro na requisição: ' + response.statusText);
    }

    const data = await response.json();
  } catch (error) {
      console.error('Erro ao atualizar o carrinho:', error);
  }
}
async function removeRoupaCarrinho(userKart, roupaID) {
  localStorage.setItem('acao', 'removercarrinho')
  roupaID = Number(roupaID)
  let indexDaRoupa = userKart.indexOf(roupaID);
  
  if (indexDaRoupa !== -1) {
    userKart.splice(indexDaRoupa, 1);
  }
  await atualizaCarrinho(userKart)
}
async function adicionaRoupaCarrinho(userKart, roupaID, local) {
  if(local === 'especifica') {
    localStorage.setItem('acao', `addroupa-${local}-${roupaID}`)
  } else if(local === 'desejo') {
    localStorage.setItem('acao', `addroupa-${local}`)
  }
  roupaID = Number(roupaID)
  userKart.push(roupaID);
  await atualizaCarrinho(userKart)
}
async function atualizaCarrinho(userKart) {
  let token = localStorage.getItem('token')
  try {
    const response = await fetch(`http://localhost:5000/usuario/kart`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userKart }),
    });

    if (!response.ok) {
        throw new Error('Erro na requisição: ' + response.statusText);
    }

    const data = await response.json();
  } catch (error) {
      console.error('Erro ao atualizar o carrinho:', error);
  }
}
async function atualizaDesejos(userCurtidas) {
  let token = localStorage.getItem('token')
  try {
    const response = await fetch(`http://localhost:5000/usuario/desejo`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userCurtidas }),
    });

    if (!response.ok) {
        throw new Error('Erro na requisição: ' + response.statusText);
    }

    const data = await response.json();
  } catch (error) {
      console.error('Erro ao atualizar o carrinho:', error);
  }
}

// Evento do snackBar
function showSnackbar(texto, corFundo, corTexto) {
  // Pegue o elemento Snackbar
  var snackbar = document.getElementById("snackbar");
  snackbar.innerText = texto;
  snackbar.style.backgroundColor = corFundo;
  snackbar.style.color = corTexto;
  // Adicione a classe "show" ao Snackbar
  snackbar.className = "show";

  // Após 3 segundos, remova a classe "show" do Snackbar
  setTimeout(function() {
    snackbar.className = snackbar.className.replace("show", "");
  }, 3000);
}
