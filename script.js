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

//Adiciona eventos inicias
const opcaoMasculinas = document.getElementById('roupasMasculinas')
const opcaoFemininas = document.getElementById('roupasFemininas')
if(opcaoMasculinas) opcaoMasculinas.addEventListener('click', carregaMasculinas)
if(opcaoFemininas) opcaoFemininas.addEventListener('click', carregaFemininas)


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
  }
  for(let i = 8; i < 16; i++) {
    itemLi = Array.from(roupasMostradas[1].children)[i - 8]
    roupaBanco = listaRoupasBanco[i]
    itemLi.innerHTML += `<img src="${roupaBanco.imageURL}" alt="${roupaBanco.nome}">
                                                              <p>${roupaBanco.nome}</p>
                                                              <h2>${formatarParaBRL(roupaBanco.preco)}</h2>`
  }
}
function formatarParaBRL(valor) {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(valor);
}
function carregaMasculinas() {
  const banner = document.getElementById('banner')
  if(banner) {
    banner.remove()
  }
  console.log(listaRoupasBanco)
  let roupasMasculinasBanco = listaRoupasBanco.filter(roupa => (roupa.genero === 'M'))
  //limpar conteudo atual
  if(componente) {
    componente.classList.add('conteudo')
    componente.classList.remove('componente')
    componente.style.marginTop = '15rem'
  } 
  const quadroAtual = conteudo || componente
  quadroAtual.innerHTML = `
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
  <div class="secundary-bar"></div>`
  const roupasMasculinas = document.querySelector('.clothes > ul')
  for(let i = 0; i < 8; i++) {
    itemLi = Array.from(roupasMasculinas.children)[i]
    roupaBanco = roupasMasculinasBanco[i]
    itemLi.innerHTML += `<img src="${roupaBanco.imageURL}" alt="${roupaBanco.nome}">
                                                              <p>${roupaBanco.nome}</p>
                                                              <h2>${formatarParaBRL(roupaBanco.preco)}</h2>`
  }
  conteudo.style.marginTop = '15rem'
}
function carregaFemininas() {
  const banner = document.getElementById('banner')
  if(banner) {
    banner.remove()
  }
  let roupasFemininasBanco = listaRoupasBanco.filter(roupa => (roupa.genero === 'F'))
  //limpar conteudo atual
  const quadroAtual = conteudo || componente
  if(componente) {
    componente.classList.add('conteudo')
    componente.classList.remove('componente')
    componente.style.marginTop = '15rem'
  } 
  quadroAtual.innerHTML = `
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
  <div class="secundary-bar"></div>`
  const roupasFemininas = document.querySelector('.clothes > ul')
  for(let i = 0; i < 8; i++) {
    itemLi = Array.from(roupasFemininas.children)[i]
    roupaBanco = roupasFemininasBanco[i]
    itemLi.innerHTML += `<img src="${roupaBanco.imageURL}" alt="${roupaBanco.nome}">
                                                              <p>${roupaBanco.nome}</p>
                                                              <h2>${formatarParaBRL(roupaBanco.preco)}</h2>`
  }
  conteudo.style.marginTop = '15rem'
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
        alert(result.message)
      }
    })
  } catch(e) {
    console.error('Erro:', e);
    alert('Ocorreu um erro ao enviar a mensagem.');
  }
}