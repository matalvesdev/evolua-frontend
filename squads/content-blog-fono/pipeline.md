# Pipeline: Content Squad — Blog Fono

## Fluxo

1. **🔍 Pesquisadora** → Coleta tendências, busca dados, analisa concorrentes
   - Checkpoint: "Briefing de pauta pronto. Aprova?"
2. **🧠 Estrategista** → Define ângulo, formato, palavras-chave, CTA
   - Checkpoint: "Estratégia definida. Aprova o ângulo?"
3. **✍️ Redatora** → Produz o conteúdo (blog HTML, post, email)
   - Checkpoint: "Rascunho pronto. Aprova o conteúdo?"
4. **🎨 Designer** → Cria assets visuais (capa, infográfico, imagens)
   - Checkpoint: "Assets prontos. Aprova o visual?"
5. **🧐 Revisora** → Aplica checklist de qualidade, consistência, LGPD
   - Checkpoint: "Conteúdo revisado e aprovado. Publicar?"

## Entrada

- Briefing do agente Content Strategist (pauta do calendário editorial)

## Saída

- Artigo publicado em `blog_posts` (Supabase) com `status='published'`
- Assets visuais em `landing-core/public/materiais/`
- Post de redes sociais (se aplicável)
