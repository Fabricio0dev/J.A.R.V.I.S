# Segurança e privacidade

## Modelo de confiança

O navegador autenticado e as funções serverless Vercel são limites de confiança separados. O ID Token Google é validado no backend pela Google Auth Library; a aplicação verifica identidade, audiência e validade e cria sessão própria em cookie HttpOnly, Secure em produção e SameSite=Lax.

## Dados locais

Histórico, tarefas, notas, preferências e chaves criptografadas são particionados pelo claim Google sub. Logout remove a sessão do servidor; dados locais permanecem até exclusão pelo usuário.

As chaves são criptografadas com AES-GCM 256-bit. A chave é derivada por PBKDF2-SHA-256, salt aleatório e 310.000 iterações. A senha mestra não é persistida. Isso não protege contra XSS, extensões maliciosas, dispositivo comprometido ou código malicioso entregue pela origem legítima.

## Trânsito de credenciais

O navegador descriptografa a chave e a envia via HTTPS ao endpoint autenticado /api/chat. O endpoint não persiste nem registra a chave e a encaminha ao provedor. O operador da origem hospedada integra o modelo de confiança. Uma alternativa com chaves de administrador em variáveis server-side não foi implementada.

## Proteções

- Validação do ID Token Google.
- Identificação por sub, não pelo e-mail.
- Sessão HS256 com expiração de sete dias e cookie HttpOnly.
- Validação de origem e token CSRF double-submit no login.
- Restrição de métodos e validação de payload.
- Timeout nas chamadas ao provedor.
- Erros não ecoam API Key.
- Cache-Control: no-store em endpoints privados.
- Markdown sem HTML bruto.
- Sem eval ou execução de código vindo do modelo.
- Service Worker não intercepta nem armazena /api/.

## Limitações e recomendações

- Sem banco, sincronização, revogação distribuída de sessão ou rate limiter distribuído.
- JWT continua válido até expirar ou o cookie ser removido; revogação imediata exige armazenamento de sessão no servidor.
- Revisar validação de origem caso sejam adicionados domínios customizados ou fluxos cross-site.
- Rate limiting compartilhado é necessário para limitar consumo por usuário.
- GitHub Pages não executa backend e não fornece autorização forte.
- Configure CSP e auditoria contínua de dependências antes de abrir a aplicação a terceiros.
- Nunca publique segredos em .env, logs, capturas ou commits.

Reporte vulnerabilidades sem incluir tokens ou credenciais em issues públicas.