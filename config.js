// Preencha com os dados do seu projeto Supabase (Settings > API).
// A anon key é pública por design — a segurança vem das policies RLS do schema.sql.
export const SUPABASE_URL = 'https://wvmkxserpyzzugympezl.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_fLv1oYRKJcoYLvpZp9ZUyA_UH86ltgK';

// Regras de progressão de fase
export const PROGRESSAO = {
  sessoesParaAvancar: 10,   // sessões concluídas na fase atual
  dorMaximaMedia: 3,        // média de dor pós-treino nas últimas 5 sessões
  ultimasSessoes: 5,
  dorAlerta: 7,             // dor pós-treino que dispara orientação
};
