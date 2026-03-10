# Skill: Testing - Evolua CRM

## Descrição

Este skill contém conhecimento especializado sobre estratégias de testes, pirâmide de testes, testes unitários, testes de integração, testes end-to-end e property-based testing para o Evolua CRM. O objetivo é garantir qualidade, confiabilidade e manutenibilidade do código através de uma cobertura de testes abrangente.

## Pirâmide de Testes

```
        /\
       /  \
      / E2E \          ← Poucos, lentos, caros
     /--------\
    /          \
   / Integration \     ← Moderados
  /--------------\
 /                \
/   Unit Tests     \   ← Muitos, rápidos, baratos
--------------------
```

### Distribuição Ideal
- **70%** - Testes Unitários
- **20%** - Testes de Integração
- **10%** - Testes End-to-End

## Stack de Testes

### Ferramentas
- **Jest** - Framework de testes
- **React Testing Library** - Testes de componentes React
- **fast-check** - Property-based testing
- **MSW (Mock Service Worker)** - Mock de APIs
- **Playwright** - Testes E2E (futuro)

## Testes Unitários

### Estrutura de Teste

```typescript
// __tests__/components/patient-card.test.tsx
import { render, screen } from '@testing-library/react';
import { PatientCard } from '@/components/patients/patient-card';

describe('PatientCard', () => {
  const mockPatient = {
    id: '123',
    name: 'João Silva',
    email: 'joao@example.com',
    status: 'active',
  };

  it('should render patient name', () => {
    render(<PatientCard patient={mockPatient} />);
    expect(screen.getByText('João Silva')).toBeInTheDocument();
  });

  it('should render patient email', () => {
    render(<PatientCard patient={mockPatient} />);
    expect(screen.getByText('joao@example.com')).toBeInTheDocument();
  });
});
```

### Testando Hooks

```typescript
// __tests__/hooks/use-patients.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePatients } from '@/lib/hooks/use-patients';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('usePatients', () => {
  it('should fetch patients successfully', async () => {
    const { result } = renderHook(() => usePatients(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(3);
  });
});
```

### Testando Funções Utilitárias

```typescript
// __tests__/lib/utils/format-date.test.ts
import { formatDate } from '@/lib/utils/format-date';

describe('formatDate', () => {
  it('should format date to DD/MM/YYYY', () => {
    const date = new Date('2024-03-09');
    expect(formatDate(date)).toBe('09/03/2024');
  });

  it('should handle invalid dates', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });
});
```

## Property-Based Testing

### Conceito

Property-based testing gera automaticamente casos de teste aleatórios para validar propriedades do código.

### Exemplo com fast-check

```typescript
// __tests__/lib/validations/patient.test.ts
import fc from 'fast-check';
import { validatePatientName } from '@/lib/validations/patient';

describe('validatePatientName', () => {
  it('should always trim whitespace', () => {
    fc.assert(
      fc.property(fc.string(), (name) => {
        const result = validatePatientName(name);
        expect(result).toBe(name.trim());
      })
    );
  });

  it('should reject names shorter than 3 characters', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 2 }), (name) => {
        expect(() => validatePatientName(name)).toThrow();
      })
    );
  });

  it('should accept names with 3 or more characters', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 3 }), (name) => {
        expect(() => validatePatientName(name)).not.toThrow();
      })
    );
  });
});
```

### Geradores Customizados

```typescript
// __tests__/generators/patient.ts
import fc from 'fast-check';

export const patientArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 3, maxLength: 100 }),
  email: fc.emailAddress(),
  phone: fc.stringMatching(/^\d{10,11}$/),
  birthDate: fc.date({ max: new Date() }),
  status: fc.constantFrom('active', 'inactive', 'archived'),
});

// Uso
fc.assert(
  fc.property(patientArbitrary, (patient) => {
    // Testar propriedades do paciente
  })
);
```

## Testes de Integração

### Testando Fluxos Completos

```typescript
// __tests__/integration/patient-management.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PatientManagement } from '@/components/patient-management';
import { server } from '@/mocks/server';
import { rest } from 'msw';

describe('Patient Management Integration', () => {
  it('should create a new patient', async () => {
    const user = userEvent.setup();
    render(<PatientManagement />);

    // Abrir modal de criação
    await user.click(screen.getByText('Novo Paciente'));

    // Preencher formulário
    await user.type(screen.getByLabelText('Nome'), 'João Silva');
    await user.type(screen.getByLabelText('Email'), 'joao@example.com');
    await user.type(screen.getByLabelText('Telefone'), '11999999999');

    // Submeter
    await user.click(screen.getByText('Salvar'));

    // Verificar sucesso
    await waitFor(() => {
      expect(screen.getByText('Paciente criado com sucesso')).toBeInTheDocument();
    });

    // Verificar que paciente aparece na lista
    expect(await screen.findByText('João Silva')).toBeInTheDocument();
  });
});
```

### Mock Service Worker (MSW)

```typescript
// mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/rest/v1/patients', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: '1',
          name: 'João Silva',
          email: 'joao@example.com',
          status: 'active',
        },
      ])
    );
  }),

  rest.post('/rest/v1/patients', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: '2',
        ...req.body,
      })
    );
  }),
];
```

```typescript
// mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

```typescript
// jest.setup.ts
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Testes de Componentes React

### Testing Library Best Practices

```typescript
// __tests__/components/login-form.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/auth/login-form';

describe('LoginForm', () => {
  it('should show validation errors for invalid inputs', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    // Submeter formulário vazio
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    // Verificar erros
    expect(await screen.findByText('Email é obrigatório')).toBeInTheDocument();
    expect(await screen.findByText('Senha é obrigatória')).toBeInTheDocument();
  });

  it('should call onSubmit with valid credentials', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    // Preencher formulário
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'password123');

    // Submeter
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    // Verificar chamada
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
    });
  });
});
```

### Queries Recomendadas (Ordem de Prioridade)

1. **getByRole** - Mais acessível
2. **getByLabelText** - Para inputs
3. **getByPlaceholderText** - Placeholder
4. **getByText** - Texto visível
5. **getByTestId** - Último recurso

```typescript
// ✅ Bom
screen.getByRole('button', { name: /salvar/i });
screen.getByLabelText(/nome/i);

// ❌ Evitar
screen.getByTestId('save-button');
```

## Testes End-to-End (E2E)

### Estrutura com Playwright (Futuro)

```typescript
// e2e/patient-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Patient Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
  });

  test('should create, edit and delete patient', async ({ page }) => {
    // Criar paciente
    await page.click('text=Novo Paciente');
    await page.fill('[name="name"]', 'João Silva');
    await page.fill('[name="email"]', 'joao@example.com');
    await page.click('text=Salvar');
    await expect(page.locator('text=João Silva')).toBeVisible();

    // Editar paciente
    await page.click('text=João Silva');
    await page.click('text=Editar');
    await page.fill('[name="phone"]', '11999999999');
    await page.click('text=Salvar');
    await expect(page.locator('text=11999999999')).toBeVisible();

    // Deletar paciente
    await page.click('text=Excluir');
    await page.click('text=Confirmar');
    await expect(page.locator('text=João Silva')).not.toBeVisible();
  });
});
```

## Cobertura de Testes

### Configuração Jest

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/__tests__/**',
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Comandos

```bash
# Rodar testes com cobertura
npm test -- --coverage

# Gerar relatório HTML
npm test -- --coverage --coverageReporters=html

# Ver relatório
open coverage/index.html
```

## Boas Práticas

### 1. AAA Pattern (Arrange, Act, Assert)

```typescript
it('should calculate total price', () => {
  // Arrange
  const items = [
    { price: 10, quantity: 2 },
    { price: 5, quantity: 3 },
  ];

  // Act
  const total = calculateTotal(items);

  // Assert
  expect(total).toBe(35);
});
```

### 2. Testes Independentes

```typescript
// ❌ Ruim - testes dependentes
let patient;

it('should create patient', () => {
  patient = createPatient({ name: 'João' });
  expect(patient).toBeDefined();
});

it('should update patient', () => {
  updatePatient(patient.id, { name: 'Maria' });
  expect(patient.name).toBe('Maria');
});

// ✅ Bom - testes independentes
it('should create patient', () => {
  const patient = createPatient({ name: 'João' });
  expect(patient).toBeDefined();
});

it('should update patient', () => {
  const patient = createPatient({ name: 'João' });
  updatePatient(patient.id, { name: 'Maria' });
  expect(patient.name).toBe('Maria');
});
```

### 3. Nomes Descritivos

```typescript
// ❌ Ruim
it('test 1', () => {});

// ✅ Bom
it('should return error when email is invalid', () => {});
```

### 4. Um Assert por Teste (quando possível)

```typescript
// ❌ Ruim - múltiplos asserts não relacionados
it('should validate patient', () => {
  expect(patient.name).toBe('João');
  expect(patient.email).toBe('joao@example.com');
  expect(patient.age).toBeGreaterThan(18);
});

// ✅ Bom - asserts relacionados
it('should have valid patient data', () => {
  expect(patient).toMatchObject({
    name: 'João',
    email: 'joao@example.com',
  });
});

it('should be adult', () => {
  expect(patient.age).toBeGreaterThan(18);
});
```

## Erros Comuns a Evitar

### ❌ Erros Frequentes

1. **Testar implementação ao invés de comportamento**
```typescript
// ❌ Ruim
expect(component.state.isLoading).toBe(true);

// ✅ Bom
expect(screen.getByText('Carregando...')).toBeInTheDocument();
```

2. **Não limpar mocks**
```typescript
// ❌ Ruim
jest.mock('@/lib/api');

// ✅ Bom
afterEach(() => {
  jest.clearAllMocks();
});
```

3. **Testes muito lentos**
```typescript
// ❌ Ruim
await new Promise(resolve => setTimeout(resolve, 5000));

// ✅ Bom
await waitFor(() => expect(element).toBeInTheDocument());
```

4. **Não testar casos de erro**
```typescript
// ❌ Ruim - só testa caso de sucesso
it('should fetch patients', async () => {
  const patients = await fetchPatients();
  expect(patients).toHaveLength(3);
});

// ✅ Bom - testa erro também
it('should handle fetch error', async () => {
  server.use(
    rest.get('/patients', (req, res, ctx) => {
      return res(ctx.status(500));
    })
  );

  await expect(fetchPatients()).rejects.toThrow();
});
```

## Checklist de Testes

### Antes de Commitar
- [ ] Todos os testes passando
- [ ] Cobertura >80%
- [ ] Testes de casos de erro
- [ ] Testes de edge cases
- [ ] Mocks limpos após cada teste
- [ ] Sem console.log nos testes

### Code Review
- [ ] Testes cobrem requisitos
- [ ] Nomes descritivos
- [ ] Testes independentes
- [ ] Sem duplicação
- [ ] Performance adequada

## Recursos Adicionais

### Documentação
- [Jest](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [fast-check](https://fast-check.dev/)
- [MSW](https://mswjs.io/)
- [Playwright](https://playwright.dev/)

### Artigos
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Property-Based Testing](https://hypothesis.works/articles/what-is-property-based-testing/)
