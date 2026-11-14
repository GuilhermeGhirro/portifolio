# portfolio.exe — Guilherme Ghirro

Portfólio em 3D: uma mesa dos anos 90 com monitores de tubo, papéis e
objetos retrô. Feito com [Three.js](https://threejs.org) puro — sem build,
sem npm. É só abrir num servidor estático (ou GitHub Pages).

## O que tem na mesa

| Objeto | O que faz |
|---|---|
| Monitor 1 (esquerda, âmbar) | Sobre mim: lema, conquistas, frases e contato |
| Monitor 2 (verde) | Linguagens e ferramentas |
| Monitor 3 (centro, "GhirroOS") | Projetos prontos, com galeria de telas |
| Papéis à direita | Projetos **em andamento** (clique pega o papel na mão) |
| Relógio digital | Mostra a hora real; clique alterna AUTO → DIA → TARDE → NOITE |
| Luminária | Liga/desliga (acende sozinha à noite) |
| Cubo mágico, teclado, caneca, mouse | Detalhes clicáveis 👀 |

O céu da janela, o sol, a luz e a luminária seguem **o horário do computador
de quem está visitando**. O botão ☀ no topo deixa testar dia/tarde/noite.

## Estrutura

```
site/
├── index.html          → página 3D (HTML)
├── classico.html       → seu site antigo (versão sem 3D / fallback)
├── css/style.css       → visual retrô (CRT, papel, janelas, HUD)
├── js/
│   ├── data.js         → ✏️ TODO O CONTEÚDO — edite aqui
│   ├── main.js         → cena 3D, câmera, cliques, dia/noite
│   ├── screens.js      → animação das telas dos monitores
│   ├── textures.js     → texturas desenhadas em canvas (madeira, céu, pôster…)
│   ├── ui.js           → conteúdo HTML dos monitores, papéis e galeria
│   └── audio.js        → sons sintetizados (sem arquivos de áudio)
└── assets/             → sua foto e as imagens dos projetos
```

## Como editar o conteúdo

Tudo fica em **`js/data.js`**:

- `perfil` → nome, cargo, foto, lema, textos, **conquistas**, frases e links de contato. *Troque o e-mail de exemplo!*
- `ferramentas` → grupos e itens do monitor 2.
- `emAndamento` → cada papel da mesa (título, texto, `progresso` 0–100,
  stack, próximos passos e a cor da fita). Até 5 papéis cabem na mesa.
- `projects` → os projetos prontos do monitor 3 (mesmo formato do site antigo:
  `cover`, `description`, `photos` com título/descrição/destaques).

## Rodar localmente

Módulos ES não abrem via `file://`. Na pasta `site/`:

```bash
npx serve .            # ou
python -m http.server  # e abra http://localhost:8000
```

## Publicar

Igual antes: GitHub Pages → Settings → Pages → branch `main`, pasta `/ (root)`.
O Three.js e as fontes vêm de CDN, então não precisa instalar nada.
