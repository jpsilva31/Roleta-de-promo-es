// Opções da roleta
const opcoes = [
  "✨ Prêmio Especial",
  "Desconsolidação fee",
  "50% OFF de consolidação",
  "5% OFF no Ocean Freight",
  "10% OFF no Ocean Freight"
];

// Cores por fatia (tons próximos e distinguíveis)
const cores = ["#2b5951", "#235047", "#2f6e63", "#3a7f74", "#419389"];

// 🔹 Imagem de fundo da roleta (gira junto)
const bgImgSrc = "imagens/SEA1.png"; // troque pelo seu arquivo
let bgImg = null;

// Helper de carregamento
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    // img.crossOrigin = "anonymous"; // se usar CDN externa
    img.src = src;
  });
}

// Elementos principais
const ctaBtn = document.getElementById("cta");
const card = document.getElementById("card-container");
const roletaWrap = document.getElementById("roleta-container");
const canvas = document.getElementById("roleta");
const resultadoEl = document.getElementById("resultado");
const botaoGirar = document.getElementById("girar");

// Proteção: se algo não existir, não deixa o script quebrar
if (!ctaBtn || !card || !roletaWrap || !canvas || !botaoGirar || !resultadoEl) {
  console.error("Elemento(s) não encontrado(s). Verifique os IDs no HTML.");
}

// Contexto e dimensões
let ctx;
let cssSize = 500;          // tamanho base em CSS px (desktop)
let logicalSize = 500;      // tamanho do buffer em px (considerando DPR)
let radius = 250;
let sectorAngle, sectorDeg;
let scaleFactor = 1;        // cssSize / 500 (usado para fontes, seta, etc.)

// DPR-aware: ajusta resolução do canvas ao tamanho que ele ESTÁ NA TELA
function resizeCanvasToDisplaySize() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);

  // Tamanho que o canvas ESTÁ renderizando na página (em CSS px)
  const rect = canvas.getBoundingClientRect();
  const displayWidth = Math.round(rect.width);
  const displayHeight = displayWidth; // é um círculo (quadrado)

  // Ajusta o buffer interno para ficar nítido
  const needResize =
    canvas.width !== Math.round(displayWidth * dpr) ||
    canvas.height !== Math.round(displayHeight * dpr);

  if (needResize) {
    canvas.width = Math.round(displayWidth * dpr);
    canvas.height = Math.round(displayHeight * dpr);
  }

  // Reseta transform e escala o contexto para desenhar em unidades de CSS px
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Variáveis derivadas em unidades de CSS px
  cssSize = displayWidth;
  logicalSize = displayWidth * dpr;
  radius = cssSize / 2;
  scaleFactor = cssSize / 500; // base de design 500px

  // Atualiza o ponteiro via CSS var
  document.documentElement.style.setProperty('--ps', String(scaleFactor));
}

// Inicializa/desenha a roleta quando necessário
async function initRoleta() {
  ctx = canvas.getContext("2d");

  sectorAngle = (2 * Math.PI) / opcoes.length;
  sectorDeg = 360 / opcoes.length;

  try {
    if (!bgImg && bgImgSrc) {
      bgImg = await loadImage(bgImgSrc);
    }
  } catch (err) {
    console.warn("Não foi possível carregar a imagem da roleta:", err);
  }

  // Após garantir contexto e imagem, ajusta tamanho e desenha
  resizeCanvasToDisplaySize();
  desenharRoleta();
}

// Desenhar roleta (setores + textos)
function desenharRoleta() {
  // Limpa a área visível (em unidades de CSS px)
  ctx.clearRect(0, 0, cssSize, cssSize);

  // 1) Fundo com imagem recortada em círculo
  if (bgImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();
    // cobre toda a área
    ctx.drawImage(bgImg, 0, 0, cssSize, cssSize);
    ctx.restore();
  } else {
    // fallback: fundo liso
    ctx.beginPath();
    ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fillStyle = "#13463cff";
    ctx.fill();
  }

  // 2) Setores com leve transparência (para ver a imagem por baixo)
  for (let i = 0; i < opcoes.length; i++) {
    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.fillStyle = hexToRgba(cores[i % cores.length], 0.69);
    ctx.arc(radius, radius, radius, i * sectorAngle, (i + 1) * sectorAngle);
    ctx.closePath();
    ctx.fill();
  }

  // 3) Borda externa
  ctx.beginPath();
  ctx.arc(radius, radius, radius - 1, 0, 2 * Math.PI);
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = Math.max(1, 2 * scaleFactor);
  ctx.stroke();

  // 4) Textos por setor
  for (let i = 0; i < opcoes.length; i++) {
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(i * sectorAngle + sectorAngle / 2);
    ctx.fillStyle = "#fff";
    // Fonte escala com o tamanho do canvas (mín 12px, máx ~18px base)
    const fontPx = Math.max(12, Math.round(16 * scaleFactor));
    ctx.font = `bold ${fontPx}px Arial`;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(opcoes[i], radius - (20 * scaleFactor), 0);
    ctx.restore();
  }

  // 5) Miolo central
  ctx.beginPath();
  ctx.arc(radius, radius, 26 * scaleFactor, 0, 2 * Math.PI);
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fill();
  ctx.lineWidth = Math.max(1, 2 * scaleFactor);
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.stroke();
}

// Util: converte hex para rgba com alpha
function hexToRgba(hex, alpha) {
  const c = hex.replace('#', '');
  const bigint = parseInt(c, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

// Mostrar roleta quando clicar no CTA
ctaBtn?.addEventListener("click", () => {
  card.style.display = "none";
  roletaWrap.style.display = "flex";

  // Garante rotação zerada e sem transição antes do primeiro giro
  canvas.style.transition = "none";
  canvas.style.transform = "rotate(0deg)";

  initRoleta();
});

// Lógica de giro com parada exata numa opção
let girando = false;
let jaGirou = false; // trava após o primeiro giro

botaoGirar?.addEventListener("click", () => {
  if (girando || jaGirou) return;
  girando = true;
  jaGirou = true;
  resultadoEl.textContent = "";

  botaoGirar.setAttribute("disabled", "true");
  botaoGirar.style.opacity = "0.6";
  botaoGirar.style.cursor = "not-allowed";

  // Índice aleatório
  const i = Math.floor(Math.random() * opcoes.length);

  // Cálculo da rotação final (seta está no topo; queremos o centro do setor i no topo)
  const voltas = 5 * 360;
  const finalDeg = voltas + (270 - (i + 0.5) * (360 / opcoes.length));

  // Respeita prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dur = prefersReducedMotion ? 0.01 : 4;

  // Aplica giro
  canvas.style.transition = `transform ${dur}s ease-out`;
  canvas.style.transform = `rotate(${finalDeg}deg)`;

  const onEnd = () => {
    canvas.removeEventListener("transitionend", onEnd);
    girando = false;
    const premio = opcoes[i];
    resultadoEl.textContent = `Resultado: ${premio}`;
  };
  canvas.addEventListener("transitionend", onEnd);
});

// Resize/rotate: mantém tudo nítido e alinhado
const ro = new ResizeObserver(() => {
  if (!ctx) return;
  resizeCanvasToDisplaySize();
  desenharRoleta();
});
ro.observe(canvas);

// Também reage à mudança explícita de DPR (ex.: mover janela entre monitores/zoom)
window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)?.addEventListener?.('change', () => {
  if (!ctx) return;
  resizeCanvasToDisplaySize();
  desenharRoleta();
});

// Dica de debug
window.addEventListener("error", (e) => {
  console.warn("Erro global:", e.message);
});



