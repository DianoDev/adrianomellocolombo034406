# Pet Manager - Front End

Sistema de gerenciamento de Pets e Tutores desenvolvido em Angular 21.

## Dados de Inscrição

| Campo | Valor                           |
|-------|---------------------------------|
| **Nome** | Adriano Mello Colombo           |
| **CPF** | 034.406.111-67                  |
| **E-mail** | adrianomellocolombo@gmail.com   |
| **Vaga** | Engenheiro da Computação Sênior |

## Arquitetura do Projeto

### Visão Geral

O projeto segue uma arquitetura modular e escalável, utilizando as melhores práticas do Angular moderno:

```
src/
├── app/
│   ├── core/                    # Núcleo da aplicação
│   │   ├── facades/             # Padrão Facade com BehaviorSubject
│   │   ├── guards/              # Guards de autenticação
│   │   ├── interceptors/        # HTTP Interceptors
│   │   ├── models/              # Interfaces e tipos
│   │   └── services/            # Serviços de API
│   ├── features/                # Módulos de funcionalidades
│   │   ├── auth/                # Autenticação (login)
│   │   ├── pets/                # CRUD de Pets
│   │   ├── tutores/             # CRUD de Tutores
│   │   └── health/              # Health Checks
│   └── shared/                  # Componentes reutilizáveis
│       └── components/
│           ├── layout/          # Header e navegação
│           ├── pagination/      # Componente de paginação
│           └── search-box/      # Componente de busca
├── environments/                # Configurações por ambiente
└── styles.css                   # Estilos globais (Tailwind)
```

### Padrão Facade com BehaviorSubject

O projeto implementa o padrão **Facade** para gerenciamento de estado, conforme requisito Sênior:

```typescript
// Exemplo: PetFacade
interface PetState {
  pets: Pet[];
  selectedPet: PetCompleto | null;
  loading: boolean;
  error: string | null;
  filter: PetFilter;
}

// BehaviorSubject para estado reativo
private state$ = new BehaviorSubject<PetState>(initialState);

// Observables expostos para componentes
pets$ = this.state$.pipe(map(s => s.pets));
loading$ = this.state$.pipe(map(s => s.loading));
```

**Benefícios:**
- Estado centralizado e previsível
- Separação de responsabilidades
- Facilita testes unitários
- Componentes desacoplados da lógica de negócio

### Decisões Técnicas

| Decisão | Justificativa |
|---------|---------------|
| **Standalone Components** | Padrão recomendado no Angular 14+, elimina NgModules |
| **Signals** | Reatividade nativa do Angular, melhor performance |
| **OnPush Change Detection** | Otimização de renderização |
| **Tailwind CSS v4** | Framework CSS utilitário, responsivo e produtivo |
| **Vitest** | Test runner moderno, rápido e compatível com ES modules |
| **Lazy Loading** | Carregamento sob demanda, reduz bundle inicial |
| **HTTP Interceptors** | Centraliza autenticação e tratamento de erros |

### Fluxo de Autenticação

```
┌─────────────┐     POST /autenticacao/login     ┌─────────────┐
│   Login     │ ──────────────────────────────►  │    API      │
│  Component  │ ◄──────────────────────────────  │             │
└─────────────┘     { access_token, refresh }    └─────────────┘
       │
       ▼
┌─────────────┐
│ AuthService │ ─► localStorage (tokens)
└─────────────┘
       │
       ▼
┌─────────────┐     Authorization: Bearer xxx    ┌─────────────┐
│ Interceptor │ ──────────────────────────────►  │    API      │
└─────────────┘                                  └─────────────┘
       │
       ▼ (se 401)
┌─────────────┐     PUT /autenticacao/refresh    ┌─────────────┐
│   Refresh   │ ──────────────────────────────►  │    API      │
└─────────────┘                                  └─────────────┘
```

## Requisitos Implementados

### Requisitos Gerais
- [x] Requisição de dados em tempo real (HttpClient)
- [x] Layout responsivo (Tailwind CSS)
- [x] Tailwind CSS como framework CSS
- [x] Lazy Loading Routes (Pets e Tutores)
- [x] Paginação (10 itens por página)
- [x] TypeScript com strict mode
- [x] Componentização e organização modular
- [x] Testes unitários básicos

### Requisitos Específicos
- [x] Tela de listagem de Pets com cards, busca e paginação
- [x] Tela de detalhamento do Pet com dados do tutor
- [x] Tela de cadastro/edição de Pet com upload de foto
- [x] Tela de cadastro/edição de Tutor com upload de foto
- [x] Vinculação e desvinculação de Pets aos Tutores
- [x] Autenticação JWT com login e refresh de token

### Requisitos Sênior
- [x] Health Checks e Liveness/Readiness
- [x] Testes unitários (12 arquivos .spec.ts)
- [x] Padrão Facade com BehaviorSubject

## Observações sobre a API

### Campo "Espécie" Não Disponível

O requisito menciona os campos "nome, espécie, idade, raça" para Pets. Porém, **a API não possui o campo "espécie"**.

Conforme documentação Swagger da API (`https://pet-manager-api.geia.vip/q/swagger-ui/`):

```typescript
// PetRequestDto - campos disponíveis
{
  nome: string;      // obrigatório
  raca?: string;     // opcional
  idade?: number;    // opcional
}
```

O front-end implementa todos os campos disponíveis na API.

## Como Executar

### Pré-requisitos

- Node.js 22+
- npm 10+
- Docker e Docker Compose (para execução containerizada)

### Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
ng serve
# ou
npm start

# Acessar em http://localhost:4200
```

### Executar Testes

```bash
# Testes unitários
ng test
# ou
npm test

# Testes com coverage
npm run test:coverage
```

### Build de Produção

```bash
# Build otimizado
ng build --configuration=production

# Artefatos em dist/pet-manager/browser/
```

### Execução com Docker

```bash
# Build da imagem
docker build -t pet-manager .

# Executar container
docker run -p 80:80 pet-manager

# Ou usando docker-compose
docker-compose up -d

# Acessar em http://localhost
```

## Estrutura de Componentes

### Features

| Feature | Componentes | Descrição |
|---------|-------------|-----------|
| **auth** | LoginComponent | Tela de login com validação |
| **pets** | PetListComponent, PetDetailComponent, PetFormComponent, PetCardComponent | CRUD completo de Pets |
| **tutores** | TutorListComponent, TutorDetailComponent, TutorFormComponent, TutorCardComponent | CRUD completo de Tutores |
| **health** | HealthStatusComponent | Dashboard de saúde da aplicação |

### Shared

| Componente | Descrição |
|------------|-----------|
| LayoutComponent | Header com navegação e estado de autenticação |
| PaginationComponent | Paginação reutilizável |
| SearchBoxComponent | Campo de busca com debounce |

## Endpoints Consumidos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /autenticacao/login | Autenticação |
| PUT | /autenticacao/refresh | Renovar token |
| GET | /v1/pets | Listar pets (paginado) |
| GET | /v1/pets/{id} | Detalhes do pet |
| POST | /v1/pets | Criar pet |
| PUT | /v1/pets/{id} | Atualizar pet |
| POST | /v1/pets/{id}/fotos | Upload de foto do pet |
| GET | /v1/tutores | Listar tutores (paginado) |
| GET | /v1/tutores/{id} | Detalhes do tutor |
| POST | /v1/tutores | Criar tutor |
| PUT | /v1/tutores/{id} | Atualizar tutor |
| POST | /v1/tutores/{id}/fotos | Upload de foto do tutor |
| POST | /v1/tutores/{id}/pets/{petId} | Vincular pet ao tutor |
| DELETE | /v1/tutores/{id}/pets/{petId} | Desvincular pet do tutor |

## Tecnologias Utilizadas

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Angular | 21.1.0 | Framework principal |
| TypeScript | 5.8 | Linguagem |
| Tailwind CSS | 4.1.12 | Estilização |
| Vitest | - | Testes unitários |
| RxJS | 7.x | Programação reativa |
| Docker | - | Containerização |
| Nginx | Alpine | Servidor web de produção |

## Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| start | `ng serve` | Servidor de desenvolvimento |
| build | `ng build` | Build de produção |
| test | `ng test` | Executar testes |
| watch | `ng build --watch` | Build com watch |

## Licença

Este projeto foi desenvolvido como parte do processo seletivo do Estado de Mato Grosso.
