function novoElemento(tagName, className) {

    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barreira(reversa = false) {
    // Primeiro cria-se a barreira e depois o que faz parte da barreira - que são os canos tanta embaixo quanto em cima
    this.elemento = novoElemento('div', 'barreira')
    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    // Nessa parte verifica o que vem primeiro do cano (ou seja barreira)
    // A partir do parametro "reversa" se verfica se vai ser adicionado a DOM
    // uma div de corpo ou borda do cano
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

function PardeBarreiras(altura, abertura, x) {
    //O elemento par de barreiras envolve os dois canos tanto
    //o de cima quanto o de baixo
    this.elemento = novoElemento('div', 'par-de-barreiras')

    //Aqui se cria os dois canos tanto o superior quanto o inferior
    //A partir de instancias da function barreira
    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    // O "this.elemento" é o lelemento da DOM
    //então se adiciona tanto o superior quanto o inferior na DOM
    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior

        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}
// const b = new PardeBarreiras(500, 200, 400)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {

    //Abaixo é criado um array com a instancia do par de barreiras
    // E a primeira começa com a largura da tela do jogo, para
    //o jogo iniciar de fora da tela, e os próximos team a adição do espaço entre elas
    this.pares = [
        new PardeBarreiras(altura, abertura, largura),
        new PardeBarreiras(altura, abertura, largura + espaco),
        new PardeBarreiras(altura, abertura, largura + espaco * 2),
        new PardeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3

    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)
            //quando o elemento sair da área do jogo
            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio && par.getX() < meio

            if (cruzouOMeio){
                console.log('passei!')
                notificarPonto()  
            } 
        })
    }
}

function Passaro(alturaJogo){
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false


    this.animar = () => {

        let novoY;
        if (voando) {
            this.elemento.src = 'imgs/passaro_voando.png'
            novoY = this.getY() + 8
        } else {
            this.elemento.src = 'imgs/passaro.png'
            novoY = this.getY() - 5
        }
        // const novoY = this.getY() + (voando ? 8 : -5)
         const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if(novoY <= 0){
            this.setY(0)
        }else if(novoY >= alturaMaxima){
            this.setY(alturaMaxima)
        }
        else{
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo / 2)
}

function Progresso(){
    this.elemento = novoElemento('span', 'progresso')
    this.atualizaPontos = pontos => this.elemento.innerHTML = pontos

     this.atualizaPontos(0)
}

function estaoSobrepostos(elementoA, elementoB){
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left 
        && b.left + b.width >= a.left
    
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    
    return horizontal && vertical
}

function colidiu(passaro, barreiras){
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras => {
        if(!colidiu){
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior) ||
                      estaoSobrepostos(passaro.elemento, inferior)
        }
    })

    return colidiu
}

function FlappyBird(){
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400,
        () => progresso.atualizaPontos(++pontos))
    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        const temporizador = setInterval(() => {
                 barreiras.animar()
                 passaro.animar()
                 
                 if(colidiu(passaro, barreiras)){
                    clearInterval(temporizador)
                 }
                }, 20)
    }
}

new FlappyBird().start()

// const barreiras = new Barreiras(500, 1200, 200, 400)
// const passaro = new Passaro(500)
// const areaDoJogo = document.querySelector('[wm-flappy]')
// areaDoJogo.appendChild(passaro.elemento)
// areaDoJogo.appendChild(new Progresso().elemento)
// barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
// setInterval(() => {
//     barreiras.animar()
//     passaro.animar()
// }, 20)