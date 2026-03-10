# Skill: Backend Development

## Descrição
Conhecimento sobre design de APIs REST, arquitetura de serviços, tratamento de erros, autenticação e segurança no backend.

## Regras de Implementação

### 1. Design de APIs REST
- **Nomenclatura**: Usar substantivos no plural (`/patients`, `/appointments`)
- **Métodos HTTP**: GET (listar/buscar), POST (criar), PATCH (atualizar parcial), DELETE (remover)
- **Status Codes**: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Internal Server Error)
- **Paginação**: Sempre paginar listas com `page`, `limit`, `total`, `totalPages`
- **Filtros**: Query params para filtros (`?status=active&search=joão`)
- **Ordenação**: Query param `sort` (`?sort=-createdAt` para desc)

### 2. Arquitetura de Serviços (NestJS)
```
src/
├── modules/
│   └── patients/
│       ├── patients.controller.ts    # Rotas e validação
│       ├── patients.service.ts       # Lógica de negócio
│       ├── patients.repository.ts    # Acesso a dados
│       ├── dto/
│       │   ├── create-patient.dto.ts
│       │   └── update-patient.dto.ts
│       └── entities/
│           └── patient.entity.ts
```

### 3. Tratamento de Erros
```typescript
// Custom Exception
export class PatientNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Paciente com ID ${id} não encontrado`)
  }
}

// Exception Filter
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : 500
    
    response.status(status).json({
      statusCode: status,
      message: this.sanitizeMessage(exception),
      timestamp: new Date().toISOString(),
    })
  }
}
```

### 4. Autenticação JWT
```typescript
// JWT Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    })
  }
  
  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      clinicId: payload.clinic_id,
      role: payload.role,
    }
  }
}

// Auth Guard
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// Roles Guard
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler())
    const request = context.switchToHttp().getRequest()
    return roles.includes(request.user.role)
  }
}
```

### 5. Validação de DTOs
```typescript
export class CreatePatientDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string
  
  @IsEmail()
  @IsOptional()
  email?: string
  
  @IsPhoneNumber('BR')
  @IsOptional()
  phone?: string
  
  @IsDateString()
  @IsOptional()
  birthDate?: string
}
```

### 6. Isolamento Multi-Tenant
```typescript
// Sempre filtrar por clinicId
async findAll(clinicId: string, filters: FilterDto) {
  return this.prisma.patient.findMany({
    where: {
      clinicId,
      ...filters,
    },
  })
}

// Validar ownership antes de atualizar/deletar
async update(id: string, clinicId: string, dto: UpdatePatientDto) {
  const patient = await this.findOne(id, clinicId)
  if (!patient) {
    throw new PatientNotFoundException(id)
  }
  return this.prisma.patient.update({
    where: { id },
    data: dto,
  })
}
```

## Boas Práticas

### Performance
- Usar índices em colunas frequentemente filtradas
- Evitar N+1 queries (usar `include` ou `select`)
- Implementar paginação em todas as listagens
- Usar connection pooling (PgBouncer)

### Segurança
- Validar todos os inputs com DTOs
- Sanitizar mensagens de erro (não expor stack traces)
- Usar prepared statements (proteção contra SQL injection)
- Implementar rate limiting em rotas sensíveis
- Validar ownership antes de operações (clinic_id)

### Código Limpo
- Separar responsabilidades (controller → service → repository)
- Usar injeção de dependências
- Escrever testes unitários para services
- Documentar APIs com Swagger/OpenAPI

## Erros Comuns a Evitar

❌ **Não validar clinic_id**
```typescript
// ERRADO
async findAll() {
  return this.prisma.patient.findMany()
}

// CORRETO
async findAll(clinicId: string) {
  return this.prisma.patient.findMany({
    where: { clinicId },
  })
}
```

❌ **Expor stack traces**
```typescript
// ERRADO
catch (error) {
  throw new InternalServerErrorException(error.message)
}

// CORRETO
catch (error) {
  this.logger.error(error)
  throw new InternalServerErrorException('Erro ao processar requisição')
}
```

❌ **N+1 Queries**
```typescript
// ERRADO
const patients = await this.prisma.patient.findMany()
for (const patient of patients) {
  patient.appointments = await this.prisma.appointment.findMany({
    where: { patientId: patient.id },
  })
}

// CORRETO
const patients = await this.prisma.patient.findMany({
  include: { appointments: true },
})
```

❌ **Não paginar listas**
```typescript
// ERRADO
async findAll() {
  return this.prisma.patient.findMany()
}

// CORRETO
async findAll(page: number, limit: number) {
  const skip = (page - 1) * limit
  const [data, total] = await Promise.all([
    this.prisma.patient.findMany({ skip, take: limit }),
    this.prisma.patient.count(),
  ])
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}
```
