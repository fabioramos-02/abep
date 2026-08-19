/* Analise executiva IOSPD/ABEPTIC 2026 - MS
   Renderiza analise.html a partir de data/analise.json.
   Helpers compartilhados (COR, nf, pct, esc, barras, rotuloDim) vem de base.js. */

const SITUACAO = {
  cheio: { rotulo: 'Pontuou integralmente', cor: COR.sucesso },
  parcial: { rotulo: 'Pontuou parcialmente', cor: COR.alerta },
  zerado: { rotulo: 'Zerado', cor: COR.erro },
};

/* ---------------- Anel da nota ---------------- */

function anel(resumo) {
  const r = 84, c = 2 * Math.PI * r, frac = resumo.total / resumo.maximo;
  return `
  <svg class="ring" viewBox="0 0 220 220" width="220" height="220" role="img"
       aria-label="Nota final de ${nf(resumo.total, 2)} pontos de 100 possíveis.">
    <circle cx="110" cy="110" r="${r}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="16"/>
    <circle cx="110" cy="110" r="${r}" fill="none" stroke="#fff" stroke-width="16"
            stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - frac)}" transform="rotate(-90 110 110)">
      <animate attributeName="stroke-dashoffset" from="${c}" to="${c * (1 - frac)}" dur="1.1s"
               fill="freeze" calcMode="spline" keySplines="0.22 0.61 0.36 1"/>
    </circle>
    <text x="110" y="104" text-anchor="middle" fill="#fff"
          style="font-family:'Open Sans',sans-serif;font-weight:800;font-size:48px;letter-spacing:-2px">
      ${nf(resumo.total, 1)}</text>
    <text x="110" y="132" text-anchor="middle" fill="#CCDCEC"
          style="font-family:Roboto,sans-serif;font-size:16px">de 100 pontos</text>
  </svg>
  <p class="caption">${nf(resumo.perda, 2)} pontos perdidos · ${resumo.qtd} exigências</p>`;
}

/* ---------------- 1. Visao geral ---------------- */

function visaoGeral(r) {
  const share = (n) => pct(n / r.qtd);

  document.getElementById('anchor-geral').innerHTML =
    `Das ${r.qtd} exigências avaliadas, <strong>${r.cheios} pontuaram integralmente</strong> (${share(r.cheios)}), ` +
    `${r.parciais} pontuaram em parte (${share(r.parciais)}) e ${r.zerados} ficaram zeradas (${share(r.zerados)}). ` +
    `Os itens zerados são ${share(r.zerados)} do total mas respondem por ` +
    `<strong>${pct(r.perda_zerados / r.perda)} de tudo que foi perdido</strong> — é onde está a maior concentração.`;

  document.getElementById('kpis').innerHTML = [
    { label: 'Nota final', valor: nf(r.total, 2), sufixo: ' de 100', classe: '',
      hint: `${nf(r.perda, 2)} pontos perdidos.` },
    { label: 'Pontuaram integralmente', valor: String(r.cheios), sufixo: ` de ${r.qtd}`, classe: 'is-good',
      hint: `${share(r.cheios)} das exigências.` },
    { label: 'Pontuaram parcialmente', valor: String(r.parciais), sufixo: ` de ${r.qtd}`, classe: '',
      hint: `${share(r.parciais)} das exigências · ${nf(r.perda_parciais, 2)} pts.` },
    { label: 'Zerados', valor: String(r.zerados), sufixo: ` de ${r.qtd}`, classe: 'is-bad',
      hint: `${share(r.zerados)} das exigências · ${nf(r.perda_zerados, 2)} pts.` },
  ].map((k) => `
    <article class="kpi ${k.classe}">
      <p class="label">${k.label}</p>
      <span class="num">${k.valor}<small>${k.sufixo}</small></span>
      <p class="hint">${k.hint}</p>
    </article>`).join('');

  const linhas = [
    ['Pontuaram integralmente', r.cheios, 0, COR.sucesso],
    ['Pontuaram parcialmente', r.parciais, r.perda_parciais, COR.alerta],
    ['Zerados', r.zerados, r.perda_zerados, COR.erro],
    ['Não enviados na coleta', r.nao_enviados, r.perda_nao_enviados, '#6E757A'],
    ['Comprovados, mas sem pontuação', r.comprovados_sem_ponto, 2.5, '#6E757A'],
  ];

  document.getElementById('tab-situacao').innerHTML = linhas.map(([nome, qtd, perda, cor], i) => `
    <tr${i >= 3 ? ' class="sub-linha"' : ''}>
      <th scope="row"><span class="dot" style="background:${cor}" aria-hidden="true"></span>${nome}</th>
      <td class="n">${qtd}</td>
      <td class="n">${pct(qtd / r.qtd)}</td>
      <td class="n">${perda ? nf(perda, 2) : '—'}</td>
      <td class="n">${perda ? pct(perda / r.perda) : '—'}</td>
    </tr>`).join('') + `
    <tr class="total">
      <th scope="row">Total avaliado</th>
      <td class="n">${r.qtd}</td>
      <td class="n">100,0%</td>
      <td class="n">${nf(r.perda, 2)}</td>
      <td class="n">100,0%</td>
    </tr>`;

  document.getElementById('nota-geral').innerHTML =
    `<strong>Sobre as duas últimas linhas:</strong> elas recortam as três primeiras e por isso não somam no total.
     <em>Não enviados</em> são os ${r.nao_enviados} itens que o registro interno marcou como sem envio de evidência
     no fechamento da coleta — dois deles pontuaram mesmo assim, então falta de envio não equivale a nota zero.
     <em>Comprovados sem pontuação</em> é o item 4.5: a avaliação aceitou a evidência e ainda assim atribuiu zero.
     A divergência está na planilha de origem e não foi corrigida aqui.`;
}

/* ---------------- 2. Por dimensao ---------------- */

function porDimensao(dados) {
  const { resumo, dimensoes } = dados;
  const ordenadas = [...dimensoes].sort((a, b) => b.aproveitamento - a.aproveitamento);
  const melhor = ordenadas[0], pior = ordenadas[ordenadas.length - 1];
  const maiorPerda = [...dimensoes].sort((a, b) => b.perda - a.perda)[0];

  document.getElementById('anchor-dim').innerHTML =
    `A <strong>${esc(rotuloDim(melhor.numero, melhor.nome))}</strong> tem o melhor desempenho ` +
    `(${pct(melhor.aproveitamento)}) e a <strong>${esc(rotuloDim(pior.numero, pior.nome))}</strong> o pior ` +
    `(${pct(pior.aproveitamento)}). Como os pesos são diferentes, a que mais custou ponto é a ` +
    `<strong>${esc(rotuloDim(maiorPerda.numero, maiorPerda.nome))}</strong>: ${nf(maiorPerda.perda, 2)} dos ` +
    `${nf(resumo.perda, 2)} pontos perdidos, ${pct(maiorPerda.share_perda)} do total.`;

  document.getElementById('chart-aproveitamento').innerHTML = barras({
    itens: ordenadas.map((d) => ({
      rotulo: rotuloDim(d.numero, d.nome),
      detalhe: `${d.cheios} integrais · ${d.parciais} parciais · ${d.zerados} zerados · perde ${nf(d.perda, 2)} pts`,
      valor: d.aproveitamento,
      cor: corPorAproveitamento(d.aproveitamento),
    })),
    maximo: 1,
    cor: COR.primaria,
    formata: (v) => pct(v),
    referencia: { valor: resumo.total / resumo.maximo, rotulo: `média do Estado ${pct(resumo.total / resumo.maximo)}` },
    aria: 'Desempenho de cada dimensão: ' +
      ordenadas.map((d) => `${rotuloDim(d.numero, d.nome)}, ${pct(d.aproveitamento)}`).join('; ') + '.',
  });

  document.getElementById('tab-dim').innerHTML = dimensoes.map((d) => `
    <tr>
      <th scope="row">${esc(rotuloDim(d.numero, d.nome))}</th>
      <td class="n">${nf(d.peso, 0)}</td>
      <td class="n">${d.qtd}</td>
      <td class="n">${d.cheios} <small>(${pct(d.cheios / d.qtd)})</small></td>
      <td class="n">${d.parciais} <small>(${pct(d.parciais / d.qtd)})</small></td>
      <td class="n">${d.zerados} <small>(${pct(d.zerados / d.qtd)})</small></td>
      <td class="n">${d.nao_enviados} <small>(${pct(d.nao_enviados / d.qtd)})</small></td>
      <td class="n">${nf(d.pontos, 2)} / ${nf(d.maximo, 0)}</td>
      <td class="n"><strong>${pct(d.aproveitamento)}</strong></td>
    </tr>`).join('');

  const s = (campo) => dimensoes.reduce((t, d) => t + d[campo], 0);
  document.getElementById('tab-dim-total').innerHTML = `
    <tr class="total">
      <th scope="row">Total</th>
      <td class="n">100</td>
      <td class="n">${s('qtd')}</td>
      <td class="n">${s('cheios')}</td>
      <td class="n">${s('parciais')}</td>
      <td class="n">${s('zerados')}</td>
      <td class="n">${s('nao_enviados')}</td>
      <td class="n">${nf(resumo.total, 2)} / 100</td>
      <td class="n"><strong>${pct(resumo.total / resumo.maximo)}</strong></td>
    </tr>`;

  document.getElementById('dim-cards').innerHTML = dimensoes.map((d) => `
    <article class="dim-card">
      <p class="dim-card-num">Dimensão ${ROMANO[d.numero]}</p>
      <h3>${esc(d.nome)}</h3>
      <p class="dim-card-desc">${esc(d.descricao)}</p>
      <div class="dim-card-bar" role="img"
           aria-label="Desempenho de ${pct(d.aproveitamento)}, perdendo ${nf(d.perda, 2)} pontos.">
        <i style="width:${(d.aproveitamento * 100).toFixed(1)}%;background:${corPorAproveitamento(d.aproveitamento)}"></i>
      </div>
      <p class="dim-card-foot">
        <strong>${pct(d.aproveitamento)}</strong> de aproveitamento ·
        peso ${nf(d.peso, 0)} pts · perde ${nf(d.perda, 2)} pts
      </p>
    </article>`).join('');
}

/* ---------------- 3. Baixo desempenho ---------------- */

function situacaoDe(i) {
  return i.status === 'zerado' ? 'zerado' : 'parcial';
}

function cartaoItem(i, nomes) {
  const marcas = [
    `<span class="tag tag-${i.status}">${SITUACAO[i.status].rotulo}</span>`,
    i.enviado ? '' : '<span class="tag tag-neutro">Não enviado na coleta</span>',
    i.comprovado_sem_ponto ? '<span class="tag tag-neutro">Comprovado sem pontuação</span>' : '',
  ].join('');

  return `
  <article class="item" data-dim="${i.dimensao}" data-situacao="${situacaoDe(i)}"
           data-enviado="${i.enviado}" data-orgaos="${esc(i.orgaos.join('|'))}">
    <div class="item-head">
      <span class="code">Item ${esc(i.codigo)}</span>
      <span class="item-dim">${esc(rotuloDim(i.dimensao, nomes[i.dimensao]))}</span>
      <span class="item-perda">−${nf(i.perda, 2)} pts</span>
    </div>
    <p class="item-q">${esc(i.pergunta)}</p>
    <div class="item-meta">
      ${marcas}
      <span class="item-score">${nf(i.pontos, 2)} de ${nf(i.maximo, 2)} · ${pct(i.aproveitamento)}</span>
      <span class="item-org">${i.orgaos.map((o) => esc(o)).join(', ')}${i.atribuicao === 'coordenacao' ? ' <small>(coordenação)</small>' : ''}</span>
    </div>
    ${i.observacao ? `<p class="item-obs"><strong>Avaliação:</strong> ${esc(i.observacao)}</p>` : ''}
  </article>`;
}

function baixoDesempenho(dados) {
  const { resumo, dimensoes, indicadores } = dados;
  const nomes = Object.fromEntries(dimensoes.map((d) => [d.numero, d.nome]));
  const baixos = indicadores
    .filter((i) => i.perda > 0 || !i.enviado)
    .sort((a, b) => b.perda - a.perda || a.codigo.localeCompare(b.codigo));

  document.getElementById('anchor-baixo').innerHTML =
    `${baixos.length} exigências custaram ponto ou ficaram sem envio de evidência. ` +
    `As cinco maiores sozinhas valem <strong>${nf(baixos.slice(0, 5).reduce((s, i) => s + i.perda, 0), 2)} pontos</strong>, ` +
    `${pct(baixos.slice(0, 5).reduce((s, i) => s + i.perda, 0) / resumo.perda)} de toda a perda. ` +
    `A lista está ordenada pelo impacto na nota.`;

  const alvo = document.getElementById('lista-baixo');
  alvo.innerHTML = baixos.map((i) => cartaoItem(i, nomes)).join('');

  const selDim = document.getElementById('f-dim');
  const selSit = document.getElementById('f-situacao');
  const selOrg = document.getElementById('f-orgao');
  const contador = document.getElementById('contador');

  selDim.innerHTML += dimensoes
    .map((d) => `<option value="${d.numero}">${esc(rotuloDim(d.numero, d.nome))}</option>`).join('');
  selOrg.innerHTML += [...new Set(baixos.flatMap((i) => i.orgaos))].sort()
    .map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('');

  function aplicar() {
    let visiveis = 0, perda = 0;
    baixos.forEach((i, idx) => {
      const el = alvo.children[idx];
      const ok =
        (!selDim.value || i.dimensao === selDim.value) &&
        (!selOrg.value || i.orgaos.includes(selOrg.value)) &&
        (!selSit.value ||
          (selSit.value === 'naoenviado' ? !i.enviado : situacaoDe(i) === selSit.value));
      el.hidden = !ok;
      if (ok) { visiveis += 1; perda += i.perda; }
    });
    contador.textContent = `Mostrando ${visiveis} de ${baixos.length} itens · ${nf(perda, 2)} pontos`;
  }

  [selDim, selSit, selOrg].forEach((el) => el.addEventListener('change', aplicar));
  aplicar();
}

/* ---------------- 4. Responsabilidade ---------------- */

function responsabilidade(dados) {
  const { resumo, responsaveis } = dados;
  const comPerda = responsaveis.filter((o) => o.perda > 0.005);
  const topo = comPerda[0];

  document.getElementById('anchor-orgao').innerHTML =
    `<strong>${esc(topo.orgao)}</strong> concentra ${nf(topo.perda, 2)} dos ${nf(resumo.perda, 2)} pontos perdidos ` +
    `(${pct(topo.perda / resumo.perda)}), em ${topo.zerados} itens zerados e ${topo.parciais} parciais. ` +
    `A concentração é esperada: as dimensões de governança, marco legal e experiência do usuário são transversais ` +
    `e não têm ponto focal setorial. Os demais órgãos respondem por ${nf(resumo.perda - topo.perda, 2)} pontos.`;

  document.getElementById('chart-orgao').innerHTML = barras({
    itens: comPerda.map((o) => ({
      rotulo: o.orgao,
      detalhe: `${o.zerados} zerados · ${o.parciais} parciais · ${o.nao_enviados} não enviados`,
      valor: o.perda,
      cor: COR.erro,
    })),
    maximo: Math.max(...comPerda.map((o) => o.perda)),
    cor: COR.erro,
    formata: (v) => nf(v, 2) + ' pts',
    aria: 'Pontos a recuperar por órgão: ' +
      comPerda.map((o) => `${o.orgao}, ${nf(o.perda, 2)} pontos`).join('; ') + '.',
  });

  document.getElementById('tab-orgao').innerHTML = responsaveis.map((o) => `
    <tr${o.perda < 0.005 ? ' class="sub-linha"' : ''}>
      <th scope="row">${esc(o.orgao)}</th>
      <td class="n">${o.qtd}</td>
      <td class="n">${o.zerados || '—'}</td>
      <td class="n">${o.parciais || '—'}</td>
      <td class="n">${o.nao_enviados || '—'}</td>
      <td class="n"><strong>${o.perda >= 0.005 ? nf(o.perda, 2) : '—'}</strong></td>
      <td class="code-list">${o.pendentes.length ? o.pendentes.map(esc).join(', ') : 'sem pendência'}</td>
    </tr>`).join('') + `
    <tr class="total">
      <th scope="row">Total</th>
      <td class="n">—</td><td class="n">—</td><td class="n">—</td><td class="n">—</td>
      <td class="n"><strong>${nf(responsaveis.reduce((s, o) => s + o.perda, 0), 2)}</strong></td>
      <td></td>
    </tr>`;

  document.getElementById('nota-orgao').innerHTML =
    `<strong>Como ler o rateio:</strong> um item atribuído a mais de um órgão aparece na contagem de todos eles,
     mas a perda é dividida em partes iguais — por isso a coluna de itens não soma 44 e a de pontos soma
     ${nf(resumo.perda, 2)}. Itens transversais sem ponto focal setorial no registro interno foram atribuídos
     à coordenação (SETDIG).`;
}

/* ---------------- 5. Comparacao nacional ---------------- */

function comparacaoNacional(dados) {
  if (dados.nacional) return; // preenchido quando a planilha das 27 UFs entrar na base

  document.getElementById('h5').textContent = 'Comparação com os demais estados — pendente de dado';
  document.getElementById('lacuna').innerHTML = `
    <p><strong>Esta seção não foi produzida porque o dado não existe na base disponível.</strong></p>
    <p>A planilha usada nesta análise traz apenas as linhas de Mato Grosso do Sul: 44 exigências, uma coluna de
      unidade federativa preenchida com “MS” em todas elas. Não há registro dos demais estados, nem média nacional,
      nem posição de MS no conjunto.</p>
    <p>Para responder ao que foi pedido — quantos estados zeraram cada item, quantos pontuaram parcialmente,
      se a dificuldade é comum ou específica de MS — é preciso o <strong>relatório consolidado do ciclo 2026 com as
      27 unidades federativas</strong>, no mesmo formato item a item. Com esse arquivo, o cruzamento entra aqui
      sem mudar nenhuma outra seção.</p>
    <p class="lacuna-acao">Enquanto o arquivo não chega, os itens zerados e parciais de MS estão listados na
      <a href="#s3">seção 3</a>, prontos para o cruzamento.</p>`;
}

/* ---------------- 6. Achados ---------------- */

function achados(dados) {
  const { resumo, dimensoes, indicadores, responsaveis } = dados;
  const nomes = Object.fromEntries(dimensoes.map((d) => [d.numero, d.nome]));
  const rot = (n) => rotuloDim(n, nomes[n]);
  const ord = [...dimensoes].sort((a, b) => b.aproveitamento - a.aproveitamento);
  const maiores = [...indicadores].filter((i) => i.perda > 0).sort((a, b) => b.perda - a.perda).slice(0, 5);
  const normativos = indicadores.filter((i) => ['1.4', '1.6', '5.1', '3.4'].includes(i.codigo));
  const ganhoNormativo = normativos.reduce((s, i) => s + i.perda, 0);

  const blocos = [
    {
      tipo: 'forte',
      titulo: 'Pontos fortes',
      itens: [
        `<strong>${rot(ord[0].numero)}</strong> é a dimensão mais madura, com ${pct(ord[0].aproveitamento)} de
         aproveitamento e apenas ${nf(ord[0].perda, 2)} pontos perdidos.`,
        `A oferta de serviço digital está consolidada: a <strong>${rot('2')}</strong> tem
         ${dimensoes.find((d) => d.numero === '2').cheios} de 12 exigências pontuando integralmente,
         cobrindo rematrícula, receita médica, transferência de veículos e medicamentos.`,
        `Os fundamentos institucionais estão de pé — estratégia vigente, órgão responsável, colegiado de
         coordenação, assinatura eletrônica, pagamento por PIX, unidade de cibersegurança e equipe de resposta a
         incidentes pontuaram integralmente.`,
        `Em inovação, APIs abertas, laboratório de inovação e apoio à transformação digital dos municípios
         pontuaram integralmente.`,
      ],
    },
    {
      tipo: 'fraco',
      titulo: 'Principais fragilidades',
      itens: [
        `<strong>${rot(ord[ord.length - 1].numero)}</strong> é a pior dimensão em desempenho
         (${pct(ord[ord.length - 1].aproveitamento)}) <em>e</em> a maior perda absoluta
         (${nf(ord[ord.length - 1].perda, 2)} pontos). O Estado entrega o serviço, mas tropeça em comprovar
         acessibilidade, uso efetivo, participação do usuário e inclusão digital.`,
        `A ausência de <strong>política estadual de IA</strong> e de <strong>estrutura de governança de dados</strong>
         zera dois itens que são pré-requisito de várias outras exigências.`,
        `Falta comprovação de <strong>barramento estadual de interoperabilidade</strong>: existe infraestrutura de
         rede e integração federal, mas não norma técnica nem catálogo público de APIs.`,
        `${resumo.nao_enviados} exigências ficaram sem envio de evidência no fechamento da coleta — um problema
         de processo de coleta, não de política pública.`,
      ],
    },
    {
      tipo: 'impacto',
      titulo: 'Itens que mais impactaram o resultado',
      itens: maiores.map((i) =>
        `<strong>${esc(i.codigo)}</strong> — ${esc(i.pergunta)} <em>(${rot(i.dimensao)}, −${nf(i.perda, 2)} pts)</em>`),
    },
    {
      tipo: 'chance',
      titulo: 'Oportunidades com maior potencial de ganho',
      itens: [
        `Quatro itens dependem essencialmente de <strong>ato normativo ou estrutura formal</strong> — ${
          normativos.map((i) => i.codigo).join(', ')} — e valem juntos <strong>${nf(ganhoNormativo, 2)} pontos</strong>,
         sem exigir desenvolvimento de sistema.`,
        `O item <strong>4.5</strong> vale 2,50 pontos e está registrado como evidência comprovada com nota zero.
         Antes de qualquer ação técnica, cabe <strong>questionar a divergência junto à ABEP-TIC</strong>.`,
        `Os ${resumo.parciais} itens parciais custaram ${nf(resumo.perda_parciais, 2)} pontos e a maioria depende de
         <strong>completar evidência já existente</strong>: normativa de teleconsulta, telas do app de saúde,
         publicação dos dados de satisfação.`,
        `Concentrar esforço em <strong>${responsaveis[0].orgao}</strong> alcança ${
          pct(responsaveis[0].perda / resumo.perda)} de toda a perda com um único interlocutor.`,
      ],
    },
    {
      tipo: 'lacuna',
      titulo: 'O que esta análise ainda não responde',
      itens: [
        `Se MS está <strong>acima ou abaixo da média nacional</strong> em cada item — depende da planilha
         consolidada das 27 unidades federativas, ainda não disponível.`,
        `Se os itens zerados são <strong>dificuldade comum entre os estados</strong> ou fragilidade específica de MS.
         Sem essa leitura, um zero em política de IA e um zero em certificado de ensino médio parecem igualmente
         graves — e provavelmente não são.`,
      ],
    },
  ];

  document.getElementById('achados').innerHTML = blocos.map((b) => `
    <article class="achado achado-${b.tipo}">
      <h3>${b.titulo}</h3>
      <ul>${b.itens.map((t) => `<li>${t}</li>`).join('')}</ul>
    </article>`).join('');
}

/* ---------------- 7. Recomendacoes ---------------- */

const FAIXA = {
  1: { rotulo: 'Curto prazo', desc: 'documento, evidência ou ato normativo' },
  2: { rotulo: 'Médio prazo', desc: 'norma técnica, processo ou revisão de conteúdo' },
  3: { rotulo: 'Longo prazo', desc: 'sistema novo, programa novo ou infraestrutura' },
};

function recomendacoes(dados) {
  const { resumo, dimensoes, prioridades } = dados;
  const nomes = Object.fromEntries(dimensoes.map((d) => [d.numero, d.nome]));
  const curto = prioridades.filter((p) => p.esforco === 1);
  const ganhoCurto = curto.reduce((s, p) => s + p.ganho, 0);

  document.getElementById('anchor-reco').innerHTML =
    `<strong>${curto.length} das ${prioridades.length} ações são de curto prazo</strong> — dependem de documento,
     evidência ou ato normativo, não de desenvolvimento. Somam <strong>${nf(ganhoCurto, 2)} pontos</strong>,
     ${pct(ganhoCurto / resumo.perda)} de tudo que foi perdido. Executadas, levariam a nota de
     ${nf(resumo.total, 2)} para <strong>${nf(resumo.total + ganhoCurto, 2)}</strong>.`;

  let faixaAtual = 0;
  document.getElementById('tab-reco').innerHTML = prioridades.map((p, idx) => {
    const cabecalho = p.esforco !== faixaAtual
      ? (faixaAtual = p.esforco,
        `<tr class="faixa"><th colspan="6" scope="colgroup">${FAIXA[p.esforco].rotulo} — ${FAIXA[p.esforco].desc}</th></tr>`)
      : '';
    return cabecalho + `
      <tr>
        <td class="n">${idx + 1}</td>
        <td class="code">${esc(p.codigo)}<br><small>${esc(rotuloDim(p.dimensao, nomes[p.dimensao]))}</small></td>
        <td>${esc(p.pergunta)}</td>
        <td>${esc(p.acao)}</td>
        <td>${p.orgaos.map(esc).join(', ')}</td>
        <td class="n"><strong>+${nf(p.ganho, 2)}</strong></td>
      </tr>`;
  }).join('');
}

/* ---------------- Montagem ---------------- */

function montar(dados) {
  document.getElementById('score').innerHTML = anel(dados.resumo);
  visaoGeral(dados.resumo);
  porDimensao(dados);
  baixoDesempenho(dados);
  responsabilidade(dados);
  comparacaoNacional(dados);
  achados(dados);
  recomendacoes(dados);
}

fetch('data/analise.json')
  .then((r) => {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then(montar)
  .catch((e) => {
    document.getElementById('conteudo').insertAdjacentHTML('afterbegin',
      `<p class="note"><strong>Não foi possível carregar os dados.</strong>
       Abra a página por um servidor local (<code>python -m http.server</code>) e não pelo arquivo direto.
       (${esc(e.message)})</p>`);
  });
