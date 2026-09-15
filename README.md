# Template — Landing page para arena de beach tennis

Base reutilizável para prospectar clientes do nicho de beach tennis / vôlei
de praia / futevôlei. Extraída do site que construímos para a Arena Villa
Verde (branch `client/arena-villa-verde` deste repo guarda aquela build
completa como referência).

Já vem pronto:
- Layout completo (hero, sobre, números animados, serviços, equipe,
  depoimentos opcionais, mapa, contato) — `beach-tennis-template.dc.html`.
- Responsivo de verdade (menu hambúrguer no mobile, cards que empilham,
  card de localização no mesmo padrão do desktop) — testado 320px–1440px.
- Embed real do Google Maps (só trocar a query do endereço).
- Transições suaves ao rolar (`prefers-reduced-motion` respeitado).
- Par tipográfico Archivo (títulos) + Plus Jakarta Sans (corpo).
- `npm run responsive-check` — script Playwright que sobe um server local e
  tira screenshots em vários breakpoints (`.screenshots/`), pra validar
  qualquer ajuste antes de mandar pro cliente.

## Checklist pra customizar por cliente

Tudo que precisa trocar está marcado com `[placeholder]` ou é óbvio pelo
contexto:

1. **Cores** — bloco de `--color-*` no `<div>` logo após `</helmet>`, no
   `beach-tennis-template.dc.html`. É só trocar os hex; o resto do site usa
   `var(--color-*)` em tudo.
2. **Logo** — hoje é um SVG placeholder (círculo + check) inline em 4
   lugares (nav, hero, card de localização, footer). Troque pelo `<img>`
   real do cliente ou suba a arte via `<image-slot>` se preferir manter o
   fluxo de upload.
3. **Nome do clube** — busque por `[Nome do Clube]` / `[NOME DO CLUBE]`.
4. **Endereço** — busque por `[Endereço`, `[Bairro`, `[CEP` e pelo
   `SEU_ENDERECO_AQUI` (aparece 2x: embed do mapa e botão "Pegue a
   localização").
5. **WhatsApp** — busque por `SEUNUMERODEWHATSAPP` (formato
   `55DDNNNNNNNNN`, sem símbolos) e pelo telefone exibido
   `(00) 00000-0000`.
6. **Instagram / Facebook** — busque por `SEU_INSTAGRAM` e `SEU_FACEBOOK`.
7. **Fotos** — todos os `<image-slot>` estão sem `src` (mostram o estado
   vazio "solte uma imagem"); preencha arrastando a foto real do cliente.
8. **Vídeo do hero** — hoje é um gradiente placeholder (procure o
   comentário `<!-- Troque por um <video> ... -->`). Troque pelo `<video>`
   ou `<image-slot>` com a foto/vídeo real da quadra.
9. **Números da seção "em números"** — `statsTargets` no `<script>` no
   final do arquivo.
10. **Textos dos serviços/depoimentos** — genéricos o bastante pra maioria
    dos clubes; ajuste o que não fizer sentido.

Prefixo das classes CSS próprias do layout: `btc-` (Beach Tennis Club) —
genérico de propósito, não é o nome de nenhum cliente.

## Fluxo com `git worktree` pra cada novo prospect

Este repo fica só com o template genérico na branch `main`. Pra cada lead
novo, crie um worktree numa branch própria — assim você edita o cliente
numa pasta separada sem misturar com o template, e pode voltar pro `main`
a qualquer momento pra pegar melhorias que fizer em um cliente e propagar
pros outros (`git cherry-pick`).

```bash
cd ~/Dev/leads/_templates/beach-tennis-landing-page

# cria a pasta do novo cliente a partir do template, numa branch nova
git worktree add ../../semana-X/<data>/previews/<Cliente>/project \
  -b client/<slug-do-cliente> main

cd ../../semana-X/<data>/previews/<Cliente>/project
npm install
npm run responsive-check   # confere que nada quebrou antes de mexer
```

Pra listar/remover worktrees depois:

```bash
git worktree list
git worktree remove ../../semana-X/<data>/previews/<Cliente>/project
```
