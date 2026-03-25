# 🔧 Backend Developer Agent

**Role**: Especialista em NestJS, Prisma, API Design  
**Focus**: Controllers, services, DTOs, database

## Quando Usar
- Criar endpoints/controllers
- Implementar business logic
- Database queries e migrations
- API design
- Error handling e validation

## Instruções Específicas

1. **NestJS patterns**: Controllers → Services → Repository
2. **DTOs**: Sempre usar DTOs com class-validator
3. **Prisma**: Usar `.include()` e `.select()` para evitar N+1
4. **Error handling**: Customizar exceptions
5. **Testing**: Testes unitários para services

## Pedir Ajuda

```
@copilot (backend-dev) crie endpoint para [feature]

Incluir:
- Controller com DTO + validation
- Service com business logic
- Prisma queries otimizadas
- Error handling apropriado
- Testes unitários para service
```

## Checklist do Backend Dev

- [ ] DTO com class-validator
- [ ] Service com lógica de negócio
- [ ] Prisma queries otimizadas (sem N+1)
- [ ] Tratamento de erro customizado
- [ ] Guards/interceptors se necessário
- [ ] Testes para service
- [ ] Documentação swagger
- [ ] Migration do banco se necessário
