import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY, PROGRESSAO } from './config.js';

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const $app = document.getElementById('app');
const $tabs = document.getElementById('tabs');
const $sair = document.getElementById('btn-sair');

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

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hoje = () => new Date().toLocaleDateString('sv-SE'); // YYYY-MM-DD local

let state = { user: null, triagem: null, view: 'hoje' };

// ---------------- Roteamento ----------------
$tabs.addEventListener('click', (e) => {
  const v = e.target.closest('button')?.dataset.view;
  if (v) go(v);
});
$sair.addEventListener('click', async () => { await sb.auth.signOut(); });

sb.auth.onAuthStateChange((evt, session) => {
  if (!['INITIAL_SESSION', 'SIGNED_IN', 'SIGNED_OUT'].includes(evt)) return;
  if (evt === 'SIGNED_IN' && state.user?.id === session?.user?.id) return; // evita re-render ao voltar à aba
  state.user = session?.user ?? null;
  setTimeout(boot, 0); // não chamar o Supabase dentro do callback (evita deadlock do supabase-js)
});

async function boot() {
  if (!state.user) {
    $tabs.classList.add('hidden'); $sair.classList.add('hidden');
    return renderAuth();
  }
  $sair.classList.remove('hidden');
  const { data, error } = await sb.from('triagens').select('*')
    .order('created_at', { ascending: false }).limit(1);
  if (error) return renderErro(error);
  state.triagem = data?.[0] ?? null;
  if (!state.triagem) return go('triagem');
  go(state.triagem.apto ? 'hoje' : 'bloqueado');
}

function go(view) {
  state.view = view;
  const temTriagem = !!state.triagem;
  $tabs.classList.toggle('hidden', !temTriagem || view === 'bloqueado');
  [...$tabs.children].forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  ({ hoje: renderHoje, progresso: renderProgresso, triagem: renderTriagem, bloqueado: renderBloqueado }[view])();
  window.scrollTo(0, 0);
}

function renderErro(err) {
  $app.innerHTML = `<div class="card danger"><p>Algo deu errado: ${esc(err.message)}</p>
    <button class="btn secondary" id="retry">Tentar de novo</button></div>`;
  document.getElementById('retry').onclick = boot;
}

// ---------------- Login / cadastro ----------------
function renderAuth(modo = 'entrar') {
  const cadastro = modo === 'cadastrar';
  $app.innerHTML = `
    <h1>${cadastro ? 'Criar conta' : 'Entrar'}</h1>
    <p class="muted">Exercícios diários guiados para a sua dor.</p>
    <form class="card" id="f">
      ${cadastro ? `<label for="nome">Nome</label><input id="nome" type="text" autocomplete="name" required>` : ''}
      <label for="email">E-mail</label>
      <input id="email" type="email" autocomplete="email" required>
      <label for="senha">Senha</label>
      <input id="senha" type="password" minlength="6" autocomplete="${cadastro ? 'new-password' : 'current-password'}" required>
      <button class="btn" type="submit">${cadastro ? 'Criar conta' : 'Entrar'}</button>
      <p class="msg" id="msg"></p>
    </form>
    <p class="center">
      <button class="link" id="trocar">${cadastro ? 'Já tenho conta' : 'Criar uma conta'}</button>
      ${cadastro ? '' : ' · <button class="link" id="esqueci">Esqueci a senha</button>'}
    </p>`;

  const msg = document.getElementById('msg');
  document.getElementById('trocar').onclick = () => renderAuth(cadastro ? 'entrar' : 'cadastrar');
  document.getElementById('esqueci')?.addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    if (!email) { msg.className = 'msg err'; msg.textContent = 'Digite seu e-mail acima primeiro.'; return; }
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin });
    msg.className = error ? 'msg err' : 'msg';
    msg.textContent = error ? error.message : 'Enviamos um link de redefinição para o seu e-mail.';
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
      res = await sb.auth.signUp({ email, password, options: { data: { nome }, emailRedirectTo: location.origin } });
      if (!res.error && !res.data.session) {
        msg.className = 'msg';
        msg.textContent = 'Conta criada! Confirme pelo link que enviamos ao seu e-mail e depois entre.';
        btn.disabled = false; return;
      }
    } else {
      res = await sb.auth.signInWithPassword({ email, password });
    }
    if (res.error) {
      msg.className = 'msg err';
      msg.textContent = traduzErro(res.error.message);
      btn.disabled = false;
    }
  };
}

function traduzErro(m) {
  if (/Invalid login/i.test(m)) return 'E-mail ou senha incorretos.';
  if (/already registered/i.test(m)) return 'Este e-mail já tem conta. Entre ou redefina a senha.';
  if (/Email not confirmed/i.test(m)) return 'Confirme seu e-mail pelo link que enviamos.';
  if (/at least 6/i.test(m)) return 'A senha precisa ter pelo menos 6 caracteres.';
  return m;
}

// ---------------- Triagem ----------------
function renderTriagem() {
  const sel = new Set();
  let intensidade = null;

  $app.innerHTML = `
    <h1>Triagem</h1>
    <p class="muted">Leva 1 minuto. Suas respostas definem a sua série diária.</p>

    <div class="card">
      <h2 style="margin-top:0">1. Onde você sente dor ou desconforto?</h2>
      <p class="muted" style="margin-top:0">Pode escolher mais de uma região.</p>
      <div class="chips" id="regioes">
        ${Object.entries(REGIOES).map(([k, v]) => `<button type="button" class="chip" data-r="${k}" aria-pressed="false">${v}</button>`).join('')}
      </div>
    </div>

    <div class="card">
      <h2 style="margin-top:0">2. Qual a intensidade da dor hoje?</h2>
      <div class="scale" id="escala">
        ${Array.from({ length: 11 }, (_, i) => `<button type="button" data-n="${i}" aria-pressed="false">${i}</button>`).join('')}
      </div>
      <div class="scale-legend"><span>Sem dor</span><span>Pior dor possível</span></div>
    </div>

    <div class="card">
      <h2 style="margin-top:0">3. Você tem algum destes sinais?</h2>
      <p class="muted" style="margin-top:0">Marque todos que se aplicam.</p>
      ${RED_FLAGS.map(([k, t]) => `<label class="check"><input type="checkbox" value="${k}"> ${t}</label>`).join('')}
    </div>

    <button class="btn" id="enviar" disabled>Ver minha série</button>
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
  document.getElementById('escala').onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    intensidade = Number(b.dataset.n);
    [...e.currentTarget.children].forEach((x) => x.setAttribute('aria-pressed', x === b));
    validar();
  };

  $enviar.onclick = async () => {
    $enviar.disabled = true;
    const flags = [...$app.querySelectorAll('.check input:checked')].map((i) => i.value);
    const { data, error } = await sb.from('triagens').insert({
      regioes: [...sel], intensidade, red_flags: flags, apto: flags.length === 0,
    }).select().single();
    if (error) { document.getElementById('msg').textContent = error.message; $enviar.disabled = false; return; }
    state.triagem = data;
    go(data.apto ? 'hoje' : 'bloqueado');
  };
}

function renderBloqueado() {
  $app.innerHTML = `
    <div class="card danger">
      <h1>Procure uma avaliação antes de começar</h1>
      <p>Você marcou sinais que precisam ser avaliados por um profissional de saúde antes de iniciar exercícios por conta própria.</p>
      <p>Procure um fisioterapeuta ou médico. Se os sintomas forem intensos ou surgiram de repente — principalmente perda de controle da urina/fezes, fraqueza piorando ou dor no peito — vá a um pronto-atendimento.</p>
    </div>
    <button class="btn secondary" id="refazer">Refazer triagem</button>`;
  document.getElementById('refazer').onclick = () => { $tabs.classList.add('hidden'); renderTriagem(); };
}

// ---------------- Progressão ----------------
async function carregarSessoes() {
  const { data, error } = await sb.from('sessoes').select('*').order('data', { ascending: true });
  if (error) throw error;
  return data;
}

function faseAtual(sessoes, regiao) {
  const desde = state.triagem.created_at.slice(0, 10);
  let fase = 1;
  for (; fase < 3; fase++) {
    const daFase = sessoes.filter((s) => s.regiao === regiao && s.fase === fase && s.data >= desde);
    if (daFase.length < PROGRESSAO.sessoesParaAvancar) break;
    const ult = daFase.slice(-PROGRESSAO.ultimasSessoes).filter((s) => s.dor_pos != null);
    const media = ult.reduce((a, s) => a + s.dor_pos, 0) / (ult.length || 1);
    if (media > PROGRESSAO.dorMaximaMedia) break;
  }
  return fase;
}

// ---------------- Hoje ----------------
async function renderHoje() {
  $app.innerHTML = '<p class="muted center">Carregando sua série…</p>';
  let sessoes, exercicios;
  try {
    sessoes = await carregarSessoes();
    const { data, error } = await sb.from('exercicios').select('*')
      .in('regiao', state.triagem.regioes).order('ordem');
    if (error) throw error;
    exercicios = data;
  } catch (err) { return renderErro(err); }

  const d = hoje();
  const intensa = state.triagem.intensidade >= 8;
  const blocos = [];

  for (const regiao of state.triagem.regioes) {
    const fase = faseAtual(sessoes, regiao);
    // Usa a fase mais alta disponível até a fase atual (caso ainda não haja vídeos da fase 2/3)
    const disponiveis = exercicios.filter((e) => e.regiao === regiao && e.fase <= fase);
    const faseUsada = Math.max(0, ...disponiveis.map((e) => e.fase));
    const lista = disponiveis.filter((e) => e.fase === faseUsada);
    const feito = sessoes.find((s) => s.regiao === regiao && s.data === d);
    blocos.push({ regiao, fase: faseUsada || fase, lista, feito });
  }

  $app.innerHTML = `
    <h1>Série de hoje</h1>
    <p class="muted">${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
    ${intensa ? `<div class="card alert"><strong>Sua dor está alta (${state.triagem.intensidade}/10).</strong>
      <p style="margin-bottom:0">Faça os exercícios com amplitude menor e sem forçar. Se a dor não melhorar em alguns dias, procure um fisioterapeuta.</p></div>` : ''}
    ${blocos.map(blocoHTML).join('')}`;

  // Vídeos: URLs assinadas (bucket privado)
  for (const v of $app.querySelectorAll('video[data-path]')) {
    const { data } = await sb.storage.from('videos').createSignedUrl(v.dataset.path, 3600);
    if (data?.signedUrl) v.src = data.signedUrl;
  }

  $app.querySelectorAll('[data-concluir]').forEach((btn) => {
    btn.onclick = () => concluir(btn.dataset.concluir, Number(btn.dataset.fase));
  });
}

function blocoHTML({ regiao, fase, lista, feito }) {
  const exs = lista.length ? lista.map((e) => `
    <div class="ex">
      <h3>${esc(e.nome)}</h3>
      <div class="dose">${e.series} séries × ${esc(e.repeticoes)}</div>
      ${e.descricao ? `<p class="muted" style="margin:6px 0 0">${esc(e.descricao)}</p>` : ''}
      ${e.video_path
        ? `<video controls playsinline preload="metadata" data-path="${esc(e.video_path)}"></video>`
        : '<div class="novideo">Vídeo em breve</div>'}
    </div>`).join('') : '<p class="muted">Nenhum exercício cadastrado ainda para esta região.</p>';

  return `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h2 style="margin:0">${REGIOES[regiao]}</h2><span class="tag">Fase ${fase}</span>
      </div>
      ${exs}
      ${feito
        ? `<p class="done">✓ Concluído hoje${feito.dor_pos != null ? ` · dor depois: ${feito.dor_pos}/10` : ''}</p>`
        : lista.length ? `<button class="btn" data-concluir="${regiao}" data-fase="${fase}">Concluí a série</button>` : ''}
    </div>`;
}

function concluir(regiao, fase) {
  $app.innerHTML = `
    <h1>${REGIOES[regiao]} concluído 👏</h1>
    <div class="card">
      <h2 style="margin-top:0">Como está a dor agora?</h2>
      <div class="scale" id="escala">
        ${Array.from({ length: 11 }, (_, i) => `<button type="button" data-n="${i}" aria-pressed="false">${i}</button>`).join('')}
      </div>
      <div class="scale-legend"><span>Sem dor</span><span>Pior dor possível</span></div>
      <button class="btn" id="salvar" disabled>Salvar</button>
      <p class="msg err" id="msg"></p>
    </div>`;
  let dor = null;
  const $salvar = document.getElementById('salvar');
  document.getElementById('escala').onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    dor = Number(b.dataset.n);
    [...e.currentTarget.children].forEach((x) => x.setAttribute('aria-pressed', x === b));
    $salvar.disabled = false;
  };
  $salvar.onclick = async () => {
    $salvar.disabled = true;
    const { error } = await sb.from('sessoes').upsert(
      { data: hoje(), regiao, fase, dor_pos: dor },
      { onConflict: 'user_id,data,regiao' },
    );
    if (error) { document.getElementById('msg').textContent = error.message; $salvar.disabled = false; return; }
    if (dor >= PROGRESSAO.dorAlerta) {
      $app.innerHTML = `<div class="card alert">
        <h1>Sua dor ficou alta depois do treino</h1>
        <p>Amanhã, faça a série com menos repetições e amplitude menor. Se a dor continuar alta por mais de 2–3 dias, procure um fisioterapeuta.</p>
        <button class="btn" id="ok">Entendi</button></div>`;
      document.getElementById('ok').onclick = () => go('hoje');
    } else go('hoje');
  };
}

// ---------------- Progresso ----------------
async function renderProgresso() {
  $app.innerHTML = '<p class="muted center">Carregando…</p>';
  let sessoes;
  try { sessoes = await carregarSessoes(); } catch (err) { return renderErro(err); }

  const dias = [...Array(28)].map((_, i) => {
    const dt = new Date(); dt.setDate(dt.getDate() - (27 - i));
    return dt.toLocaleDateString('sv-SE');
  });
  const diasFeitos = new Set(sessoes.map((s) => s.data));
  const desde = state.triagem.created_at.slice(0, 10);

  $app.innerHTML = `
    <h1>Seu progresso</h1>
    <div class="card">
      <h2 style="margin-top:0">Últimas 4 semanas</h2>
      <p class="muted" style="margin:0">${dias.filter((d) => diasFeitos.has(d)).length} de 28 dias com treino</p>
      <div class="hist">${dias.map((d) => `<span class="${diasFeitos.has(d) ? 'on' : ''}" title="${d}"></span>`).join('')}</div>
    </div>
    ${state.triagem.regioes.map((r) => {
      const fase = faseAtual(sessoes, r);
      const naFase = sessoes.filter((s) => s.regiao === r && s.fase === fase && s.data >= desde).length;
      const pct = fase === 3 ? 100 : Math.min(100, (naFase / PROGRESSAO.sessoesParaAvancar) * 100);
      const ult = sessoes.filter((s) => s.regiao === r && s.dor_pos != null).slice(-5);
      const media = ult.length ? (ult.reduce((a, s) => a + s.dor_pos, 0) / ult.length).toFixed(1) : '—';
      return `<div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <h2 style="margin:0">${REGIOES[r]}</h2><span class="tag">Fase ${fase}</span>
        </div>
        <p class="muted" style="margin:8px 0 0">${fase === 3 ? 'Fase final alcançada' : `${naFase}/${PROGRESSAO.sessoesParaAvancar} sessões para a próxima fase`} · dor média recente: ${media}</p>
        <div class="bar"><span style="width:${pct}%"></span></div>
      </div>`;
    }).join('')}
    <p class="muted" style="font-size:13px">Você avança de fase com ${PROGRESSAO.sessoesParaAvancar} sessões e dor média pós-treino até ${PROGRESSAO.dorMaximaMedia}/10.</p>`;
}

// ---------------- PWA ----------------
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
