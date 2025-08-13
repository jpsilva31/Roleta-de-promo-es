const canvas = document.getElementById("roleta");
const ctx = canvas.getContext("2d");
const btnGirar = document.getElementById("btnGirar");
const resultadoCaixa = document.getElementById("resultado");

// -------------------------
// Ajuste de nitidez (Retina)
// -------------------------
function ajustarDPR(canvas, ctx) {
  const dpr = window.devicePixelRatio || 1;
  // Largura/altura em CSS já estão no atributo width/height do canvas
  const cssW = canvas.width;
  const cssH = canvas.height;
  // dimensiona o buffer interno
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  // aplica escala
  ctx.scale(dpr, dpr);
  // IMPORTANTE: após escalar, trabalhamos sempre em coordenadas CSS (300x300)
}
ajustarDPR(canvas, ctx);

// -------------------------
// Configurações
// -------------------------
const setores = ["10% OFF", "20% OFF", "30% OFF", "40% OFF", "50% OFF", "Brinde"];
const cores   = ["#859d74", "#2b5951", "#ddffda", "#859d74", "#2b5951", "#ddffda"];

let anguloAtual = 0;    // em radianos
let girando = false;

// -------------------------
// Desenho da roleta
// -------------------------
function desenharRoleta() {
  const cx = 150;
  const cy = 150;
  const r = 150;

  ctx.clearRect(0, 0, 300, 300);

  // Sem linhas entre setores
  ctx.lineWidth = 0;
  ctx.strokeStyle = "transparent";

  const tamanhoSetor = (2 * Math.PI) / setores.length;
  for (let i = 0; i < setores.length; i++) {
    const anguloInicio = anguloAtual + i * tamanhoSetor;

    // Setor
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, anguloInicio, anguloInicio + tamanhoSetor);
    ctx.closePath();
    ctx.fillStyle = cores[i];
    ctx.fill();

    // Texto
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(anguloInicio + tamanhoSetor / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#010a0eff";
    ctx.font = "bold 14px Arial";
    ctx.fillText(setores[i], r - 10, 5);
    ctx.restore();
  }
}

// -------------------------
// Girar
// -------------------------
function girarRoleta() {
  if (girando) return;
  girando = true;
  btnGirar.disabled = true;

  const giroTotalGraus = Math.random() * 360 + 1800; // 5 voltas+
  const duracao = 4000; // ms
  let inicio = null;

  function animar(ts) {
    if (!inicio) inicio = ts;
    const tempo = ts - inicio;
    const progresso = Math.min(tempo / duracao, 1);

    // easing (easeOutCubic)
    const easing = 1 - Math.pow(1 - progresso, 3);

    // Converte para radianos e normaliza
    anguloAtual = ((giroTotalGraus * easing) * Math.PI / 180) % (2 * Math.PI);

    desenharRoleta();

    if (progresso < 1) {
      requestAnimationFrame(animar);
    } else {
      girando = false;
      btnGirar.disabled = false;
      mostrarResultado();
    }
  }

  requestAnimationFrame(animar);
}

// -------------------------
// Resultado correto com seta à direita (3h)
// -------------------------
function mostrarResultado() {
  const tamanhoSetor = (2 * Math.PI) / setores.length;
  const anguloSeta = 0; // seta à direita (3h)
  const anguloSobSeta = (2 * Math.PI - (anguloAtual % (2 * Math.PI)) + anguloSeta) % (2 * Math.PI);
  const indice = Math.floor(anguloSobSeta / tamanhoSetor) % setores.length;

  resultadoCaixa.textContent = "Resultado: " + setores[indice];
  resultadoCaixa.style.display = "inline-block"; // <-- exibe a caixa
}


// -------------------------
// Inicialização
// -------------------------
desenharRoleta();
btnGirar.addEventListener("click", girarRoleta);




