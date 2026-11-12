# J.A.R.V.I.S. — Personal Intelligence

Assistente pessoal em React + TypeScript + Vite, com interface holográfica, ferramentas locais, voz, autenticação Google e adaptadores para OpenAI, Gemini, Claude e Perplexity.

> Versão inicial 0.1.0. A aplicação depende de configurar Google OAuth e sessão na Vercel para autenticação real. Verifique o CI antes de considerar o deploy validado.

## Requisitos e execução

- Node.js 22 LTS, npm.
- Google OAuth 2.0 Web Client ID.
- Chaves individuais dos provedores desejados.
- Conta Vercel para backend e autenticação segura.

    npm install
    cp .env.example .env.local
    npm run dev

O login e endpoints serverless exigem ambiente Vercel ou runtime local compatível com as rotas api/. Sem isso, o shell visual pode ser carregado, mas login e chamadas de backend não funcionarão.

## Google Identity Services

1. Crie OAuth Client ID do tipo Web no Google Cloud Console.
2. Cadastre as origens autorizadas de desenvolvimento e produção.
3. Configure o mesmo Client ID como VITE_GOOGLE_CLIENT_ID e GOOGLE_CLIENT_ID.
4. Não exponha OAuth Client Secret no frontend.

O backend valida o ID Token usando Google Auth Library e verifica assinatura, issuer, audience, validade e e-mail verificado. O identificador é o claim sub. Documentação: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token

## Variáveis

| Variável | Ambiente | Uso |
| --- | --- | --- |
| VITE_GOOGLE_CLIENT_ID | Frontend | Client ID público do GIS |
| GOOGLE_CLIENT_ID | Servidor | Audiência esperada do ID Token |
| SESSION_SECRET | Servidor | Segredo aleatório de pelo menos 32 caracteres |
| APP_ORIGIN | Servidor | Origem HTTPS exata em produção |

Gere SESSION_SECRET com openssl rand -base64 48. Armazene somente em variáveis protegidas da Vercel. Nunca comite .env.

## Chaves de IA

Em Configurações, escolha o provedor, modelo, API Key e senha mestra. O segredo é criptografado no navegador usando AES-GCM e PBKDF2. Na chamada, o navegador descriptografa a chave e envia ao backend autenticado por HTTPS, que a encaminha ao provedor sem persistir nem registrar. Isso não protege contra XSS, extensão maliciosa ou código comprometido servido pela própria origem.

Modelos iniciais são sugestões editáveis, não catálogo garantido:
- OpenAI: https://developers.openai.com/api/reference
- Gemini: https://ai.google.dev/api
- Anthropic: https://platform.claude.com/docs/en/api
- Perplexity: https://docs.perplexity.ai/

## Recursos

- Ferramentas locais: relógio, data, calculadora sem eval, lista de tarefas.
- Pesquisas Google e YouTube: URL construída e aberta mediante clique do usuário.
- Clima via Open-Meteo, solicitando geolocalização somente ao pedir o clima.
- Web Speech API: disponibilidade e comportamento variam por navegador; wake word não é garantida em segundo plano.
- PWA com manifest, service worker e cache limitado ao shell; APIs privadas não são armazenadas offline.

## Testes

    npm run typecheck
    npm run test:run
    npm run build

O GitHub Actions executa esses passos em push e pull request. Consulte a aba Actions.

## Vercel

1. Importe Fabricio0dev/J.A.R.V.I.S no painel.
2. Build: npm run build; output: dist.
3. Defina VITE_GOOGLE_CLIENT_ID, GOOGLE_CLIENT_ID, SESSION_SECRET e APP_ORIGIN.
4. Cadastre a URL de produção como origem autorizada no Google.
5. Durante desenvolvimento, use a branch de feature para preview; só defina main como produção após o merge.

## GitHub Pages

Workflow manual/automático publica somente shell estático. GitHub Pages não executa as rotas serverless de login e IA; portanto, não oferece a mesma fronteira de autorização. Para a aplicação completa, use Vercel.

## Estrutura

- src/app: aplicação principal.
- src/components: login, configurações, núcleo holográfico.
- src/lib: cofre, storage, ferramentas locais e integrações.
- api/: login, sessão, logout e proxy IA.
- public/: manifest, ícone, service worker.
- tests/: testes unitários.
- .github/workflows/: CI e Pages.

## Limitações da versão 0.1.0

- Memória, tarefas e histórico são locais ao navegador; não sincronizam entre dispositivos.
- Chaves de API são inseridas pelo usuário; não são salvas no servidor.
- Não há rate limiter distribuído nem revogação imediata de sessões.
- Reconhecimento de voz tem suporte desigual entre browsers.
- Não há integração de busca/notícias que preencha cards reais no painel de contexto.
- GitHub Pages é apenas estático; backend exige Vercel.

Leia SECURITY.md antes de utilizar com dados sensíveis.