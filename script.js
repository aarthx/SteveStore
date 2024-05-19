// Carrega arquivos injetando-os no html no site
const site = document.getElementById('root')
document.addEventListener('DOMContentLoaded', () => {
    const URLComponentesIniciais = ['./components/header.html', './components/home.html', './components/footer.html']
    carregarComponente(URLComponentesIniciais, site)
})

async function carregarComponente(URLComponentesIniciais, componentePai) {
    try {
        for(const url of URLComponentesIniciais) {
            const response = await fetch(url)
            const texto = await response.text()
            componentePai.innerHTML += texto
        }
        configurarEventos();
    } catch (e) {
        return console.error(e)
    }
}

function configurarEventos() {
    //Seleciona a div do conteudo principal para colocar a tela de login e de registrar ao clicar nos respectivos botões
    
    const mainContent = document.getElementById('conteudoPrincipal')
    const botaoEntrar = document.getElementById('btnEntrar')
    const botaoRegistrar = document.getElementById('btnRegistrar')
    const URLformularios = ['./components/loginComponent.html', './components/registerComponent.html']

    botaoEntrar.addEventListener('click', () => {
        fetch(URLformularios[0]).then(response => response.text()).then(html => 
            mainContent.innerHTML = html
        )
    })

    botaoRegistrar.addEventListener('click', () => {
        fetch(URLformularios[1]).then(response => response.text()).then(html => 
            mainContent.innerHTML = html
        )
    })
}
