/* Base compartilhada entre index.html e analise.html.
   Tokens de cor, formatadores e o gerador de barras SVG. Sem dependencias. */

const COR = {
  primaria: '#004F9F',
  clara: '#6695C5',
  sucesso: '#198038',
  alerta: '#FF6200',
  erro: '#DA1E28',
  trilho: '#EAEBEC',
};

const ROMANO = { '1': 'I', '2': 'II', '3': 'III', '4': 'IV', '5': 'V' };

/* A avaliacao numera as dimensoes em algarismo romano - a planilha traz so o numero arabe. */
const rotuloDim = (numero, nome) => `Dimensão ${ROMANO[numero]} — ${nome}`;

const ROTULO_STATUS = {
  cheio: 'Atendeu por inteiro',
  parcial: 'Atendeu em parte',
  zerado: 'Não pontuou',
};

const nf = (v, casas = 1) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
const pct = (v) => nf(v * 100, 1) + '%';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------------- Grafico de barras horizontais ---------------- */

function barras({ itens, maximo, cor, formata, aria, referencia }) {
  const LARG = 1080, ROTULO = 300, ALT_BARRA = 34, GAP = 22, PAD_TOP = 8, PAD_BOT = referencia ? 34 : 12;
  const escala = LARG - ROTULO - 130;
  const alt = PAD_TOP + itens.length * (ALT_BARRA + GAP) + PAD_BOT;

  const linhas = itens.map((it, i) => {
    const y = PAD_TOP + i * (ALT_BARRA + GAP);
    const w = Math.max(2, (it.valor / maximo) * escala);
    return `
      <g>
        <text class="lbl" x="0" y="${y + 15}">${esc(it.rotulo)}</text>
        <text class="sub" x="0" y="${y + 31}">${esc(it.detalhe)}</text>
        <rect class="track" x="${ROTULO}" y="${y + 4}" width="${escala}" height="${ALT_BARRA - 8}" rx="3"/>
        <rect class="bar" x="${ROTULO}" y="${y + 4}" width="${w}" height="${ALT_BARRA - 8}" rx="3"
              fill="${it.cor || cor}" style="animation-delay:${i * 110}ms"/>
        <text class="val" x="${ROTULO + w + 12}" y="${y + 22}">${formata(it.valor)}</text>
      </g>`;
  }).join('');

  const ref = referencia ? (() => {
    const x = ROTULO + (referencia.valor / maximo) * escala;
    const yFim = PAD_TOP + itens.length * (ALT_BARRA + GAP);
    return `<line class="ref" x1="${x}" y1="0" x2="${x}" y2="${yFim}"/>
            <text class="ref-lbl" x="${x}" y="${yFim + 18}" text-anchor="middle">${esc(referencia.rotulo)}</text>`;
  })() : '';

  return `<svg class="chart" viewBox="0 0 ${LARG} ${alt}" role="img" aria-label="${esc(aria)}">
    ${ref}${linhas}
  </svg>`;
}

function corPorAproveitamento(v) {
  if (v >= 0.85) return COR.sucesso;
  if (v >= 0.70) return COR.primaria;
  return COR.alerta;
}
