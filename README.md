# Movimento Escola

PWA em JS puro + Supabase + Vercel (mesmo caminho do Nichioka Outcomes).

## Fluxo
1. **Cadastro/login** — e-mail e senha (Supabase Auth). Cadastrou, já entra (sem confirmação de e-mail). "Esqueci a senha" envia link para criar nova senha.
2. **Triagem** — regiões (lombar, joelho, quadril, ombro, cervical, tornozelo), intensidade 0–10 e 8 sinais de alerta.
   Qualquer sinal de alerta → tela orientando avaliação profissional, sem liberar o programa.
   Dor ≥ 8 → libera, com aviso para reduzir amplitude.
3. **Treino do dia** — rodízio de 5 dias (Dia 1 a Dia 5). Cada região tem 6 exercícios e cada dia mostra 3 deles.
   O dia avança a cada treino concluído; se a pessoa faltar, continua de onde parou. Depois do Dia 5, volta ao Dia 1.
   Uma nova triagem recomeça no Dia 1. Dor pós-treino ≥ 7 → orientação para reduzir a carga.
4. **Progresso** — dias seguidos, semana em barras, posição no rodízio e dor média pós-treino por região.

**Editar exercícios:** Table Editor → `exercicios`. A coluna `dias` diz em quais dias o exercício aparece, ex.: `{1,3,5}`.

## Configuração (uma vez)
1. Crie um projeto novo no Supabase (separado do Nichioka).
2. **SQL Editor** → cole e rode `supabase/schema.sql` (tabelas, RLS, bucket de vídeos e exercícios de rascunho).
   Pode rodar de novo sem problema — não duplica nada.
3. **Authentication → URL Configuration** → Site URL = domínio da Vercel (para os links de confirmação e senha).
4. **Settings → API** → copie URL e anon key para `config.js`.
5. Suba a pasta num repositório e importe na Vercel (sem build — site estático).

Não precisa de `service_role` em lugar nenhum: cada pessoa cria a própria conta e as policies RLS garantem que ela só lê/escreve os próprios dados.

## Vídeos
Os 33 vídeos vão direto no bucket **Storage → videos** (sem pastas). O `schema.sql` já liga cada exercício ao seu vídeo pela coluna `video_path`.

Dica: MP4 (H.264) em 720p, até ~20 MB cada, roda bem no celular. O bucket é privado — o app gera links temporários só para quem está logado.

## Antes de abrir ao público
- Termo de uso + aviso de que o app não substitui avaliação, aceito no cadastro.
- Política de privacidade (LGPD — dados de saúde são dados sensíveis).
- Revisar a lista de sinais de alerta e os exercícios de rascunho.
