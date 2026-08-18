# Marketplace — Documentação das Telas

Documentação de todas as telas do front-end (`apps/web`): o que cada uma
mostra, que ações permite, quais estados trata e quais rotas da API consome.
Rotas em português, sem `export default` (padrão do projeto — ver
`.claude/skills/ui-page/SKILL.md`).

Duas áreas completamente separadas, cada uma com seu próprio "shell":

- **Loja** (`/`) — pública, para quem compra. Layout: `AppHeader` + conteúdo + `AppFooter`.
- **Painel da empresa** (`/empresa`) — autenticada, para quem vende. Layout: `AdminLayout` (menu lateral).

---

## Loja (cliente)

### Cabeçalho — `AppHeader`

Fixo no topo em todas as páginas da loja (`sticky`). Três partes:

1. **Faixa de valor** — três promessas fixas (frete grátis acima de R$ 199,
   pagamento seguro, envio em 24h).
2. **Barra principal** — logo, busca (`Input.Search`, navega para
   `/buscar?q=...`), botão "Produtos", menu do usuário, ícone do carrinho
   com badge de quantidade.
3. **Menu do usuário**: deslogado mostra botão "Entrar" (abre o
   `AuthModal`); logado mostra nome + dropdown com "Meus pedidos", "Painel
   da empresa" (só se `user.tenantId` existir) e "Sair".

### Modal de login/cadastro — `AuthModal`

Não é uma rota, é um modal global (`useAuthStore.authModalOpen`) que
qualquer tela pode abrir com `openAuthModal(redirectTo?)`. Duas abas:

- **Entrar**: e-mail + senha → `POST /api/auth/login`.
- **Criar conta**: nome + e-mail + senha (mínimo 8 caracteres, letras e
  números) → `POST /api/auth/register`.

Em ambos os casos o carrinho anônimo (cookie `cart_token`) é mesclado no
carrinho da conta pelo back-end — o texto do modal avisa isso. Depois do
sucesso, navega para `redirectTo` se houver (normalmente `/checkout`).
**Regra de UX do projeto**: o visitante nunca vê essa parede navegando ou
montando carrinho — ela só aparece na hora de finalizar a compra.

### Home — `/` (`HomePage`)

- **Hero** (30% estrutura): título, subtítulo e um único CTA coral
  ("Explorar produtos" → `/buscar`).
- **Pílulas de categoria**: até 8 categorias (`GET /api/categories`), rolagem horizontal.
- **Destaques da semana**: `GET /api/products?featured=true&perPage=8`.
- **Bloco de confiança**: três cards fixos (frete, compra protegida, troca).
- **Chegou agora**: `GET /api/products?sort=newest&perPage=8`.

Estado de carregamento: skeleton nos cards de produto. Seções somem
sozinhas se a lista vier vazia (`ProductSection` retorna `null`).

### Busca / catálogo — `/buscar` (`SearchPage`)

Toda a UI é dirigida pela **query string** (`useSearchParams`) — permite
compartilhar o link com os filtros aplicados:

| Parâmetro | Controle | Efeito |
|---|---|---|
| `q` | `Input.Search` | busca por nome/descrição |
| `category` | pílulas | filtra por slug de categoria |
| `sort` | `Select` | relevância · novidades · menor/maior preço · melhor avaliados |
| `inStock` | `Switch` "Só com estoque" | `stock > 0` |
| `featured` | (setado por link externo, ex. home) | só produtos em destaque |
| `page` | `Pagination` | paginação (24 por página) |

Estados: skeleton (8 cards) → grade de `ProductCard` → `Empty` com botão
"Limpar filtros" quando a busca não encontra nada. Trocar filtro sempre
zera a página.

### Página de produto — `/produto/:slug` (`ProductPage`)

- **Galeria**: mídia principal (imagem ou vídeo, `<video controls>`) +
  miniaturas clicáveis quando há mais de uma. Selo de desconto (`-XX%`) no
  canto quando `compareAtPriceCents > priceCents`.
- **Informações**: loja (link para `/buscar?tenant=slug`), nome, nota
  média (`Rate` somente leitura, só aparece se `ratingCount > 0`), descrição
  curta, preço + preço "de" riscado, parcelamento em 12x sem juros
  (calculado no front, só exibição), aviso de estoque (`stockLabel` —
  esgotado / "restam N unidades" quando ≤ 10 / "em estoque").
- **Compra**: seletor de quantidade (`max = stock`) + **"Comprar agora"**
  (coral — adiciona ao carrinho e já leva pro checkout, abrindo o
  `AuthModal` no meio do caminho se não estiver logado) + "Adicionar ao
  carrinho" (neutro, só adiciona).
- **Descrição completa** e **"Quem viu este, viu também"**
  (`GET /api/products/:slug/related`), usando `ProductCard` compacto.

Estados: skeleton → conteúdo → `Result status="404"` se o produto não
existir ou tiver saído do ar.

### Carrinho (gaveta) — `CartDrawer`

Aberto pelo ícone do carrinho no header ou por qualquer `openDrawer()`.
Lista os itens com miniatura, preço unitário congelado, controle de
quantidade e remoção; mostra a `ShippingProgress` (barra de frete grátis)
quando aplicável; resumo (subtotal/frete/total) e botão coral "Finalizar
compra" (abre `AuthModal` se deslogado). Estado vazio: `Empty` com botão
"Ver produtos".

### Carrinho (página cheia) — `/carrinho` (`CartPage`)

Mesmo conteúdo da gaveta, em layout de página com resumo fixo
(`position: sticky`) ao lado. Útil quando o cliente chega direto por link
ou quer revisar com mais espaço antes de ir pro checkout.

### Checkout — `/checkout` (`CheckoutPage`)

Fluxo em 3 passos visuais (`Steps`: Carrinho → Entrega e pagamento →
Confirmação), mas uma única tela:

1. **Formulário de endereço**: destinatário, CEP, rua, número,
   complemento, bairro, cidade, UF — valida CEP com regex antes de
   enviar.
2. **Forma de pagamento**: Pix / cartão de crédito / boleto (placeholder —
   ainda sem gateway real, ver `README.md`).
3. **Resumo do pedido** fixo ao lado com os itens, subtotal, frete e total.

Ao confirmar: `POST /api/orders/checkout`. Se o carrinho tiver produtos de
empresas diferentes, o back-end cria **um pedido por empresa** — a tela de
sucesso avisa quando isso acontece. Erros de estoque/produto indisponível
(422) aparecem em `Alert`; 401 (sessão caiu no meio do caminho) reabre o
`AuthModal` em vez de mostrar erro. Se o usuário não estiver logado ao
entrar na tela, o modal abre sozinho. Carrinho vazio ou pedido já
confirmado trocam a tela inteira por um `Result` (nada pra finalizar /
sucesso com número do pedido).

### Meus pedidos — `/pedidos` (`OrdersPage`)

Tabela (`GET /api/orders`) com número, data, quantidade de itens, status
(`Tag` colorida — aguardando pagamento, pago, em separação, enviado,
entregue, cancelado, reembolsado) e total. Exige login: deslogado mostra
`Empty` com botão "Entrar" (abre o modal com redirect de volta pra cá).
Sem pedidos: `Empty` com botão "Ver produtos".

### Página não encontrada — `*` (`NotFoundPage`)

`Result status="404"` com botão para voltar à home. Cobre qualquer rota da
loja que não bateu com nada.

---

## Painel da empresa

Tudo sob `/empresa/*`, num `AdminApp` separado da loja (roteador próprio
dentro do mesmo `<Routes>` raiz). Nenhum botão usa a cor coral — ela é
exclusiva de conversão de compra na loja; aqui toda ação usa
`type="primary"` (índigo) ou neutro.

### Login administrativo — `/empresa/login` (`AdminLoginPage`)

Formulário próprio (não é o `AuthModal` do cliente): e-mail + senha →
mesmo endpoint `POST /api/auth/login`. Se a conta autenticar mas **não**
tiver `tenantId` (ou for `CUSTOMER`), a sessão é desfeita na hora e aparece
o aviso "Esta conta não está vinculada a nenhuma empresa" — não deixa
ninguém "meio logado" no painel. Sucesso → redireciona para `/empresa`.

### Guarda de rota — `RequireTenantAuth`

Não é uma tela, é o portão de tudo que vem depois: enquanto a sessão
carrega mostra um spinner de página inteira; sem usuário, sem `tenantId` ou
com papel `CUSTOMER`, redireciona pra `/empresa/login`. Só então busca os
dados da empresa (`GET /api/tenant/me`) e libera o `AdminLayout`.

### Estrutura do painel — `AdminLayout`

Menu lateral fixo (`Layout.Sider`) com Dashboard, Produtos, Estoque,
Armazéns; cabeçalho com nome da empresa, usuário logado e botão "Sair"
(desloga e limpa o estado da empresa). Todo o conteúdo das telas abaixo
renderiza dentro dele via `<Outlet />`.

### Dashboard — `/empresa` (`AdminDashboardPage`)

KPIs de `GET /api/tenant/dashboard`: produtos cadastrados, produtos
ativos, produtos sem estoque, total de pedidos e receita somada (pedidos
pagos, em separação, enviados ou entregues). É a home natural depois do
login. Skeleton enquanto carrega.

### Produtos (lista) — `/empresa/produtos` (`AdminProductsPage`)

Tabela (`GET /api/tenant/products`) com miniatura, nome, SKU, preço,
estoque agregado (soma de todos os armazéns) e status; busca por nome e
filtro por status (rascunho/ativo/arquivado); clicar na linha abre a
edição. Botão "Novo produto" leva ao formulário em branco. Vazio: `Empty`
com atalho pra cadastrar o primeiro.

### Produtos (cadastro/edição) — `/empresa/produtos/novo` e `/empresa/produtos/:id` (`AdminProductFormPage`)

Um formulário só, dois modos:

- **Campos**: nome (gera o slug automaticamente até o usuário editar o
  slug na mão), slug, SKU, descrição curta (280 caracteres, com contador),
  descrição completa, preço de venda e preço "de" (`InputNumber`
  formatado em R$, convertido para centavos no envio — `toCents`/
  `parseBRLInput`), categorias (multi-seleção, buscadas em
  `GET /api/tenant/categories`), status (rascunho/ativo/arquivado) e
  destaque na vitrine.
- **Criar** (`/novo`): salva só os dados básicos
  (`POST /api/tenant/products`) e navega pra tela de edição — produto
  nasce com **estoque zero**, sem mídia. É de propósito: "todo produto
  precisa de um armazém" (ver seção de Estoque).
- **Editar** (`/:id`): mesmo formulário pré-preenchido
  (`PATCH /api/tenant/products/:id`) + duas seções que só existem aqui:
  - **Fotos e vídeos**: upload múltiplo (`POST .../media`, aceita JPG,
    PNG, WEBP, AVIF, MP4, WEBM, WEBM), miniaturas com botões mover
    esquerda/direita (`PATCH .../media/order`) e excluir
    (`DELETE /api/tenant/media/:id`).
  - **Estoque**: mostra o total atual e aponta pra tela de Estoque pra
    definir o saldo por armazém.

### Armazéns — `/empresa/armazens` (`AdminWarehousesPage`)

CRUD completo: tabela com código, nome, local, saldo total (`X / limite`
quando há `capacityLimit`, senão só `X un.`) e status ativo/inativo.
"Novo armazém" e o ícone de editar abrem o mesmo modal (código, nome,
local, descrição, limite de unidades opcional, ativo). Excluir usa
`Popconfirm`; o back-end recusa (422) apagar armazém com saldo positivo em
qualquer produto — a mensagem de erro da API aparece direto na tela.

### Estoque — `/empresa/estoque` (`AdminStockPage`)

O coração do controle de saldo:

- **Tabela de saldos** (`GET /api/tenant/stock`, filtrável por armazém):
  produto, SKU, armazém, quantidade.
- **"Ajustar saldo"**: modal com produto (busca), armazém e quantidade —
  é um **valor absoluto** ("quanto tem hoje nesse armazém"), não um delta;
  chama `POST /api/tenant/stock/set`. O back-end respeita o limite de
  capacidade do armazém e recalcula o estoque agregado do produto na
  mesma transação.
- **"Etiqueta"**: modal com QR code (gerado no navegador, `qrcode.react`,
  sem precisar de imagem armazenada no servidor) + nome do produto, SKU,
  armazém e saldo, e botão "Imprimir" (`window.print()` com CSS que
  isolar só a etiqueta na impressão).
- Alerta informativo quando ainda não existe armazém ou produto
  cadastrado — desabilita "Ajustar saldo" até ter os dois.

**O que a etiqueta faz e não faz hoje**: ela identifica visualmente o
produto/armazém/saldo pra impressão — não existe (ainda) uma tela de
leitura/scanner que desconta o saldo ao ler o QR. A baixa automática de
estoque acontece na **venda pela loja** (checkout do cliente), que decrementa
o(s) armazém(ns) com mais saldo primeiro e reverte exatamente a origem se o
pedido for cancelado.

---

## Referência rápida de rotas

| Rota | Tela | Autenticação |
|---|---|---|
| `/` | Home | pública |
| `/buscar` | Busca/catálogo | pública |
| `/produto/:slug` | Produto | pública |
| `/carrinho` | Carrinho | pública (login só no checkout) |
| `/checkout` | Checkout | cliente logado |
| `/pedidos` | Meus pedidos | cliente logado |
| `/empresa/login` | Login da empresa | pública |
| `/empresa` | Dashboard | empresa (`tenantId` + papel ≠ `CUSTOMER`) |
| `/empresa/produtos` | Lista de produtos | empresa |
| `/empresa/produtos/novo` | Novo produto | empresa |
| `/empresa/produtos/:id` | Editar produto | empresa |
| `/empresa/armazens` | Armazéns | empresa |
| `/empresa/estoque` | Estoque | empresa |
