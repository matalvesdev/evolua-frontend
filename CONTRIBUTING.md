# Contribuindo para Evolua

## Antes de começar

Leia [AGENTS.md](AGENTS.md), [Master Context](docs/EVOLUA_MASTER_CONTEXT.md) e o domínio afetado. Inspecione o código e os testes antes de criar padrão novo. Não invente regra clínica, não exponha dado sensível e não use `any`/segredos em código.

## Workflow

Trabalhe a partir de `develop` em branch de feature/fix. Faça mudanças pequenas, rode os comandos do pacote afetado, atualize testes e documentação. Commits seguem Conventional Commits. Não faça push direto em `main`; consulte `.doc/git-flow-runbook.md`.

## Qualidade

Para frontend/landing, build antes de typecheck/lint conforme convenções do projeto. Para backend, rode testes, lint, build e validação Prisma aplicáveis. Migrations são código de produção: pequenas, registradas e com rollback/backup considerados.

## Segurança

Reporte vulnerabilidades conforme [SECURITY.md](SECURITY.md). Não abra issue pública com segredo ou detalhe explorável. Alterações de auth, tenant, arquivos, export, billing e IA exigem análise explícita de autorização e privacidade.
