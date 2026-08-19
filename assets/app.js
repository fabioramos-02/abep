/* Relatorio IOSPD/ABEPTIC 2026 - MS
   Renderiza a pagina a partir de data/indicadores.json. Sem dependencias. */

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

/* ---------------- Anel da nota final ---------------- */

function anelNota(resumo) {
  const r = 84, c = 2 * Math.PI * r;
  const frac = resumo.total / resumo.maximo;
  return `
  <svg class="ring" viewBox="0 0 220 220" width="220" height="220" role="img"
       aria-label="Nota final de ${nf(resumo.total, 2)} pontos de 100 possíveis, ou seja ${pct(frac)} do total.">
    <circle cx="110" cy="110" r="${r}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="16"/>
    <circle cx="110" cy="110" r="${r}" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="butt"
            stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - frac)}"
            transform="rotate(-90 110 110)">
      <animate attributeName="stroke-dashoffset" from="${c}" to="${c * (1 - frac)}" dur="1.1s"
               fill="freeze" calcMode="spline" keySplines="0.22 0.61 0.36 1"/>
    </circle>
    <text x="110" y="104" text-anchor="middle" fill="#fff"
          style="font-family:'Open Sans',sans-serif;font-weight:800;font-size:48px;letter-spacing:-2px">
      ${nf(resumo.total, 1)}
    </text>
    <text x="110" y="132" text-anchor="middle" fill="#CCDCEC"
          style="font-family:Roboto,sans-serif;font-size:16px">de 100 pontos</text>
  </svg>
  <p class="caption">Ciclo 2026 · ${resumo.qtd} exigências avaliadas</p>`;
}

/* ---------------- KPIs ---------------- */

function kpis(resumo) {
  const cards = [
    {
      label: 'Nota final do Estado',
      valor: nf(resumo.total, 2),
      sufixo: ' de 100',
      hint: `Faltaram ${nf(resumo.perda, 1)} pontos para a nota máxima.`,
      classe: '',
    },
    {
      label: 'Atendidas por inteiro',
      valor: String(resumo.cheios),
      sufixo: ` de ${resumo.qtd}`,
      hint: 'Exigências que receberam toda a pontuação possível.',
      classe: 'is-good',
    },
    {
      label: 'Atendidas em parte',
      valor: String(resumo.parciais),
      sufixo: ` de ${resumo.qtd}`,
      hint: 'Existe a iniciativa, mas falta um pedaço do que era exigido.',
      classe: '',
    },
    {
      label: 'Não pontuaram',
      valor: String(resumo.zerados),
      sufixo: ` de ${resumo.qtd}`,
      hint: `Concentram ${pct(resumo.share_zerados)} de tudo que foi perdido.`,
      classe: 'is-bad',
    },
  ];
  return cards.map((k, i) => `
    <article class="kpi ${k.classe}" style="animation:rise .5s both;animation-delay:${i * 90}ms">
      <p class="label">${k.label}</p>
      <span class="num">${k.valor}<small>${k.sufixo}</small></span>
      <p class="hint">${k.hint}</p>
    </article>`).join('');
}

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

/* ---------------- Tabelas ---------------- */

function linhaParcial(i, nomes) {
  return `<tr>
    <td class="code">${esc(i.codigo)}</td>
    <td>${esc(rotuloDim(i.dimensao, nomes[i.dimensao]))}</td>
    <td>${esc(i.pergunta)}</td>
    <td>
      <span class="minibar" aria-hidden="true"><i style="width:${(i.aproveitamento * 100).toFixed(1)}%"></i></span>
      ${pct(i.aproveitamento)}
    </td>
    <td class="n">${nf(i.perda, 2)}</td>
  </tr>`;
}

function linhaTodos(i, nomes) {
  return `<tr>
    <td class="code">${esc(i.codigo)}</td>
    <td>${esc(rotuloDim(i.dimensao, nomes[i.dimensao]))}</td>
    <td>${esc(i.pergunta)}</td>
    <td><span class="tag tag-${i.status}">${ROTULO_STATUS[i.status]}</span></td>
    <td class="n">${nf(i.pontos, 2)} / ${nf(i.maximo, 2)}</td>
  </tr>`;
}

/* ---------------- Montagem ---------------- */

function montar(dados) {
  const { resumo, dimensoes, indicadores } = dados;
  const nomes = Object.fromEntries(dimensoes.map((d) => [d.numero, d.nome]));

  document.getElementById('score').innerHTML = anelNota(resumo);
  document.getElementById('kpis').innerHTML = kpis(resumo);

  /* --- Grafico A: aproveitamento --- */
  const porAproveitamento = [...dimensoes].sort((a, b) => b.aproveitamento - a.aproveitamento);
  const melhor = porAproveitamento[0], pior = porAproveitamento[porAproveitamento.length - 1];
  document.getElementById('anchor-dim').innerHTML =
    `A <strong>${esc(rotuloDim(melhor.numero, melhor.nome))}</strong> é a mais madura ` +
    `(${pct(melhor.aproveitamento)} da nota possível). ` +
    `A <strong>${esc(rotuloDim(pior.numero, pior.nome))}</strong> é a mais frágil: só ${pct(pior.aproveitamento)}, ` +
    `com ${pior.cheios} de ${pior.qtd} exigências atendidas por inteiro.`;

  document.getElementById('chart-aproveitamento').innerHTML = barras({
    itens: porAproveitamento.map((d) => ({
      rotulo: rotuloDim(d.numero, d.nome),
      detalhe: `${d.cheios} de ${d.qtd} atendidas por inteiro`,
      valor: d.aproveitamento,
      cor: corPorAproveitamento(d.aproveitamento),
    })),
    maximo: 1,
    cor: COR.primaria,
    formata: (v) => pct(v),
    referencia: { valor: resumo.total / resumo.maximo, rotulo: `média geral ${pct(resumo.total / resumo.maximo)}` },
    aria: 'Percentual da nota máxima obtido em cada dimensão: ' +
      porAproveitamento.map((d) => `${rotuloDim(d.numero, d.nome)}, ${pct(d.aproveitamento)}`).join('; ') + '.',
  });

  /* --- Grafico B: perda absoluta --- */
  const porPerda = [...dimensoes].sort((a, b) => b.perda - a.perda);
  const top2 = porPerda.slice(0, 2);
  document.getElementById('anchor-perda').innerHTML =
    `Duas dimensões — <strong>${esc(rotuloDim(top2[0].numero, top2[0].nome))}</strong> e ` +
    `<strong>${esc(rotuloDim(top2[1].numero, top2[1].nome))}</strong> — ` +
    `respondem por ${nf(top2[0].perda + top2[1].perda, 1)} dos ${nf(resumo.perda, 1)} pontos perdidos, ` +
    `ou seja ${pct((top2[0].perda + top2[1].perda) / resumo.perda)} de todo o prejuízo na nota.`;

  document.getElementById('chart-perda').innerHTML = barras({
    itens: porPerda.map((d) => ({
      rotulo: rotuloDim(d.numero, d.nome),
      detalhe: `${nf(d.pontos, 1)} de ${nf(d.maximo, 0)} pontos obtidos`,
      valor: d.perda,
      cor: COR.erro,
    })),
    maximo: Math.max(...porPerda.map((d) => d.perda)),
    cor: COR.erro,
    formata: (v) => nf(v, 2) + ' pts',
    aria: 'Pontos perdidos em cada dimensão: ' +
      porPerda.map((d) => `${rotuloDim(d.numero, d.nome)}, ${nf(d.perda, 2)} pontos`).join('; ') + '.',
  });

  /* --- Zerados --- */
  const zerados = indicadores.filter((i) => i.status === 'zerado').sort((a, b) => b.perda - a.perda);
  document.getElementById('anchor-zeros').innerHTML =
    `Juntas, estas 7 exigências valiam <strong>${nf(resumo.perda_zerados, 2)} pontos</strong> — ` +
    `<strong>${pct(resumo.share_zerados)} de tudo que o Estado deixou na mesa</strong>. ` +
    `Três delas (governança de dados, interoperabilidade e política de IA) dependem de ato normativo e ` +
    `estrutura formal, não de construir sistema novo: valem ${nf(zerados.filter((z) => ['1.4', '1.6', '5.1'].includes(z.codigo)).reduce((s, z) => s + z.perda, 0), 2)} pontos.`;

  document.getElementById('zeros').innerHTML = zerados.map((z) => `
    <article class="zero">
      <p class="dim">${esc(rotuloDim(z.dimensao, nomes[z.dimensao]))}</p>
      <span class="code">Item ${esc(z.codigo)}</span>
      <p class="q">${esc(z.pergunta)}</p>
      <p class="lost">${nf(z.perda, 2)} <small>pontos perdidos</small></p>
    </article>`).join('');

  const divergente = zerados.find((z) => z.classificacao === 'Evidência Comprovada');
  document.getElementById('nota-zeros').innerHTML = divergente
    ? `<strong>Sobre o item ${esc(divergente.codigo)}:</strong> a avaliação registrou a evidência como comprovada,
       mas atribuiu zero ponto. Como o efeito na nota é o mesmo de uma exigência não atendida, ele aparece aqui
       entre os que não pontuaram. A divergência de classificação está na planilha de origem e não foi corrigida.`
    : '';

  /* --- Parciais --- */
  const parciais = indicadores.filter((i) => i.status === 'parcial')
    .sort((a, b) => a.dimensao.localeCompare(b.dimensao) || b.perda - a.perda);
  const perdaParciais = parciais.reduce((s, i) => s + i.perda, 0);
  const parciaisPorDim = dimensoes
    .map((d) => ({ d, itens: parciais.filter((i) => i.dimensao === d.numero) }))
    .filter((g) => g.itens.length)
    .sort((a, b) => b.itens.reduce((s, i) => s + i.perda, 0) - a.itens.reduce((s, i) => s + i.perda, 0));
  const lider = parciaisPorDim[0];

  document.getElementById('anchor-parciais').innerHTML =
    `${parciais.length} exigências foram atendidas só em parte e custaram <strong>${nf(perdaParciais, 2)} pontos</strong>. ` +
    `São os casos mais baratos de corrigir: a iniciativa já existe, falta completar o que foi exigido. ` +
    `A concentração está na <strong>${esc(rotuloDim(lider.d.numero, lider.d.nome))}</strong>, ` +
    `com ${lider.itens.length} exigências pela metade e ` +
    `${nf(lider.itens.reduce((s, i) => s + i.perda, 0), 2)} pontos perdidos.`;

  document.getElementById('parciais-por-dim').innerHTML = parciaisPorDim.map((g) => `
    <li>
      <span class="dim-name">${esc(rotuloDim(g.d.numero, g.d.nome))}</span>
      <span class="dim-qtd">${g.itens.length} ${g.itens.length === 1 ? 'exigência' : 'exigências'}</span>
      <span class="dim-perda">${nf(g.itens.reduce((s, i) => s + i.perda, 0), 2)} pts perdidos</span>
    </li>`).join('');
  document.getElementById('parciais').innerHTML = parciais.map((i) => linhaParcial(i, nomes)).join('');

  /* --- Tabela completa + filtros --- */
  const selDim = document.getElementById('f-dim');
  selDim.innerHTML += dimensoes
    .map((d) => `<option value="${d.numero}">${esc(rotuloDim(d.numero, d.nome))}</option>`).join('');

  const corpo = document.getElementById('todos');
  const contador = document.getElementById('contador');
  const selStatus = document.getElementById('f-status');
  const busca = document.getElementById('f-busca');

  function aplicar() {
    const termo = busca.value.trim().toLowerCase();
    const lista = indicadores.filter((i) =>
      (!selDim.value || i.dimensao === selDim.value) &&
      (!selStatus.value || i.status === selStatus.value) &&
      (!termo || (i.pergunta + ' ' + i.codigo).toLowerCase().includes(termo)));

    corpo.innerHTML = lista.length
      ? lista.map((i) => linhaTodos(i, nomes)).join('')
      : '<tr><td colspan="5">Nenhuma exigência encontrada com esses filtros.</td></tr>';
    contador.textContent = `Mostrando ${lista.length} de ${indicadores.length} exigências`;
  }

  [selDim, selStatus].forEach((el) => el.addEventListener('change', aplicar));
  busca.addEventListener('input', aplicar);
  aplicar();
}

fetch('data/indicadores.json')
  .then((r) => {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then(montar)
  .catch((e) => {
    document.getElementById('conteudo').insertAdjacentHTML('afterbegin',
      `<p class="note"><strong>Não foi possível carregar os dados.</strong>
       Abra a página por um servidor local (<code>python -m http.server</code>) e não pelo arquivo direto. (${esc(e.message)})</p>`);
  });
