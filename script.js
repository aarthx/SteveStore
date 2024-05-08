const site = document.getElementById('root')
carregarComponente('./components/header.html', site)
carregarComponente('./components/banner.html', site)

function carregarComponente(urlComponent, componentePai) {
    fetch(urlComponent)
        .then(response => response.text())
        .then(html => {
            site.innerHTML += html
    })
        .catch(e => console.error(e))
}
