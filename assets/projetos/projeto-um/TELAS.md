# TaskFlow — Documentação das Telas

Documento de referência de todas as telas do sistema, o que cada uma faz, quem pode
acessá-las e como se conectam com o backend. Gerado a partir do estado atual do
código (frontend em `apps/web`, backend em `apps/api`).

## Índice

1. [Visão geral da aplicação](#1-visão-geral-da-aplicação)
2. [Login e multi-empresa](#2-login-e-multi-empresa)
3. [Sistema de permissões (roles, telas, grupos)](#3-sistema-de-permissões-roles-telas-grupos)
4. [Home (painel inicial)](#4-home-painel-inicial)
5. [Tarefas](#5-tarefas)
6. [Usuários](#6-usuários)
7. [Projetos — Cadastro](#7-projetos--cadastro)
8. [Projetos — Listagem](#8-projetos--listagem)
9. [Perfis de Acesso (Roles)](#9-perfis-de-acesso-roles)
10. [Grupos](#10-grupos)
11. [Empresas (Companies)](#11-empresas-companies)
12. [Painel da Equipe (Team Dashboard)](#12-painel-da-equipe-team-dashboard)
13. [Apontamentos (histórico)](#13-apontamentos-histórico)
14. [Menu do Usuário](#14-menu-do-usuário)
15. [Configurações (Settings)](#15-configurações-settings)
16. [Tema (claro/escuro) e Idioma (i18n)](#16-tema-claroescuro-e-idioma-i18n)
17. [Resumo de endpoints da API](#17-resumo-de-endpoints-da-api)

---

## 1. Visão geral da aplicação

O TaskFlow é um gerenciador de tarefas multi-empresa (multi-tenant). O frontend
(`apps/web`) não usa roteador de URL — é um shell de abas ao estilo navegador:
a barra lateral (`Sidebar`) abre/reaproveita abas em `App.tsx`, e cada aba
renderiza um componente de tela. A aba "Início" nunca pode ser fechada.

Enquanto não há usuário autenticado (sem `token`/`user` no contexto), a
aplicação inteira renderiza a tela de **Login**.

Estrutura de menu lateral (condições de exibição entre parênteses):

```
Início
Tarefas
Usuários
Painel da Equipe
Apontamentos
Projetos
  ├─ Cadastrar
  └─ Listar
Config. de Permissões          (só se o usuário puder configurar permissões)
  ├─ Perfis (Roles)
  └─ Grupos
Config. de Empresa             (só se user.is_master === true)
  └─ Empresas
```

A tela **Configurações** não está na barra lateral — só é acessada pelo
**Menu do Usuário** (clique no avatar, canto superior direito).

---

## 2. Login e multi-empresa

**Componente:** `apps/web/src/components/auth/Login.tsx`
**Endpoint:** `POST /auth/login` → body `{ company, email, senha }`

Campos do formulário (todos obrigatórios): **Empresa** (código da empresa),
**E-mail**, **Senha**. Um alerta na própria tela mostra as credenciais padrão
do administrador (`company: master`, `email: admin@taskflow.com`,
`senha: admin123`) para facilitar o primeiro acesso.

Ao logar com sucesso, o token JWT é salvo em `localStorage.token` e o perfil
do usuário é carregado via `GET /auth/me`. Erros de login (empresa incorreta,
senha errada, sem acesso à empresa) aparecem como um `Alert` com a mensagem
já traduzida no idioma ativo.

### Como funciona o multi-empresa

- O e-mail do usuário é único **globalmente** (não por empresa); a senha é
  comparada por hash (bcrypt) independente da empresa digitada no login.
- O campo **Empresa** do login identifica em qual empresa a sessão vai
  operar. As regras de liberação são:
  - **Empresa própria**: se a empresa digitada é a empresa do próprio
    usuário, sempre libera.
  - **Admin da empresa Master**: se o usuário é `ADMIN` e sua empresa "casa"
    é a empresa Master, ele pode entrar em qualquer empresa digitando o
    código dela.
  - **Acesso concedido explicitamente**: se a empresa do usuário é a Master,
    o sistema verifica a tabela `user_company_access` — acessos concedidos
    manualmente pela tela **Empresas → Gerenciar Acesso**.
  - Se nenhuma regra se aplica, o login falha com o erro
    `AUTH_COMPANY_ACCESS_DENIED`.
- Toda a aplicação (tarefas, projetos, usuários etc.) é isolada por
  `company_id` — cada empresa só enxerga seus próprios dados.
- Cada empresa pode ter um limite de usuários (`max_users`); ao tentar criar
  um usuário além do limite, o sistema bloqueia com
  `COMPANY_MAX_USERS_REACHED`.
- Cada empresa pode definir uma **senha padrão** (`senha_padrao`) usada para
  novos usuários quando nenhuma senha é informada no cadastro (se não
  houver senha padrão definida, o sistema usa `123456`).

---

## 3. Sistema de permissões (roles, telas, grupos)

O controle de acesso combina três conceitos:

- **Perfil de acesso** (`perfil_acesso`): `USER` ou `ADMIN`. `ADMIN` sempre
  tem acesso total a tudo.
- **Papel/Role** (`role_id`): cada usuário pode pertencer a um *role* da sua
  empresa. Toda empresa nova ganha automaticamente um role de sistema
  chamado **GESTOR** (não pode ser renomeado nem excluído), que já vem com
  acesso total às telas configuráveis.
- **Telas configuráveis** (`screen_key`): hoje existem apenas duas telas
  com controle de acesso granular por role: `roles-config` (a própria tela
  de Perfis) e `groups-config` (tela de Grupos). Um usuário `ADMIN` ou
  `GESTOR` sempre enxerga as duas; os demais usuários só veem o que a role
  deles liberar explicitamente (campo `can_view` da tabela
  `screen_permissions`).
- **Grupos e liderança**: grupos (`groups`) têm líderes e membros
  (`group_leaders`, `group_members`). Um usuário que lidera um ou mais
  grupos enxerga, no **Painel da Equipe** e em **Apontamentos**, apenas os
  membros dos grupos que lidera (em vez de todos os usuários da empresa).

Demais telas (Tarefas, Usuários, Projetos, Painel da Equipe, Apontamentos)
não têm controle de tela granular — ficam liberadas para qualquer usuário
autenticado da empresa; o que muda entre perfis é **quais dados** cada um
enxerga (ex.: um líder de grupo só vê o status dos seus liderados).

A proteção real acontece sempre no **backend** (guards); o menu lateral só
oculta/exibe itens de acordo com essas mesmas regras, para não poluir a UI
com telas que o usuário não pode usar.

---

## 4. Home (painel inicial)

**Componente:** `apps/web/src/components/home/index.tsx`
**Aba:** "Início" (fixa, não pode ser fechada)

- Saudação personalizada com o nome do usuário logado.
- Campo rápido **"O que você vai fazer hoje?"**: ao digitar e enviar, cria
  automaticamente uma tarefa de 1 hora, com início e fim hoje, status
  "Aguardando" e descrição fixa "Criado a partir do painel inicial".
- Dica clicável que leva direto para a aba **Tarefas**.
- Quatro cartões de estatística calculados a partir das tarefas do usuário:
  **Total de tarefas**, **Em andamento**, **Atrasadas** (tarefas cujo prazo
  já passou e que não estão finalizadas) e **Finalizadas**.

---

## 5. Tarefas

**Componente:** `apps/web/src/components/tasks/index.tsx`
**Aba:** "Tarefas"

Listagem em cartões (grade de 2 colunas), um cartão por tarefa, mostrando:
número e nome, descrição, projeto vinculado (se houver), horas previstas,
intervalo de datas (início–fim), e uma etiqueta colorida de status:

| Status | Cor |
|---|---|
| Finalizado | verde |
| Em andamento | azul |
| Pausado | roxo |
| Cancelado | vermelho |
| Aguardando | laranja |

Tarefas com prazo vencido e não finalizadas ganham uma etiqueta extra
vermelha **"Atrasada"**.

**Ações disponíveis em cada cartão:**
- ▶ **Iniciar** — habilitado só quando a tarefa está Aguardando ou Pausada.
- ⏸ **Pausar** — habilitado só quando está Em andamento.
- ✎ **Editar** — abre modal com os dados da tarefa.
- ⛔ **Cancelar** — pede confirmação; desabilitado se já Finalizada/Cancelada.
- ⚠ **Escalonar** — abre modal para registrar uma observação de escalonamento.
- 🗑 **Excluir** — remove a tarefa, com confirmação.

**Modal "Nova Tarefa":** Nome*, Descrição*, Horas* (≥0), Data início*, Data
fim*, Status* (Finalizado/Em andamento/Aguardando) e Projeto (opcional).

**Modal "Editar Tarefa":** mesmos campos, exceto Status — o status só muda
pelas ações Iniciar/Pausar/Cancelar/Escalonar.

**Regras de negócio:**
- Transições de status são validadas no backend: só é possível Iniciar a
  partir de Aguardando/Pausado; só é possível Pausar a partir de Em
  andamento; Cancelar é permitido a partir de Aguardando, Em andamento ou
  Pausado. Qualquer transição fora dessas regras é rejeitada
  (`TASK_INVALID_TRANSITION`).
- O campo "Atrasada" é calculado no banco: data fim menor que hoje e status
  diferente de Finalizado.
- Toda operação é restrita à empresa do usuário logado.

---

## 6. Usuários

**Componente:** `apps/web/src/components/users/index.tsx`
**Aba:** "Usuários"

Tabela com colunas: Foto (avatar), ID, Nome, E-mail, Perfil (etiqueta
dourada para ADMIN, azul para USER) e Ações (editar / excluir com
confirmação).

**Modal "Adicionar Usuário":** Nome*, E-mail* (validado), Senha*, Perfil*
(USER/ADMIN, padrão USER), Foto (URL, opcional).

**Modal "Editar Usuário":** mesmos campos, mas a senha é opcional — se
deixada em branco, a senha atual é mantida.

**Regras de negócio:**
- Respeita o limite de usuários da empresa (`max_users`), se configurado.
- Se nenhuma senha for informada na criação, usa a senha padrão da empresa
  ou `123456`.
- Cada usuário só vê e gerencia os usuários da própria empresa.

---

## 7. Projetos — Cadastro

**Componente:** `apps/web/src/components/projects/Cadastro.tsx`
**Aba:** "Projetos → Cadastrar"

Formulário de criação de projeto (ver seção do formulário compartilhado
abaixo). Ao salvar, exibe mensagem de sucesso/erro e limpa o formulário
para um novo cadastro.

## 8. Projetos — Listagem

**Componente:** `apps/web/src/components/projects/Listagem.tsx`
**Aba:** "Projetos → Listar"

Tabela com colunas: Título, Cliente, Complexidade (verde=Baixa,
dourado=Média, vermelho=Alta), Prioridade (padrão=Baixa, azul=Média,
laranja=Alta, vermelho=Urgente), Status (Planejamento / Em andamento /
Pausado / Concluído / Cancelado), Horas previstas, Responsáveis (nomes) e
Ações (editar / excluir).

Editar abre um modal com o mesmo formulário do cadastro, pré-preenchido.
Excluir pede confirmação.

### Formulário de Projeto (usado no Cadastro e na Edição)

- **Título*, Descrição*, Horas previstas*** (≥0)
- **Cliente** e **Referência CRM** (opcionais)
- **Complexidade*** (Baixa/Média/Alta, padrão Média)
- **Prioridade*** (Baixa/Média/Alta/Urgente, padrão Média)
- **Status*** (Planejamento/Em andamento/Pausado/Concluído/Cancelado,
  padrão Planejamento)
- **Responsáveis** (seleção múltipla de usuários da empresa)
- **Motivo/justificativa** (opcional)
- **Riscos** e **Ganhos**: listas dinâmicas de texto livre — é possível
  adicionar/remover quantas linhas forem necessárias; cada linha adicionada
  precisa ser preenchida.

---

## 9. Perfis de Acesso (Roles)

**Componente:** `apps/web/src/components/roles/index.tsx`
**Aba:** "Config. de Permissões → Perfis"
**Visível apenas para:** ADMIN, GESTOR, ou usuário cujo role já tenha acesso
a `roles-config` ou `groups-config`.

Tabela com colunas: Nome (com etiqueta "Sistema" se for um role protegido
como o GESTOR), Telas liberadas (etiquetas `roles-config`/`groups-config`) e
Ações (editar; excluir só aparece para roles que não são de sistema).

**Modal "Nova/Editar Role":** Nome* e um grupo de checkboxes com as telas
que esse role pode ver. Se o role for de sistema (ex.: GESTOR), o campo
Nome fica bloqueado — só é possível ajustar as telas liberadas.

**Regras de negócio:**
- Nome de role é único por empresa (`ROLE_NAME_ALREADY_EXISTS`).
- Só é possível liberar telas que existem de fato
  (`ROLE_INVALID_SCREEN` caso contrário).
- Roles de sistema não podem ser renomeados nem excluídos
  (`ROLE_CANNOT_DELETE_SYSTEM`).

---

## 10. Grupos

**Componente:** `apps/web/src/components/groups/index.tsx`
**Aba:** "Config. de Permissões → Grupos"
**Visível apenas para:** mesma regra da tela de Perfis.

Tabela com colunas: Nome, quantidade de Líderes, quantidade de Membros e
Ações (editar nome, gerenciar líderes, gerenciar membros, excluir).

**Modal "Novo/Editar Grupo":** apenas o campo Nome*.

**Modal "Gerenciar Líderes" / "Gerenciar Membros":** lista todos os
usuários da empresa com um interruptor (switch) para incluir/remover cada
um como líder ou membro do grupo. Salvar substitui a lista completa de
líderes/membros do grupo.

**Por que isso importa:** líderes de grupo enxergam, no Painel da Equipe e
em Apontamentos, apenas os membros dos grupos que lideram — é o mecanismo
usado para dar visibilidade de equipe sem dar acesso total à empresa.

---

## 11. Empresas (Companies)

**Componente:** `apps/web/src/components/companies/index.tsx`
**Aba:** "Config. de Empresa → Empresas"
**Visível apenas para:** usuários logados na empresa Master
(`user.is_master === true`).

Tabela com colunas: Código, Nome, "Master" (etiqueta se for a empresa
principal), Máx. de usuários (ou "sem limite") e Ações (editar; "gerenciar
acesso" aparece só para empresas que não são a Master).

**Modal "Nova/Editar Empresa":** Código* (identificador único usado no
login), Nome*, Máx. de usuários (opcional) e Senha padrão (opcional, usada
para novos usuários dessa empresa quando nenhuma senha é informada).

**Modal "Gerenciar Acesso":** lista todos os usuários do sistema com um
interruptor para conceder/revogar o acesso individual daquele usuário à
empresa selecionada — é o que permite que um usuário da empresa Master
entre em outra empresa digitando o código dela no login.

**Regra de negócio:** o código da empresa deve ser único
(`COMPANY_CODE_ALREADY_EXISTS`).

---

## 12. Painel da Equipe (Team Dashboard)

**Componente:** `apps/web/src/components/team-dashboard/index.tsx`
**Aba:** "Painel da Equipe"

Grade de cartões, um por membro visível, com avatar, nome, uma cor de
status e um detalhe (nome da tarefa ativa ou o motivo informado pelo
usuário).

**Significado das cores:**

| Cor | Significado |
|---|---|
| Cinza | Usuário marcou manualmente o status "Outros" (mostra o motivo) |
| Verde | Tem tarefa em andamento (mostra o nome da tarefa) |
| Amarelo | Tem tarefa pausada (mostra o nome da tarefa) |
| Vermelho | Ocioso — sem tarefa ativa no momento |

**Quem cada usuário enxerga no painel:**
- **ADMIN ou GESTOR**: todos os usuários da empresa.
- **Líder de grupo**: apenas os membros dos grupos que lidera.
- **Usuário comum**: apenas a si mesmo.

Botão **Atualizar** faz um refresh manual dos dados.

---

## 13. Apontamentos (histórico)

**Componente:** `apps/web/src/components/apontamentos/index.tsx`
**Aba:** "Apontamentos"

Tabela com o histórico de eventos de tarefas: Usuário, Tarefa, Evento
(etiqueta "Escalonamento" ou o nome do status para o qual a tarefa mudou),
Detalhe (a observação do escalonamento, quando houver) e Data/Hora.

Um filtro por usuário (Select, com opção de limpar) permite restringir a
lista a uma pessoa específica.

A lista combina duas origens de dados: o histórico de mudanças de status
das tarefas e os registros de escalonamento, ordenados do mais recente
para o mais antigo. A visibilidade de quais usuários aparecem segue a
mesma regra do Painel da Equipe (ADMIN/GESTOR veem todos; líder de grupo vê
seus liderados; usuário comum vê só a si mesmo).

---

## 14. Menu do Usuário

**Componente:** `apps/web/src/components/layout/UserMenu.tsx`
**Acesso:** clique no avatar/nome no canto superior direito do cabeçalho
(abre como um modal, não como dropdown).

Conteúdo do menu:

- **Cabeçalho**: avatar, nome e e-mail do usuário logado.
- **Configurações**: abre a aba de Configurações (ver seção 15).
- **Trocar tema**: interruptor claro/escuro.
- **Idioma**: seletor pt-BR / en-US.
- **Meu status**: seletor com as opções **AUTO** (status automático,
  calculado pelas tarefas do usuário) ou **OUTROS** (status manual); ao
  escolher "Outros", um campo de motivo se torna obrigatório. O botão
  "Salvar" grava o status.
- **Sair**: encerra a sessão.

O "status" definido aqui é o que aparece em cinza no Painel da Equipe
quando o usuário escolhe "Outros" — por exemplo, para sinalizar férias,
reunião externa, etc.

---

## 15. Configurações (Settings)

**Componente:** `apps/web/src/components/settings/index.tsx`
**Acesso:** apenas pelo Menu do Usuário → "Configurações" (não aparece na
barra lateral).

Tela simples com duas seções, espelhando os mesmos controles do Menu do
Usuário:

- **Tema**: interruptor claro/escuro.
- **Idioma**: seletor pt-BR / en-US.

Não faz nenhuma chamada à API — trabalha só com o contexto de tema salvo no
navegador (`localStorage`).

---

## 16. Tema (claro/escuro) e Idioma (i18n)

O tema e o idioma são controlados por um único contexto (`ThemeContext`),
compartilhado por toda a aplicação e disponível tanto no Menu do Usuário
quanto na tela de Configurações (os dois ficam sempre sincronizados).

- **Persistência**: a escolha de tema e idioma é salva no `localStorage` do
  navegador, então se mantém entre sessões.
- **Detecção automática**: na primeira visita (sem preferência salva), o
  tema inicial é definido pela preferência do sistema operacional
  (claro/escuro).
- **Tradução**: todos os textos da interface vêm de dois arquivos JSON na
  raiz do projeto — `language/pt-BR.json` e `language/en-US.json`. Se uma
  chave não existir no idioma ativo, o texto em português é usado como
  reserva.
- **Mensagens de erro da API**: cada erro do backend tem um código (ex.:
  `TASK_INVALID_TRANSITION`, `COMPANY_MAX_USERS_REACHED`); o frontend
  traduz esse código para uma mensagem amigável no idioma ativo, com uma
  mensagem genérica como último recurso caso o código não seja conhecido.
- **Componentes visuais**: o tema também troca o algoritmo de cores do Ant
  Design (claro/escuro) e o "locale" da biblioteca (formatação de datas,
  textos padrão de componentes) para acompanhar o idioma escolhido. A cor
  de destaque da marca (vermelho) é a mesma nos dois temas.

---

## 17. Resumo de endpoints da API

Todas as chamadas são feitas para `http://localhost:3001` (fixo no
frontend) com o token JWT enviado no cabeçalho `Authorization: Bearer`.

| Área | Endpoints |
|---|---|
| Autenticação | `POST /auth/login`, `GET /auth/me` |
| Tarefas | `GET/POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`, `PATCH /tasks/:id/start`, `PATCH /tasks/:id/pause`, `PATCH /tasks/:id/cancel`, `PATCH /tasks/:id/escalate` |
| Usuários | `GET/POST /users`, `PUT /users/:id`, `DELETE /users/:id`, `PATCH /users/me/status` |
| Empresas | `GET/POST /companies`, `PUT /companies/:id`, `GET /companies/access/:userId`, `POST /companies/access`, `DELETE /companies/access/:userId/:companyId` |
| Projetos | `GET/POST /projects`, `PUT /projects/:id`, `DELETE /projects/:id` |
| Perfis (Roles) | `GET/POST /roles`, `PUT /roles/:id`, `DELETE /roles/:id` |
| Grupos | `GET/POST /groups`, `PUT /groups/:id`, `DELETE /groups/:id`, `PUT /groups/:id/leaders`, `PUT /groups/:id/members` |
| Equipe | `GET /team/status`, `GET /team/history` |
