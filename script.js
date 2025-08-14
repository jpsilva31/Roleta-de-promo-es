const canvas = document.getElementById("roleta");
const ctx = canvas.getContext("2d");
const btnGirar = document.getElementById("btnGirar");
const resultadoCaixa = document.getElementById("resultado");

// -------------------------
// Configurações
// -------------------------
const setores = ["10% OFF", "20% OFF", "30% OFF", "40% OFF", "50% OFF", "Brinde"];
const cores   = ["#859d74", "#2b5951", "#ddffda", "#859d74", "#2b5951", "#ddffda"];

let anguloAtual = 0;    // em radianos
let girando = false;

// -------------------------
// Responsividade do canvas
// -------------------------
// Define o tamanho lógico do canvas (atributos) com base no tamanho visual (CSS) e no DPR
function ajustarDPR() {
  const dpr = window.devicePixelRatio || 1;
  // tamanho visual (CSS) do canvas (em px)
  const sizeCSS = Math.min(window.innerWidth * 0.9, 360); // 90vw até máx 360px
  // aplica também à imagem sobreposta (mantemos pelo CSS)

  // Ajusta atributos do canvas (buffer interno)
  canvas.width = Math.floor(sizeCSS * dpr);
  canvas.height = Math.floor(sizeCSS * dpr);

  // Reseta transformações e escala para coordenadas CSS
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

// -------------------------
// Desenho da roleta
// -------------------------
function desenharRoleta() {
  // tamanho visual (CSS) calculado a partir do estilo (mesmo que usamos no CSS)
  const size = Math.min(window.innerWidth * 0.9, 360);
  const cx = size / 2;
  const cy = size / 2;
  const r  = size / 2;

  ctx.clearRect(0, 0, size, size);

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
    ctx.fillStyle = "#220650ff"; // <<< troque aqui se quiser mudar a cor do texto
    ctx.font = `bold ${Math.max(12, size * 0.047)}px Arial`; // escala a fonte ~14px quando size=300
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

    ajustarDPR();   // garante nitidez durante a animação em dispositivos com DPR alto
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

  resultadoCaixa.textContent = "você conseguiu: " + setores[indice];
  resultadoCaixa.style.display = "inline-block"; // exibe a caixa
}

// -------------------------
// Inicialização + resize
// -------------------------
function render() {
  ajustarDPR();
  desenharRoleta();
}

window.addEventListener('resize', render, { passive: true });
render();

btnGirar.addEventListener("click", girarRoleta);
