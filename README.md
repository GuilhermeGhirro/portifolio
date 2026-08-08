# Portfólio — Guilherme Ghirro

## Estrutura

```
site/
├── index.html                          → o site inteiro (HTML + CSS + JS)
└── assets/
    ├── ghirro.webp                     → sua foto de perfil (troque pela real)
    └── projetos/
        ├── projeto-um/
        │   ├── capa.jpg                → aparece no card da lista de projetos
        │   ├── 1.jpg, 2.jpg, 3.jpg      → aparecem na galeria (modal) do projeto
        ├── projeto-dois/
        │   └── ...
        └── projeto-tres/
            └── ...
```

Todas as imagens acima são placeholders gerados automaticamente — é só
substituir pelo arquivo real com o **mesmo nome** (ou trocar o nome e
atualizar o caminho no `index.html`).

## Como adicionar um projeto novo

1. Crie uma pasta em `assets/projetos/nome-do-projeto/`.
2. Coloque lá dentro `capa.jpg` + quantas fotos quiser (`1.jpg`, `2.jpg`...).
3. Abra `index.html`, procure pelo array `const projects = [...]` e
   copie um dos blocos existentes, ajustando `slug`, `title`, `summary`,
   `tags`, `cover`, `description` e `photos`.

## Como publicar

Veja o passo a passo de GitHub Pages — resumindo:

1. Crie um repositório no GitHub e suba o conteúdo desta pasta (mantendo
   a estrutura de `assets/`).
2. Settings → Pages → Source → branch `main`, pasta `/ (root)`.
3. Pronto — a cada `git push`, o site atualiza sozinho.
