// =====================================================================
//  DADOS DO PORTFÓLIO — edite tudo por aqui, sem mexer no 3D.
// =====================================================================

export const perfil = {
  nome: "Guilherme Ghirro",
  cargo: "Desenvolvedor Full-stack",
  foto: "assets/ghirro.webp",
  lema: "Código bem construído também pode ter textura, ritmo e personalidade.",
  sobre: [
    "Transformo ideias em experiências web expressivas — com código organizado e interfaces que têm presença.",
    "Entendo o problema, desenho a arquitetura, construo o back-end e o front-end, testo e acompanho até rodar em produção — assumindo a solução como um todo, não só a parte que me cabe.",
    "Fora do código eu escrevo, desenho mundos e crio jogos. Esse site é um pedaço da minha mesa.",
  ],
  frases: [
    "O esforço sempre vence o talento.",
    "Buscando sempre o conhecimento e aprimoramento, se adaptando ao estilo de trabalho.",
  ],
  conquistas: [
    { quando: "2026", texto: "TaskFlow — gerenciador de tarefas multi-empresa, do banco ao front" },
    { quando: "2026", texto: "Marketplace mobile (React Native) com API própria em Node + Prisma" },
    { quando: "2026", texto: "Marketplace web multiempresa com estoque por armazém e QR code" },
    { quando: "—",    texto: "Escrevi o livro \"Alguns Passos Longe da Verdade\"" },
  ],
  contatos: [
    { rotulo: "GitHub",   url: "https://github.com/GuilhermeGhirro" },
    { rotulo: "LinkedIn", url: "https://linkedin.com/in/guilherme-ghirro-4bb90630b" },
    { rotulo: "E-mail",   url: "mailto:seuemail@exemplo.com" },
  ],
};

// Monitor 2 — linguagens e ferramentas
export const ferramentas = [
  { grupo: "Linguagens",      itens: ["TypeScript", "JavaScript", "Python", "PHP", "Lua (Roblox)", "C# (Unity)", "SQL"] },
  { grupo: "Front-end",       itens: ["React", "React Native / Expo", "CSS", "Three.js"] },
  { grupo: "Back-end",        itens: ["Node.js", "NestJS", "Express", "Prisma", "APIs REST"] },
  { grupo: "Dados & infra",   itens: ["PostgreSQL", "Docker", "Git & GitHub"] },
  { grupo: "Qualidade",       itens: ["Jest", "Vitest", "Testes front + back"] },
  { grupo: "Criação & jogos", itens: ["Unity", "Roblox Studio", "Claude Code", "LLMs / IA"] },
];

// Mude para true quando quiser liberar a visualização dos projetos em andamento.
// Enquanto for false, os papéis ficam na mesa só como decoração (sem conteúdo e sem abrir).
export const emAndamentoLiberado = false;

// Papéis na mesa — projetos EM ANDAMENTO
// progresso: 0 a 100 (é uma estimativa — ajuste à vontade)
export const emAndamento = [
  {
    id: "erp",
    titulo: "ERP para Postos",
    subtitulo: "Sistema multi-tenant para postos de combustível",
    progresso: 20,
    texto: "Um ERP completo, construído aos poucos: multi-empresa, login, usuários e permissões, cadastro de produtos, baixa de estoque, integração com bombas e emissão de NF-e. Tabelas com uuid e exclusão lógica para rastrear o produto até o estoque.",
    stack: ["TypeScript", "NestJS", "React", "PostgreSQL", "Docker", "Vitest"],
    proximos: ["Arquitetura de tabelas", "Integração com as bombas", "Emissão de NF-e", "IA com LLM integrada"],
    cor: "#c0392b",
  },
  {
    id: "fabrica",
    titulo: "Fábrica de Conteúdo IA",
    subtitulo: "Pipeline automático de vídeos",
    progresso: 15,
    texto: "IA que garimpa tendências no TikTok e YouTube, escreve roteiros, avalia os próprios roteiros, gera os vídeos e publica no Instagram, X, TikTok e YouTube. Organizado em IDEIA → RFC → ADR → IMP.",
    stack: ["Python", "TypeScript", "NestJS", "PostgreSQL", "Docker", "LLMs"],
    proximos: ["Criar as tools dos agentes", "Avaliador de roteiros", "Publicação multi-rede"],
    cor: "#2c6fbb",
  },
  {
    id: "magia",
    titulo: "Desenhe sua Magia",
    subtitulo: "Jogo no Roblox Studio",
    progresso: 35,
    texto: "Você desenha a magia e ela vira poder. Slots de magia de 1 a 5, configurações e muito caos. A meta é deixar tudo fluido e engraçado para publicar.",
    stack: ["Roblox Studio", "Lua", "Rojo", "VS Code", "Claude Code"],
    proximos: ["Organizar scripts em arquivos", "Polir o game feel", "Publicar"],
    cor: "#8e44ad",
  },
  {
    id: "ultima-aula",
    titulo: "A Última Aula",
    subtitulo: "Jogo 2.5D pixel art — Hollow Creek",
    progresso: 10,
    texto: "Adaptação em jogo do meu livro \"Alguns Passos Longe da Verdade\", ambientado na cidade fictícia de Hollow Creek. Isométrico, pixel art, escola e ruas da cidade.",
    stack: ["Unity", "C#", "Pixel art", "Tilesets próprios"],
    proximos: ["Tilesets da escola", "Área urbana", "Primeiro capítulo jogável"],
    cor: "#27ae60",
  },
  {
    id: "cinema",
    titulo: "Cinema 3D",
    subtitulo: "Venda de ingressos multi-tenant",
    progresso: 5,
    texto: "Site de cinema com visual 3D: a empresa cadastra salas, filmes e sessões; o cliente escolhe o assento numa sala 3D e compra pelo celular. Começando por um protótipo com pagamento simulado.",
    stack: ["React", "Three.js", "NestJS", "PostgreSQL"],
    proximos: ["Protótipo da sala 3D", "Fluxo de compra", "Painel da empresa"],
    cor: "#d35400",
  },
];

// Monitor 3 — projetos prontos (vieram do site antigo)
export const projects = [
      {
        slug: "projeto-um",
        title: "TaskFlow — Gerenciador de Tarefas",
        summary: "Sistema multi-empresa de tarefas, projetos e equipes, com controle de acesso por perfil, papel e grupo.",
        tags: ["React", "NestJS", "PostgreSQL", "Multi-tenant"],
        cover: "assets/projetos/projeto-um/home.png",
        description: "TaskFlow é um gerenciador de tarefas multi-tenant: cada empresa enxerga só os próprios dados, com login por empresa + e-mail + senha, perfis de acesso (USER/ADMIN), papéis (roles) configuráveis por tela e grupos com líderes e membros. Clique em qualquer imagem abaixo para ver a tela em detalhe.",
        photos: [
          {
            src: "assets/projetos/projeto-um/home.png",
            title: "Home (painel inicial)",
            description: "Tela inicial da aplicação, com saudação personalizada e um campo rápido “O que você vai fazer hoje?” que cria automaticamente uma tarefa de 1 hora para o dia. Quatro cartões de estatística — Total de tarefas, Em andamento, Atrasadas e Finalizadas — são calculados a partir das tarefas do usuário logado.",
            highlights: ["Criação rápida de tarefa em um clique", "Estatísticas calculadas em tempo real", "Aba fixa — nunca pode ser fechada"],
          },
          {
            src: "assets/projetos/projeto-um/tarefas.png",
            title: "Tarefas",
            description: "Listagem de tarefas em cartões, mostrando número, nome, descrição, projeto vinculado, horas previstas e o intervalo de datas. Cada status (Aguardando, Em andamento, Pausado, Finalizado, Cancelado) tem uma cor própria, e tarefas com prazo vencido e não finalizadas ganham a etiqueta extra “Atrasada”.",
            highlights: ["Ações por cartão: iniciar, pausar, editar, cancelar, escalonar e excluir", "Transições de status validadas no backend", "Dados isolados por empresa"],
          },
          {
            src: "assets/projetos/projeto-um/nova_tarefa.png",
            title: "Nova Tarefa",
            description: "Modal de criação de tarefa com nome, descrição, horas previstas, data de início e fim, status inicial e projeto opcional. As transições seguintes (iniciar, pausar, cancelar, escalonar) acontecem só pelas ações do cartão, nunca por edição direta do status.",
            highlights: [],
          },
          {
            src: "assets/projetos/projeto-um/cadastro_usuarios.png",
            title: "Usuários",
            description: "Tabela de usuários da empresa com foto, ID, nome, e-mail e perfil de acesso — etiqueta dourada para ADMIN e azul para USER. Cada empresa só vê e gerencia os próprios usuários, respeitando o limite máximo configurado (max_users).",
            highlights: [],
          },
          {
            src: "assets/projetos/projeto-um/adicionar_usuario.png",
            title: "Adicionar Usuário",
            description: "Modal de cadastro com nome, e-mail, senha, perfil de acesso (USER/ADMIN) e foto opcional. Se nenhuma senha for informada, o sistema usa a senha padrão da empresa ou “123456” como reserva.",
            highlights: [],
          },
          {
            src: "assets/projetos/projeto-um/cadastrar_projetos.png",
            title: "Projetos — Cadastro",
            description: "Formulário completo de criação de projeto: título, descrição, horas previstas, cliente, referência CRM, complexidade, prioridade, status, responsáveis (seleção múltipla de usuários) e listas dinâmicas de riscos e ganhos.",
            highlights: [],
          },
          {
            src: "assets/projetos/projeto-um/listagem_projetos.png",
            title: "Projetos — Listagem",
            description: "Tabela de projetos com título, cliente, complexidade, prioridade, status, horas previstas e responsáveis. Complexidade e prioridade usam cores para indicar nível de atenção; cada linha pode ser editada (reabre o formulário do cadastro, pré-preenchido) ou excluída.",
            highlights: [],
          },
          {
            src: "assets/projetos/projeto-um/perfis_de_acesso.png",
            title: "Perfis de Acesso (Roles)",
            description: "Gestão de papéis (roles) por empresa, visível para ADMIN, GESTOR ou usuários com acesso liberado. Cada role define quais telas configuráveis ele pode ver; o role de sistema GESTOR vem com acesso total e não pode ser renomeado nem excluído.",
            highlights: [],
          },
          {
            src: "assets/projetos/projeto-um/setores.png",
            title: "Grupos",
            description: "Gestão de grupos da empresa, com nome, quantidade de líderes e de membros. Líderes de grupo enxergam, no Painel da Equipe e em Apontamentos, apenas os membros dos grupos que lideram — o mecanismo usado para dar visibilidade de equipe sem acesso total à empresa.",
            highlights: [],
          },
          {
            src: "assets/projetos/projeto-um/lideres_setor.png",
            title: "Grupos — Gerenciar Líderes",
            description: "Modal com todos os usuários da empresa e um interruptor para incluir ou remover cada um como líder do grupo. Salvar substitui a lista completa de líderes.",
            highlights: [],
          },
          {
            src: "assets/projetos/projeto-um/memros_setor.png",
            title: "Grupos — Gerenciar Membros",
            description: "Mesmo princípio da tela de líderes, aplicado aos membros: um interruptor por usuário da empresa, com a lista completa sendo substituída ao salvar.",
            highlights: [],
          },
          {
            src: "assets/projetos/projeto-um/cadastro_empresas.png",
            title: "Empresas",
            description: "Visível apenas para usuários logados na empresa Master. Lista código, nome, se é a empresa Master, limite máximo de usuários (ou “sem limite”) e ações — “gerenciar acesso” aparece só para empresas que não são a Master.",
            highlights: [],
          },
          {
            src: "assets/projetos/projeto-um/nova_empresa.png",
            title: "Nova/Editar Empresa",
            description: "Modal com código único usado no login, nome, máximo de usuários opcional e senha padrão opcional — usada para novos usuários dessa empresa quando nenhuma senha é informada no cadastro.",
            highlights: [],
          },
          {
            src: "assets/projetos/projeto-um/acesso_a_empresa.png",
            title: "Empresas — Gerenciar Acesso",
            description: "Lista todos os usuários do sistema com um interruptor para conceder ou revogar acesso individual à empresa selecionada — é o que permite a um usuário da empresa Master entrar em outra empresa digitando o código dela no login.",
            highlights: [],
          },
          {
            src: "assets/projetos/projeto-um/configuracoes.png",
            title: "Configurações",
            description: "Acessada só pelo Menu do Usuário, reúne o interruptor de tema claro/escuro e o seletor de idioma (pt-BR/en-US). Não faz nenhuma chamada à API — trabalha só com o contexto de tema salvo no navegador.",
            highlights: [],
          },
          {
            src: "assets/projetos/projeto-um/configuracao_em_ingles.png",
            title: "Tema e idioma em inglês",
            description: "A mesma tela de configurações com o idioma trocado para en-US, mostrando a tradução completa da interface. Tema e idioma ficam sincronizados entre o Menu do Usuário e a tela de Configurações, e a escolha é salva no localStorage para persistir entre sessões.",
            highlights: [],
          },
        ],
      },
      {
        slug: "projeto-dois",
        title: "Marketplace — App de Compra e Venda",
        summary: "App mobile de marketplace com contas de cliente e de empresa: empresas anunciam produtos e clientes compram e avaliam. Em desenvolvimento.",
        tags: ["React Native", "Node.js · Prisma", "PostgreSQL", "Em desenvolvimento"],
        cover: "assets/projetos/projeto-dois/home.jpg",
        description: "Marketplace mobile feito em React Native (Expo), com API própria em Node.js, Express e Prisma sobre PostgreSQL, e autenticação por e-mail/senha com token JWT. No cadastro, a conta escolhe entre Cliente ou Empresa — um papel fixo, definido na criação, que decide quais telas e ações ficam disponíveis dali em diante. Empresas cadastram produtos com fotos, vídeos, descrição, preço, estoque e categoria; clientes navegam pela vitrine, pesquisam em tempo real, compram pelo carrinho e avaliam os produtos com nota e comentário, podendo curtir as avaliações de outros clientes. A empresa acompanha tudo em um dashboard com filtro de período, ranking de mais vendidos e comentários mais curtidos. Projeto ainda em desenvolvimento — algumas telas usam dados de teste. Clique em qualquer imagem abaixo para ver a tela em detalhe.",
        photos: [
          {
            src: "assets/projetos/projeto-dois/home.jpg",
            title: "Loja (Home)",
            description: "Vitrine principal do marketplace, onde o cliente descobre e pesquisa produtos de todas as empresas cadastradas no app. A busca filtra a grade em tempo real conforme o cliente digita, sem precisar confirmar a pesquisa, e a lista pode ser atualizada com um gesto de puxar para atualizar.",
            highlights: ["Busca em tempo real", "Puxar para atualizar a lista", "Contador de itens no carrinho"],
          },
          {
            src: "assets/projetos/projeto-dois/home_busca.jpg",
            title: "Loja — busca em ação",
            description: "Mesma tela em um momento anterior do desenvolvimento, com o termo \"Teste\" já digitado no campo de busca: a grade é filtrada na hora, sem precisar confirmar a pesquisa.",
            highlights: [],
          },
          {
            src: "assets/projetos/projeto-dois/detalhe_produto.jpg",
            title: "Detalhe do Produto",
            description: "A página de vendas do produto: carrossel de fotos e vídeos, título, preço, nota média em estrelas, empresa vendedora, categoria e estoque disponível, além de um carrossel de \"produtos parecidos\". Na seção de avaliações, o cliente pode curtir os comentários de outros compradores e deixar sua própria nota e comentário.",
            highlights: ["Curtir avaliações de outros clientes", "Carrossel de produtos parecidos", "Botão vira \"Sem estoque\" quando o estoque zera", "Só é possível avaliar produto já comprado"],
          },
          {
            src: "assets/projetos/projeto-dois/carrinho.jpg",
            title: "Carrinho",
            description: "Confere os itens antes de fechar a compra, com controle de quantidade (+/-) por item e total recalculado automaticamente. Ao finalizar, o app cria o pedido para a empresa vendedora, esvazia o carrinho e confirma com uma mensagem de sucesso.",
            highlights: ["Remoção individual de itens", "Cria o pedido e limpa o carrinho ao finalizar"],
          },
          {
            src: "assets/projetos/projeto-dois/perfil_cliente.jpg",
            title: "Perfil — Cliente",
            description: "Área do usuário cliente, com foto de perfil editável — escolhida na galeria do celular, com recorte quadrado —, nome, e-mail e o selo \"Cliente\". Dá acesso às configurações da conta e à opção de sair.",
            highlights: [],
          },
          {
            src: "assets/projetos/projeto-dois/dashboard_vendas.jpg",
            title: "Dashboard — Vendas",
            description: "Painel de desempenho da empresa, a primeira tela ao entrar. O seletor de período (15 dias, 30 dias, 1 ano) recalcula na hora faturamento, número de pedidos, itens vendidos e avaliação média, além do ranking de produtos mais vendidos e dos comentários mais curtidos pelos clientes.",
            highlights: ["Indicadores recalculados por período", "Ranking de produtos mais vendidos", "Comentários mais curtidos"],
          },
          {
            src: "assets/projetos/projeto-dois/meus_anuncios.jpg",
            title: "Meus Anúncios",
            description: "Gerenciamento central do catálogo da empresa: lista os produtos cadastrados com foto, preço e estoque. Tocar em um produto abre a edição; excluir pede confirmação antes de remover o anúncio.",
            highlights: ["Toque no produto abre a edição", "Confirmação antes de excluir"],
          },
          {
            src: "assets/projetos/projeto-dois/perfil_empresa.jpg",
            title: "Perfil — Empresa",
            description: "Mesma estrutura do perfil de cliente, mas com o selo \"Empresa\" e o nome da loja. A foto de perfil pode ser trocada tanto por contas de empresa quanto por contas de cliente.",
            highlights: [],
          },
          {
            src: "assets/projetos/projeto-dois/configuracoes.jpg",
            title: "Configurações",
            description: "Bloco \"Conta\" com nome, e-mail e tipo de conta (somente leitura), bloco \"Preferências\" com o interruptor de notificações e o botão para sair da conta.",
            highlights: [],
          },
          {
            src: "assets/projetos/projeto-dois/novo_produto.jpg",
            title: "Novo Produto",
            description: "Formulário de cadastro (e edição) de produto, com título, descrição, preço e estoque. Título, descrição, preço e categoria são obrigatórios para salvar.",
            highlights: [],
          },
          {
            src: "assets/projetos/projeto-dois/novo_produto_categoria.jpg",
            title: "Novo Produto — Categoria e Mídia",
            description: "Seleção da categoria em chips (Alimentação, Eletrônicos, Moda e Vestuário, Veículos, entre outras) e botão para criar ou salvar o produto. O envio de fotos e vídeos — até 8 arquivos por vez, com opção de remover cada mídia depois — só é liberado depois que o produto já existe salvo.",
            highlights: ["Categorias em chips", "Até 8 arquivos de mídia por envio", "Mídia liberada só após salvar o produto"],
          },
        ],
      },
      {
        slug: "projeto-tres",
        title: "Marketplace — Loja e Painel Multiempresa",
        summary: "Marketplace web com loja pública para clientes e painel próprio para cada empresa vender, controlar estoque e armazéns.",
        tags: ["React", "Node.js", "Multi-tenant", "Estoque"],
        cover: "assets/projetos/projeto-tres/cliente_inicial.png",
        description: "Marketplace web dividido em duas áreas completamente separadas, cada uma com seu próprio layout: a Loja, pública, onde o cliente navega, pesquisa, compra e acompanha pedidos; e o Painel da empresa, autenticado, onde cada empresa cadastra produtos, sobe fotos e vídeos, e controla o estoque por armazém. O carrinho funciona mesmo sem login — a conta só é exigida na hora de fechar a compra, e o carrinho anônimo é mesclado ao da conta no momento do login ou cadastro. Se o carrinho tiver produtos de empresas diferentes, o sistema divide automaticamente em um pedido por empresa. No painel, cada produto nasce sem estoque — o saldo é definido por armazém na tela de Estoque, que também gera etiquetas com QR code para impressão. A baixa de estoque na venda decrementa primeiro os armazéns com mais saldo, e reverte a origem exata se o pedido for cancelado. Clique em qualquer imagem abaixo para ver a tela em detalhe.",
        photos: [
          {
            src: "assets/projetos/projeto-tres/cliente_inicial.png",
            title: "Loja — Home",
            description: "Página inicial da loja: hero com chamada única para explorar produtos, pílulas de categoria, destaques da semana e chegados recentes. Cada seção some sozinha se a lista vier vazia da API.",
            highlights: ["Categorias em pílulas roláveis", "Seções somem quando não há produtos", "Skeleton de carregamento nos cards"],
          },
          {
            src: "assets/projetos/projeto-tres/destaques.png",
            title: "Loja — Destaques da semana",
            description: "Vitrine de produtos marcados como destaque pela empresa vendedora, exibida na home para dar visibilidade extra a itens escolhidos.",
            highlights: [],
          },
          {
            src: "assets/projetos/projeto-tres/chegou_agora.png",
            title: "Loja — Chegou agora",
            description: "Seção com os produtos cadastrados mais recentemente em todo o marketplace, ordenados por data de criação.",
            highlights: [],
          },
          {
            src: "assets/projetos/projeto-tres/todos_os_produtos_cliente.png",
            title: "Busca e catálogo",
            description: "Catálogo completo, com toda a interface dirigida pela URL: busca por texto, categoria, ordenação (relevância, novidades, preço, avaliação), filtro \"só com estoque\" e paginação — o link pode ser compartilhado já com os filtros aplicados.",
            highlights: ["Filtros refletidos na URL", "Botão \"Limpar filtros\" quando a busca não encontra nada", "Trocar filtro sempre volta para a página 1"],
          },
          {
            src: "assets/projetos/projeto-tres/compra.png",
            title: "Página de produto",
            description: "Galeria de fotos e vídeos, nota média, preço com desconto riscado, parcelamento em até 12x, aviso de estoque (\"restam N unidades\" quando está baixo) e produtos relacionados. \"Comprar agora\" já leva direto pro checkout, pedindo login no meio do caminho se necessário.",
            highlights: ["\"Comprar agora\" vs. \"Adicionar ao carrinho\"", "Selo de desconto automático", "Aviso de estoque baixo"],
          },
          {
            src: "assets/projetos/projeto-tres/carrinho.png",
            title: "Carrinho",
            description: "Itens com preço unitário congelado, controle de quantidade, barra de progresso para frete grátis e resumo com subtotal, frete e total. Funciona sem login — a conta só é pedida ao finalizar a compra.",
            highlights: ["Preço unitário congelado no carrinho", "Barra de progresso de frete grátis"],
          },
          {
            src: "assets/projetos/projeto-tres/pedido_confirmado.png",
            title: "Checkout — Pedido confirmado",
            description: "Tela de sucesso ao final do checkout, com o número do pedido. Quando o carrinho tinha produtos de empresas diferentes, o sistema avisa que foi dividido em um pedido por empresa.",
            highlights: ["Um pedido por empresa quando o carrinho é misto", "Erros de estoque tratados sem perder o preenchimento"],
          },
          {
            src: "assets/projetos/projeto-tres/meus_pedidos_cliente.png",
            title: "Meus pedidos",
            description: "Histórico de pedidos do cliente logado, com número, data, quantidade de itens, status colorido (aguardando pagamento, pago, em separação, enviado, entregue, cancelado, reembolsado) e total.",
            highlights: [],
          },
          {
            src: "assets/projetos/projeto-tres/dashboard_empresa.png",
            title: "Painel da empresa — Dashboard",
            description: "Primeira tela ao entrar no painel: produtos cadastrados, produtos ativos, produtos sem estoque, total de pedidos e receita somada a partir dos pedidos pagos, em separação, enviados ou entregues.",
            highlights: [],
          },
          {
            src: "assets/projetos/projeto-tres/produtos_empresa.png",
            title: "Painel da empresa — Produtos",
            description: "Lista de produtos da empresa com miniatura, nome, SKU, preço, estoque agregado de todos os armazéns e status (rascunho, ativo, arquivado), com busca por nome e filtro por status.",
            highlights: [],
          },
          {
            src: "assets/projetos/projeto-tres/cadastro_produto_empresa.png",
            title: "Painel da empresa — Cadastro de produto",
            description: "Formulário de produto com geração automática de slug a partir do nome, SKU, descrições curta e completa, preço com preço \"de\" riscado, categorias e destaque na vitrine. O produto nasce com estoque zero — o saldo é definido depois, por armazém, na tela de Estoque.",
            highlights: ["Slug gerado automaticamente do nome", "Upload de fotos e vídeos liberado após salvar", "Produto nasce sem estoque, por design"],
          },
          {
            src: "assets/projetos/projeto-tres/armazens.png",
            title: "Painel da empresa — Armazéns",
            description: "Cadastro dos armazéns da empresa, com código, nome, local, saldo total (com limite de capacidade quando definido) e status ativo/inativo. Excluir um armazém com saldo positivo é bloqueado pelo back-end.",
            highlights: [],
          },
          {
            src: "assets/projetos/projeto-tres/novo_armazem.png",
            title: "Painel da empresa — Novo armazém",
            description: "Modal de cadastro e edição de armazém: código, nome, local, descrição e limite opcional de unidades.",
            highlights: [],
          },
          {
            src: "assets/projetos/projeto-tres/estoque.png",
            title: "Painel da empresa — Estoque",
            description: "Tabela de saldos por produto e armazém, filtrável por armazém, com opções para ajustar saldo e gerar etiqueta com QR code para impressão.",
            highlights: ["QR code gerado no navegador, sem imagem no servidor", "Impressão isola só a etiqueta na página"],
          },
          {
            src: "assets/projetos/projeto-tres/adicionar_saldo_produto.png",
            title: "Painel da empresa — Ajustar saldo",
            description: "Modal para definir o saldo de um produto em um armazém — é sempre um valor absoluto (\"quanto tem hoje\"), não um ajuste incremental. O back-end respeita o limite de capacidade do armazém e recalcula o estoque agregado do produto na mesma transação.",
            highlights: ["Saldo definido como valor absoluto, não delta", "Respeita o limite de capacidade do armazém"],
          },
        ],
      },
    ];
