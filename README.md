# Movimento Escola

PWA em JS puro + Supabase + Vercel (mesmo caminho do Nichioka Outcomes).

## Fluxo
1. **Cadastro/login** — e-mail e senha (Supabase Auth), com confirmação por e-mail e "esqueci a senha".
2. **Triagem** — regiões (lombar, joelho, quadril, ombro, cervical, tornozelo), intensidade 0–10 e 8 sinais de alerta.
   Qualquer sinal de alerta → tela orientando avaliação profissional, sem liberar o programa.
   Dor ≥ 8 → libera, com aviso para reduzir amplitude.
3. **Hoje** — série do dia para cada região escolhida, com vídeo, check de "concluí" e dor pós-treino.
   Dor pós ≥ 7 → orientação para reduzir a carga e procurar profissional se persistir.
4. **Progresso** — calendário de 28 dias e fase por região.
   Avança de fase (1 → 2 → 3) com 10 sessões e média de dor ≤ 3 nas últimas 5. Ajustável em `config.js`.
   Uma nova triagem reinicia as fases.

## Configuração (uma vez)
1. Crie um projeto novo no Supabase (separado do Nichioka).
2. **SQL Editor** → cole e rode `supabase/schema.sql` (tabelas, RLS, bucket de vídeos e exercícios de rascunho).
   Rodar de novo dá erro de policy duplicada — é esperado, só rode uma vez.
3. **Authentication → URL Configuration** → Site URL = domínio da Vercel (para os links de confirmação e senha).
4. **Settings → API** → copie URL e anon key para `config.js`.
5. Suba a pasta num repositório e importe na Vercel (sem build — site estático).

Não precisa de `service_role` em lugar nenhum: cada pessoa cria a própria conta e as policies RLS garantem que ela só lê/escreve os próprios dados.

## Vídeos
1. **Storage → videos** → crie pastas por região e envie os arquivos (ex.: `lombar/ponte.mp4`).
2. **Table Editor → exercicios** → preencha `video_path` com o caminho do arquivo.
3. Para a fase 2 e 3, adicione linhas com `fase = 2` ou `3`. Enquanto uma fase não tiver exercícios, o app continua mostrando a fase anterior.

Dica: MP4 (H.264) em 720p, até ~20 MB cada, roda bem no celular. O bucket é privado — o app gera links temporários só para quem está logado.

## Antes de abrir ao público
- Termo de uso + aviso de que o app não substitui avaliação, aceito no cadastro.
- Política de privacidade (LGPD — dados de saúde são dados sensíveis).
- Revisar a lista de sinais de alerta e os exercícios de rascunho.
