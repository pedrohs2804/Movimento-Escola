import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY, DIAS, DOR_ALERTA } from './config.js';

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const $app = document.getElementById('app');
const $tabs = document.getElementById('tabs');

// ---------------- Dados fixos ----------------
const REGIOES = {
  lombar: 'Lombar', joelho: 'Joelho', quadril: 'Quadril',
  ombro: 'Ombro', cervical: 'Cervical', tornozelo: 'Tornozelo',
};

const RED_FLAGS = [
  ['controle', 'Perda de controle da urina ou das fezes, ou dormência na região genital/entre as pernas'],
  ['fraqueza', 'Fraqueza que está piorando em braço ou perna'],
  ['sistemico', 'Febre, calafrios ou perda de peso sem explicação'],
  ['trauma', 'A dor começou após queda, acidente ou batida forte'],
  ['noturna', 'Dor constante à noite que não melhora com nenhuma posição'],
  ['cancer', 'Histórico de câncer'],
  ['peito', 'Dor no peito, falta de ar ou tontura junto com a dor'],
  ['deformidade', 'Inchaço importante, deformidade ou não consegue apoiar o peso'],
];

const ICON = {
  back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  cal: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M12 14h2M16 14h0M8 17h2"/></svg>',
  flame: '<svg viewBox="0 0 24 24" style="fill:var(--flame);stroke:none"><path d="M12 2c1 3.5 5 5.5 5 11a5 5 0 0 1-10 0c0-2.5 1.2-4 2.5-5 .1 1.8.8 3 2 3.5C11 9 11 5.5 12 2z"/></svg>',
  person: '<svg viewBox="0 0 24 24"><circle cx="13" cy="4.5" r="2"/><path d="M6 20l3.5-6 3 2 1 5M9.5 14l1-5 5 1 3 3M10.5 9l-3 1-2 3"/></svg>',
  chair: '<svg viewBox="0 0 24 24"><circle cx="10" cy="4" r="1.8"/><path d="M10 6.5v6h5l1.5 6.5M10 9l3 1.5M6 9v11M6 15h8M14 15v5"/></svg>',
  shoe: '<svg viewBox="0 0 24 24"><path d="M3 15c0-3 1-6 2-7l3 2 2-1c1 2 3 3 6 3.5 2.5.5 5 1 5 3.5v1H3z"/><path d="M3 18h18"/></svg>',
  stretch: '<svg viewBox="0 0 24 24"><circle cx="13.5" cy="4" r="1.8"/><path d="M13 6.5c-.8 3-1.6 6-3 9M13 7.5c1.5-1.8 3.5-3.8 5.5-4.5M12 10l-3.5 2.5M10 15.5l-3 5M10 15.5l4.5 5"/></svg>',
  bottle: '<svg viewBox="0 0 24 24"><path d="M10 2h4v3l1.5 2v13a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 8.5 20V7L10 5z"/><path d="M8.5 11h7"/></svg>',
  moon: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>',
  bag: '<svg viewBox="0 0 24 24"><rect x="4" y="7" width="16" height="13" rx="2"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/></svg>',
  clip: '<svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/></svg>',
  help: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17.5h0"/></svg>',
  out: '<svg viewBox="0 0 24 24"><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10"/></svg>',
  play: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z"/></svg>',
};

const LOGO = `<svg class="logo" viewBox="0 0 120 110" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="62" cy="24" r="8"/>
  <path d="M58 34c-4 14-9 28-17 42"/>
  <path d="M60 38c8-12 18-22 32-26"/>
  <path d="M55 48 38 60"/>
  <path d="M41 76 26 100M41 76l24 22"/>
  <path d="M100 20c-3-5-10-3-9 2 1 4 9 9 9 9s8-5 9-9c1-5-6-7-9-2z" fill="currentColor" stroke-width="2.5"/>
</svg>`;

const DICAS = [
  ['chair', 'Não fique muito tempo na mesma posição', 'Levante-se, ajuste o corpo e mude de lugar sempre que possível — a cada 30 a 40 minutos.'],
  ['shoe', 'Faça pequenas caminhadas pela sala', 'Mesmo que sejam só 2 minutos entre uma explicação e outra, seu corpo agradece.'],
  ['stretch', 'Alongue-se entre uma turma e outra', 'Pescoço, ombros, costas e pernas. O intervalo é um ótimo momento.'],
  ['bottle', 'Hidrate-se', 'Deixe uma garrafa na mesa. A água ajuda a reduzir a fadiga e as dores musculares.'],
  ['bag', 'Divida o peso do material', 'Use mochila nos dois ombros ou carrinho para livros e cadernos pesados.'],
  ['moon', 'Cuide do sono', 'Dormir bem ajuda o corpo a se recuperar e deixa a dor mais fácil de controlar.'],
];

const FRASES = [
  'Pequenos movimentos geram grandes mudanças!',
  'Movimento é saúde, é bem-estar, é você!',
  'Você cuida de tantas pessoas. Agora é a sua vez.',
  'Constância vale mais que intensidade.',
];

// ---------------- Utilitários ----------------
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ymd = (d) => d.toLocaleDateString('sv-SE');
const hoje = () => ymd(new Date());
const primeiroNome = () => (state.nome || '').trim().split(/\s+/)[0] || '';
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const state = {
  user: null, nome: '', triagem: null,
  sessoes: [], exercicios: [], videoUrls: {},
  view: 'inicio', voltar: 'inicio',
};

// ---------------- Auth / boot ----------------
sb.auth.onAuthStateChange((evt, session) => {
  if (evt === 'PASSWORD_RECOVERY') {
    state.user = session?.user ?? null;
    return setTimeout(renderNovaSenha, 0);
  }
  if (!['INITIAL_SESSION', 'SIGNED_IN', 'SIGNED_OUT'].includes(evt)) return;
  if (evt === 'SIGNED_IN' && state.user?.id === session?.user?.id) return;
  state.user = session?.user ?? null;
  setTimeout(boot, 0); // não chamar o Supabase dentro do callback
});

$tabs.addEventListener('click', (e) => {
  const v = e.target.closest('button')?.dataset.view;
  if (v) go(v);
});

async function boot() {
  if (!state.user) { mostrarTabs(false); return renderAuth(); }
  $app.innerHTML = '<p class="muted center pad">Carregando…</p>';
  try {
    const [tri, perfil] = await Promise.all([
      sb.from('triagens').select('*').order('created_at', { ascending: false }).limit(1),
      sb.from('profiles').select('nome').eq('id', state.user.id).maybeSingle(),
    ]);
    if (tri.error) throw tri.error;
    state.triagem = tri.data?.[0] ?? null;
    state.nome = perfil.data?.nome || state.user.user_metadata?.nome || '';
    if (!state.triagem) return renderTriagem(true);
    if (!state.triagem.apto) return renderBloqueado();
    await carregarDados();
    go('inicio');
  } catch (err) { renderErro(err); }
}

async function carregarDados() {
  const [s, e] = await Promise.all([
    sb.from('sessoes').select('*').order('data', { ascending: true }),
    sb.from('exercicios').select('*').order('regiao').order('ordem'),
  ]);
  if (s.error) throw s.error;
  if (e.error) throw e.error;
  state.sessoes = s.data; state.exercicios = e.data;
}

function mostrarTabs(on) {
  $tabs.classList.toggle('hidden', !on);
  document.body.classList.toggle('has-tabs', on);
}

function go(view, arg) {
  const telas = { inicio: renderInicio, treino: renderTreino, exercicios: renderBiblioteca, dicas: renderDicas, progresso: renderProgresso, mais: renderMais };
  if (telas[view]) { state.view = view; state.voltar = view; }
  mostrarTabs(true);
  [...$tabs.children].forEach((b) => b.classList.toggle('active', b.dataset.view === state.voltar || (state.voltar === 'treino' && b.dataset.view === 'inicio')));
  (telas[view] || view)(arg);
  window.scrollTo(0, 0);
}

function subhead(titulo, destino = state.voltar) {
  setTimeout(() => { const b = document.getElementById('back'); if (b) b.onclick = () => go(destino); });
  return `<div class="subhead"><button class="back" id="back" aria-label="Voltar">${ICON.back}</button><h1>${titulo}</h1></div>`;
}

function renderErro(err) {
  $app.innerHTML = `<div class="card danger"><p>Algo deu errado: ${esc(err.message)}</p>
    <button class="btn ghost" id="retry">Tentar de novo</button></div>`;
  document.getElementById('retry').onclick = boot;
}

// ---------------- Splash / login ----------------
function renderAuth(modo = 'inicio') {
  mostrarTabs(false);
  if (modo === 'inicio') {
    $app.innerHTML = `
      <section class="splash">
        ${LOGO}
        <div class="wordmark">Movimento<br>Escola</div>
        <p class="tagline">Mais movimento,<br>menos dor.<br>Professores bem, alunos<br>mais felizes.</p>
        <button class="btn" id="entrar" style="margin-top:28px">Entrar</button>
        <button class="btn ghost" id="criar">Criar conta</button>
        <p class="foot">Cuidar de quem ensina<br>também é educação.</p>
      </section>`;
    document.getElementById('entrar').onclick = () => renderAuth('entrar');
    document.getElementById('criar').onclick = () => renderAuth('cadastrar');
    return;
  }
  const cadastro = modo === 'cadastrar';
  $app.innerHTML = `
    <div class="subhead"><button class="back" id="back" aria-label="Voltar">${ICON.back}</button><h1>${cadastro ? 'Criar conta' : 'Entrar'}</h1></div>
    <form class="card" id="f">
      ${cadastro ? '<label for="nome">Nome</label><input id="nome" type="text" autocomplete="name" required>' : ''}
      <label for="email">E-mail</label>
      <input id="email" type="email" autocomplete="email" required>
      <label for="senha">Senha</label>
      <input id="senha" type="password" minlength="6" autocomplete="${cadastro ? 'new-password' : 'current-password'}" required>
      <button class="btn" type="submit">${cadastro ? 'Criar conta' : 'Entrar'}</button>
      <p class="msg" id="msg"></p>
    </form>
    <p class="center">
      <button class="link" id="trocar">${cadastro ? 'Já tenho conta' : 'Criar uma conta'}</button>
      ${cadastro ? '' : '<br><button class="link" id="esqueci" style="margin-top:8px">Esqueci a senha</button>'}
    </p>`;

  const msg = document.getElementById('msg');
  document.getElementById('back').onclick = () => renderAuth('inicio');
  document.getElementById('trocar').onclick = () => renderAuth(cadastro ? 'entrar' : 'cadastrar');
  document.getElementById('esqueci')?.addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    if (!email) { msg.className = 'msg err'; msg.textContent = 'Digite seu e-mail acima primeiro.'; return; }
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin });
    msg.className = error ? 'msg err' : 'msg';
    msg.textContent = error ? traduzErro(error.message) : 'Enviamos um link para criar uma nova senha.';
  });

  document.getElementById('f').onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true; msg.textContent = '';
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('senha').value;
    let res;
    if (cadastro) {
      const nome = document.getElementById('nome').value.trim();
      res = await sb.auth.signUp({ email, password, options: { data: { nome } } });
      if (!res.error && !res.data.session) {
        msg.className = 'msg err';
        msg.textContent = 'Conta criada, mas o login automático está desativado. Desligue "Confirm email" no Supabase.';
        btn.disabled = false; return;
      }
    } else {
      res = await sb.auth.signInWithPassword({ email, password });
    }
    if (res.error) { msg.className = 'msg err'; msg.textContent = traduzErro(res.error.message); btn.disabled = false; }
  };
}

function renderNovaSenha() {
  mostrarTabs(false);
  $app.innerHTML = `
    <h1>Criar nova senha</h1>
    <form class="card" id="f">
      <label for="senha">Nova senha</label>
      <input id="senha" type="password" minlength="6" autocomplete="new-password" required>
      <button class="btn" type="submit">Salvar e entrar</button>
      <p class="msg err" id="msg"></p>
    </form>`;
  document.getElementById('f').onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button'); btn.disabled = true;
    const { error } = await sb.auth.updateUser({ password: document.getElementById('senha').value });
    if (error) { document.getElementById('msg').textContent = traduzErro(error.message); btn.disabled = false; return; }
    history.replaceState(null, '', location.pathname);
    boot();
  };
}

function traduzErro(m) {
  if (/Invalid login/i.test(m)) return 'E-mail ou senha incorretos.';
  if (/already registered/i.test(m)) return 'Este e-mail já tem conta. Entre ou redefina a senha.';
  if (/at least 6/i.test(m)) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (/rate limit/i.test(m)) return 'Muitas tentativas. Espere alguns minutos e tente de novo.';
  return m;
}

// ---------------- Triagem ----------------
function renderTriagem(primeira = false) {
  mostrarTabs(false);
  const sel = new Set();
  let intensidade = null;

  $app.innerHTML = `
    ${primeira
      ? `<h1>${primeiroNome() ? `Olá, ${esc(primeiroNome())}!` : 'Olá!'}</h1><p class="muted">Antes de começar, 3 perguntas rápidas para montar o seu treino.</p>`
      : `${subhead('Nova triagem', 'mais')}<p class="muted">Suas respostas atualizam o seu treino do dia.</p>`}

    <div class="card">
      <h2 style="margin-top:0">1. Onde você sente dor ou desconforto?</h2>
      <p class="small" style="margin-top:-4px">Pode escolher mais de uma região.</p>
      <div class="chips" id="regioes">
        ${Object.entries(REGIOES).map(([k, v]) => `<button type="button" class="chip" data-r="${k}" aria-pressed="false">${v}</button>`).join('')}
      </div>
    </div>

    <div class="card">
      <h2 style="margin-top:0">2. Qual a intensidade da dor hoje?</h2>
      <div class="scale" id="escala">${escalaBotoes()}</div>
      <div class="scale-legend"><span>Sem dor</span><span>Pior dor possível</span></div>
    </div>

    <div class="card">
      <h2 style="margin-top:0">3. Você tem algum destes sinais?</h2>
      <p class="small" style="margin-top:-4px">Marque todos que se aplicam.</p>
      ${RED_FLAGS.map(([k, t]) => `<label class="check"><input type="checkbox" value="${k}"> ${t}</label>`).join('')}
    </div>

    <button class="btn" id="enviar" disabled>Ver meu treino</button>
    <p class="msg err" id="msg"></p>`;

  const $enviar = document.getElementById('enviar');
  const validar = () => { $enviar.disabled = !(sel.size && intensidade !== null); };

  document.getElementById('regioes').onclick = (e) => {
    const b = e.target.closest('.chip'); if (!b) return;
    const r = b.dataset.r;
    sel.has(r) ? sel.delete(r) : sel.add(r);
    b.setAttribute('aria-pressed', sel.has(r));
    validar();
  };
  ligarEscala(document.getElementById('escala'), (n) => { intensidade = n; validar(); });

  $enviar.onclick = async () => {
    $enviar.disabled = true;
    const flags = [...$app.querySelectorAll('.check input:checked')].map((i) => i.value);
    const { data, error } = await sb.from('triagens').insert({
      regioes: [...sel], intensidade, red_flags: flags, apto: flags.length === 0,
    }).select().single();
    if (error) { document.getElementById('msg').textContent = error.message; $enviar.disabled = false; return; }
    state.triagem = data;
    if (!data.apto) return renderBloqueado();
    try { await carregarDados(); } catch (err) { return renderErro(err); }
    go('inicio');
  };
}

const escalaBotoes = () => Array.from({ length: 11 }, (_, i) => `<button type="button" data-n="${i}" aria-pressed="false">${i}</button>`).join('');
function ligarEscala(el, onPick) {
  el.onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    [...el.children].forEach((x) => x.setAttribute('aria-pressed', x === b));
    onPick(Number(b.dataset.n));
  };
}

function renderBloqueado() {
  mostrarTabs(false);
  $app.innerHTML = `
    <div class="card danger" style="margin-top:20px">
      <h1>Procure uma avaliação antes de começar</h1>
      <p>Você marcou sinais que precisam ser avaliados por um profissional de saúde antes de iniciar exercícios por conta própria.</p>
      <p>Procure um fisioterapeuta ou médico. Se os sintomas forem intensos ou surgiram de repente — principalmente perda de controle da urina/fezes, fraqueza piorando ou dor no peito — vá a um pronto-atendimento.</p>
    </div>
    <button class="btn ghost" id="refazer">Refazer triagem</button>
    <p class="center"><button class="link" id="sair">Sair</button></p>`;
  document.getElementById('refazer').onclick = () => renderTriagem(true);
  document.getElementById('sair').onclick = () => sb.auth.signOut();
}

// ---------------- Lógica de treino ----------------
// Rodízio: o dia avança a cada treino concluído (não pelo calendário)
const inicioCiclo = () => ymd(new Date(state.triagem.created_at));
function datasTreino() {
  const desde = inicioCiclo();
  return [...new Set(state.sessoes.filter((s) => s.data >= desde).map((s) => s.data))].sort();
}
function diaAtual() {
  const datas = datasTreino();
  const h = hoje();
  if (datas.includes(h)) {
    const s = state.sessoes.find((x) => x.data === h && x.dia);
    return s ? s.dia : (datas.indexOf(h) % DIAS) + 1;
  }
  return (datas.length % DIAS) + 1;
}

function treinoDoDia() {
  const dia = diaAtual();
  return state.triagem.regioes.map((regiao) => ({
    regiao, dia,
    lista: state.exercicios.filter((e) => e.regiao === regiao && e.ativo && (e.dias || []).includes(dia)),
  }));
}

const dose = (e) => `${e.series} ${e.series === 1 ? 'série' : 'séries'} × ${esc(e.repeticoes)}`;
const diasTxt = (e) => (e.dias || []).length ? `Dias ${e.dias.join(', ').replace(/, (\d+)$/, ' e $1')}` : '';
const minutos = (lista) => Math.max(3, Math.round(lista.reduce((a, e) => a + (e.series || 1) * 1.2, 0)));
const feitoHoje = () => state.triagem.regioes.every((r) => state.sessoes.some((s) => s.regiao === r && s.data === hoje()));

function sequencia() {
  const dias = new Set(state.sessoes.map((s) => s.data));
  const d = new Date();
  if (!dias.has(ymd(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (dias.has(ymd(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

function semanaAtual() {
  const d = new Date(); const dow = (d.getDay() + 6) % 7; // seg = 0
  d.setDate(d.getDate() - dow);
  return [...Array(7)].map((_, i) => { const x = new Date(d); x.setDate(d.getDate() + i); return ymd(x); });
}

// Vídeos (bucket privado → link temporário)
async function urlVideo(path) {
  if (!path) return null;
  if (state.videoUrls[path]) return state.videoUrls[path];
  const { data } = await sb.storage.from('videos').createSignedUrl(path, 3600);
  if (data?.signedUrl) state.videoUrls[path] = data.signedUrl;
  return data?.signedUrl ?? null;
}
async function preencherVideos() {
  for (const v of $app.querySelectorAll('video[data-path]')) {
    const url = await urlVideo(v.dataset.path);
    if (url) v.src = v.dataset.thumb ? `${url}#t=0.5` : url;
  }
}
const thumb = (e) => e.video_path
  ? `<div class="thumb"><video muted playsinline preload="metadata" data-thumb="1" data-path="${esc(e.video_path)}"></video></div>`
  : `<div class="thumb">${ICON.person}</div>`;

// ---------------- Início ----------------
function renderInicio() {
  const blocos = treinoDoDia();
  const total = blocos.reduce((a, b) => a + b.lista.length, 0);
  const todos = blocos.flatMap((b) => b.lista);
  const seq = sequencia();
  const feito = feitoHoje();
  const regioesTxt = state.triagem.regioes.map((r) => REGIOES[r]).join(', ');
  const frase = FRASES[new Date().getDate() % FRASES.length];

  $app.innerHTML = `
    <h1>Olá${primeiroNome() ? `, ${esc(primeiroNome())}` : ''}! 👋</h1>
    <p class="muted" style="margin-top:0">Que bom te ver por aqui!</p>

    <button class="card sun-strong row" id="abrir-treino" style="width:100%;text-align:left">
      <span class="ico">${ICON.cal}</span>
      <span class="grow">
        <span class="strong" style="display:block">Seu treino do dia</span>
        <span class="small">${feito ? '<span class="done-badge">✓ Concluído hoje</span>' : `Dia ${diaAtual()} de ${DIAS} · ${total} exercícios · ≈ ${minutos(todos)} min`}</span>
      </span>
      ${ICON.chev}
    </button>

    <div class="card sun row">
      <span class="ico" style="background:transparent">${ICON.flame}</span>
      <span class="grow">
        <span class="strong" style="font-size:18px">${seq} ${seq === 1 ? 'dia' : 'dias'}</span><br>
        <span class="small">na constância</span>
      </span>
      ${seq >= 3 ? '<span class="pill">Parabéns!</span>' : ''}
    </div>

    ${state.triagem.intensidade >= 8 ? `<div class="card alert"><strong>Sua dor está alta (${state.triagem.intensidade}/10).</strong>
      <p class="small" style="color:inherit">Faça os exercícios com amplitude menor e sem forçar. Se não melhorar em alguns dias, procure um fisioterapeuta.</p></div>` : ''}

    <h2>Hoje você também pode:</h2>
    <ul class="todo">
      ${['Fazer uma pequena caminhada entre as turmas', 'Evitar ficar muito tempo na mesma posição', 'Lembrar de alongar o pescoço e os ombros']
        .map((t) => `<li><span class="tick">${ICON.check}</span>${t}</li>`).join('')}
    </ul>

    <div class="card sun quote">“${frase}”<div style="font-size:16px;margin-top:4px">♡</div></div>`;

  document.getElementById('abrir-treino').onclick = () => go('treino');
}

// ---------------- Treino do dia ----------------
function renderTreino() {
  const blocos = treinoDoDia();
  const todos = blocos.flatMap((b) => b.lista);
  const chave = `checks-${hoje()}`;
  const checks = new Set(store.get(chave, []));
  const feito = feitoHoje();

  $app.innerHTML = `
    ${subhead(`Treino do dia · Dia ${diaAtual()} de ${DIAS}`, 'inicio')}
    <p class="small row" style="gap:6px">⏱ ${minutos(todos)} min · ${blocos.map((b) => REGIOES[b.regiao]).join(' · ')}</p>
    ${blocos.map((b) => `
      ${blocos.length > 1 ? `<div class="region-label">${REGIOES[b.regiao]}</div>` : ''}
      <div class="card" style="padding:4px 6px;margin-top:8px">
        ${b.lista.length ? b.lista.map((e, i) => `
          <div class="ex-item">
            <button class="row grow" data-ex="${e.id}" style="border:0;background:none;padding:0;text-align:left">
              ${thumb(e)}
              <span class="grow">
                <span class="ex-name" style="display:block">${i + 1}. ${esc(e.nome)}</span>
                <span class="small">${dose(e)}</span>
              </span>
            </button>
            <button class="circle" data-check="${e.id}" aria-pressed="${checks.has(e.id) || feito}" aria-label="Marcar ${esc(e.nome)}">${ICON.check}</button>
          </div>`).join('') : '<p class="small" style="padding:10px">Nenhum exercício cadastrado ainda para esta região.</p>'}
      </div>`).join('')}
    ${feito
      ? '<p class="center" style="margin-top:18px"><span class="done-badge">✓ Treino de hoje concluído</span></p>'
      : todos.length ? '<button class="btn soft" id="concluir">Marcar como realizado</button>' : ''}`;

  $app.querySelectorAll('[data-check]').forEach((b) => {
    b.onclick = () => {
      if (feito) return;
      const id = Number(b.dataset.check);
      checks.has(id) ? checks.delete(id) : checks.add(id);
      b.setAttribute('aria-pressed', checks.has(id));
      store.set(chave, [...checks]);
    };
  });
  $app.querySelectorAll('[data-ex]').forEach((b) => { b.onclick = () => go(renderDetalhe, { id: Number(b.dataset.ex), de: 'treino' }); });
  document.getElementById('concluir')?.addEventListener('click', () => go(renderConcluir, blocos));
  preencherVideos();
}

function renderConcluir(blocos) {
  $app.innerHTML = `
    ${subhead('Treino concluído 👏', 'treino')}
    <div class="card">
      <h2 style="margin-top:0">Como está a dor agora?</h2>
      <div class="scale" id="escala">${escalaBotoes()}</div>
      <div class="scale-legend"><span>Sem dor</span><span>Pior dor possível</span></div>
      <button class="btn" id="salvar" disabled>Salvar</button>
      <p class="msg err" id="msg"></p>
    </div>`;
  let dor = null;
  const $salvar = document.getElementById('salvar');
  ligarEscala(document.getElementById('escala'), (n) => { dor = n; $salvar.disabled = false; });

  $salvar.onclick = async () => {
    $salvar.disabled = true;
    const linhas = blocos.filter((b) => b.lista.length).map((b) => ({ data: hoje(), regiao: b.regiao, dia: b.dia, dor_pos: dor }));
    const { error } = await sb.from('sessoes').upsert(linhas, { onConflict: 'user_id,data,regiao' });
    if (error) { document.getElementById('msg').textContent = error.message; $salvar.disabled = false; return; }
    try { await carregarDados(); } catch {}
    if (dor >= DOR_ALERTA) {
      $app.innerHTML = `<div class="card alert" style="margin-top:20px">
        <h1>Sua dor ficou alta depois do treino</h1>
        <p>Amanhã, faça a série com menos repetições e amplitude menor. Se a dor continuar alta por mais de 2–3 dias, procure um fisioterapeuta.</p>
        <button class="btn" id="ok">Entendi</button></div>`;
      document.getElementById('ok').onclick = () => go('inicio');
    } else go('inicio');
  };
}

// ---------------- Detalhe do exercício ----------------
async function renderDetalhe({ id, de }) {
  const e = state.exercicios.find((x) => x.id === id);
  if (!e) return go(de);
  const passos = (e.descricao || '').split(/(?<=\.)\s+/).filter(Boolean);
  $app.innerHTML = `
    ${subhead(esc(e.nome), de)}
    <p style="margin:0 0 6px"><span class="tag">${REGIOES[e.regiao]}${diasTxt(e) ? ' · ' + diasTxt(e) : ''}</span></p>
    ${e.video_path
      ? `<video class="hero-video" controls playsinline preload="metadata" data-path="${esc(e.video_path)}"></video>`
      : `<div class="hero-empty"><div>${ICON.play.replace('<svg', '<svg style="width:40px;height:40px;margin:0 auto 6px;fill:none;stroke:currentColor;stroke-width:1.5"')}Vídeo em breve</div></div>`}
    <div class="card">
      <p class="strong" style="margin-top:0">${dose(e)}</p>
      ${passos.length ? `<p class="strong" style="margin-bottom:0">Como fazer:</p><ol class="steps">${passos.map((p) => `<li>${esc(p)}</li>`).join('')}</ol>` : ''}
      <p class="small">Faça devagar e sem forçar. Um leve desconforto é normal; dor forte, pare.</p>
    </div>`;
  preencherVideos();
}

// ---------------- Biblioteca ----------------
function renderBiblioteca(filtro = 'todos') {
  const lista = state.exercicios.filter((e) => e.ativo && (filtro === 'todos' || e.regiao === filtro));
  $app.innerHTML = `
    <h1>Biblioteca de exercícios</h1>
    <div class="filters" id="filtros">
      ${[['todos', 'Todos'], ...Object.entries(REGIOES)].map(([k, v]) => `<button data-f="${k}" aria-pressed="${k === filtro}">${v}</button>`).join('')}
    </div>
    ${lista.map((e) => `
      <button class="card lib-card" data-ex="${e.id}">
        ${thumb(e)}
        <span class="grow">
          <span class="ex-name" style="display:block">${esc(e.nome)}</span>
          <span class="small">${REGIOES[e.regiao]} · ${dose(e)}${diasTxt(e) ? '<br>' + diasTxt(e) : ''}</span>
        </span>
        <span style="padding-right:12px">${ICON.chev}</span>
      </button>`).join('') || '<p class="muted">Nenhum exercício nesta região ainda.</p>'}`;

  document.getElementById('filtros').onclick = (ev) => {
    const b = ev.target.closest('button'); if (b) renderBiblioteca(b.dataset.f);
  };
  $app.querySelectorAll('[data-ex]').forEach((b) => { b.onclick = () => go(renderDetalhe, { id: Number(b.dataset.ex), de: 'exercicios' }); });
  preencherVideos();
}

// ---------------- Dicas ----------------
function renderDicas() {
  $app.innerHTML = `
    <h1>Dicas para a escola</h1>
    <p class="muted" style="margin-top:0">Pequenos hábitos, grandes diferenças!</p>
    ${DICAS.map(([ic, t, d]) => `
      <div class="card row" style="align-items:flex-start">
        <span class="ico" style="width:52px;height:52px;background:var(--sun-soft)">${ICON[ic].replace('<svg', '<svg style="width:28px;height:28px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"')}</span>
        <span class="grow"><span class="strong" style="display:block">${t}</span><span class="small">${d}</span></span>
      </div>`).join('')}`;
}

// ---------------- Progresso ----------------
function renderProgresso() {
  const seq = sequencia();
  const semana = semanaAtual();
  const dias = new Set(state.sessoes.map((s) => s.data));
  const feitosSemana = semana.filter((d) => dias.has(d)).length;
  const r = 62, c = 2 * Math.PI * r, pct = Math.min(1, seq / 7);
  const nomesDias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  $app.innerHTML = `
    <h1>Meu progresso</h1>
    <div class="ring-wrap">
      <div class="ring">
        <svg viewBox="0 0 150 150">
          <circle cx="75" cy="75" r="${r}" fill="none" stroke="var(--sun)" stroke-width="12"/>
          <circle cx="75" cy="75" r="${r}" fill="none" stroke="var(--sage)" stroke-width="12" stroke-linecap="round"
            stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}"/>
        </svg>
        <div class="lbl"><span style="width:24px;height:24px;margin:0 auto;display:block">${ICON.flame}</span><div class="num">${seq}</div><div class="small">dias seguidos</div></div>
      </div>
    </div>
    <div class="stats">
      <div class="card stat"><div class="num">${feitosSemana}</div><div class="small">treinos feitos<br>esta semana</div></div>
      <div class="card stat"><div class="num">${state.sessoes.length ? new Set(state.sessoes.map((s) => s.data)).size : 0}</div><div class="small">dias de treino<br>no total</div></div>
    </div>

    <h2>Esta semana</h2>
    <div class="card">
      <div class="bars">
        ${semana.map((d, i) => `<div><span class="${dias.has(d) ? 'on' : ''}" style="height:${dias.has(d) ? 100 : 28}%"></span><small>${nomesDias[i]}</small></div>`).join('')}
      </div>
    </div>

    <h2>Rodízio de ${DIAS} dias</h2>
    <div class="card">
      <div class="cycle">
        ${[...Array(DIAS)].map((_, k) => {
          const d = k + 1, atual = diaAtual(), feito = d < atual || (d === atual && feitoHoje());
          return `<div class="${feito ? 'on' : ''} ${d === atual ? 'now' : ''}"><span>${feito ? '✓' : d}</span><small>Dia ${d}</small></div>`;
        }).join('')}
      </div>
      <p class="small" style="margin-bottom:0">${feitoHoje() ? `Dia ${diaAtual()} concluído hoje. Amanhã: Dia ${diaAtual() % DIAS + 1}.` : `Próximo treino: Dia ${diaAtual()}.`} Depois do Dia ${DIAS}, volta ao Dia 1.</p>
    </div>

    <h2>Dor depois do treino</h2>
    ${state.triagem.regioes.map((reg) => {
      const ult = state.sessoes.filter((s) => s.regiao === reg && s.dor_pos != null).slice(-5);
      const media = ult.length ? (ult.reduce((a, s) => a + s.dor_pos, 0) / ult.length).toFixed(1) : '—';
      const pct = ult.length ? (10 - media) * 10 : 0;
      return `<div class="card">
        <div class="row"><span class="strong grow">${REGIOES[reg]}</span><span class="tag">${media}/10</span></div>
        <p class="small" style="margin-bottom:0">Média dos últimos ${ult.length || 0} treinos</p>
      </div>`;
    }).join('')}

    ${feitosSemana >= 3 ? `<div class="card sun row"><span style="font-size:18px">♡</span><span class="small" style="color:var(--ink)"><b>Você está indo muito bem!</b><br>A constância faz toda a diferença.</span></div>` : ''}`;
}

// ---------------- Mais / perfil ----------------
function renderMais() {
  const inicial = (state.nome || state.user.email || '?').trim()[0].toUpperCase();
  $app.innerHTML = `
    <h1>Meu perfil</h1>
    <div class="card row">
      <div class="avatar">${esc(inicial)}</div>
      <div class="grow">
        <div class="strong" style="font-size:17px">${esc(state.nome || 'Sem nome')}</div>
        <div class="small" style="overflow-wrap:anywhere">${esc(state.user.email)}</div>
      </div>
    </div>
    <div class="card menu">
      <button id="m-triagem"><span class="ico">${ICON.clip}</span><span class="grow">Refazer triagem</span>${ICON.chev}</button>
      <button id="m-ajuda"><span class="ico">${ICON.help}</span><span class="grow">Ajuda</span>${ICON.chev}</button>
      <button id="m-sair"><span class="ico">${ICON.out}</span><span class="grow">Sair</span>${ICON.chev}</button>
    </div>
    <div class="card sun quote" style="font-size:17px">Você cuida de tantas pessoas.<br>Agora é a sua vez. ♡</div>`;

  document.getElementById('m-triagem').onclick = () => renderTriagem(false);
  document.getElementById('m-sair').onclick = () => sb.auth.signOut();
  document.getElementById('m-ajuda').onclick = () => go(() => {
    $app.innerHTML = `
      ${subhead('Ajuda', 'mais')}
      <div class="card">
        <p><b>Como funciona:</b> a triagem define as regiões do seu treino. Faça a série uma vez por dia e marque como realizado.</p>
        <p><b>Rodízio:</b> são ${DIAS} treinos diferentes (Dia 1 a Dia ${DIAS}), com 3 exercícios por região. O dia avança a cada treino concluído; se você faltar, continua de onde parou.</p>
        <p><b>Mudou a dor?</b> Refaça a triagem em Mais → Refazer triagem.</p>
        <p class="small">Este app não substitui uma avaliação profissional. Se a dor piorar ou surgirem sintomas novos, procure um fisioterapeuta ou médico.</p>
      </div>`;
  });
}

// ---------------- PWA ----------------
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
