const site = document.getElementById('root')
carregarComponente('./components/header.html', site)
carregarComponente('./components/banner.html', site)
carregarComponente('./components/home.html', site)
carregarComponente('./components/footer.html', site)

function carregarComponente(urlComponent, componentePai) {
    fetch(urlComponent)
        .then(response => response.text())
        .then(html => {
            site.innerHTML += html
    })
        .catch(e => console.error(e))
}
