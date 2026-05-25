# Rotina do Bebê

Rotina do Bebê é um PWA mobile-first para iPhone criado para registrar a rotina diária de até 3 bebês: mamadas, tempo de peito por lado, sono, fraldas, fórmula e itens de rotina da família. Todos os dados ficam salvos localmente no aparelho, sem login, backend ou banco de dados externo.

> Este app apenas ajuda a organizar horários. Siga sempre a orientação médica.

## Funcionalidades

- Cadastro de 1 a 3 bebês, com nome e data de nascimento.
- Alternância rápida entre bebês na área inferior do app.
- Contador de idade com dias de vida, semanas, meses, anos e mensagens de marco.
- Registro de mamada com horário, quantidade em ml opcional e cronômetro por lado esquerdo/direito.
- Preservação da mamada em andamento ao atualizar ou reabrir a PWA.
- Registro de sono, acordar e trocas de fralda.
- Resumo diário por bebê com mamadas, total ingerido, sono total e fraldas.
- Módulo Rotina com Remédio, Tarefa e Compromisso.
- Repetições: não repetir, todos os dias, dias específicos da semana, semanal e mensal.
- Histórico de rotina global separado dos registros do bebê.
- Controle de latas de fórmula por bebê, com latas ativas, finalizadas e média de duração.
- Exportação, importação e limpeza confirmada dos dados locais.

## Como rodar localmente

```bash
cd ~/Documents/marite
npm install
npm run dev
```

Depois, abra o endereço exibido pelo Vite no navegador.

## Build de produção

```bash
cd ~/Documents/marite
npm run build
```

Para testar o build:

```bash
npm run preview
```

## Como instalar no iPhone como PWA

1. Publique o app em uma URL HTTPS.
2. Abra a URL no Safari do iPhone.
3. Toque no botão de compartilhar.
4. Toque em "Adicionar à Tela de Início".
5. Confirme o nome "Rotina do Bebê".

O app abrirá em tela cheia e terá suporte básico offline depois do primeiro carregamento.

## Como substituir o ícone

Os ícones ficam em `public/icons`.

Substitua os arquivos abaixo mantendo os nomes:

- `public/icons/app-icon.png`
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/icons/apple-touch-icon.png`

Depois rode:

```bash
npm run build
```

## Dados locais

A versão atual usa a chave `rotina-do-bebe:v2` no `localStorage`, com schema versionado. O carregamento é defensivo: se algum trecho estiver ausente ou malformado, o app tenta recuperar uma estrutura segura sem apagar dados válidos durante atualizações normais.

Use "Exportar dados" antes de trocar de aparelho, limpar o navegador ou reinstalar a PWA.

## Publicação

Você pode publicar o conteúdo gerado em `dist` em serviços como Vercel, Netlify, GitHub Pages ou qualquer hospedagem estática com HTTPS.

Exemplo com GitHub CLI:

```bash
cd ~/Documents/marite
gh repo create marite --private --source=. --remote=origin --push
```

## Limitações dos lembretes e notificações

O app usa lembretes dentro da própria PWA. Quando um item de rotina chega ao horário, ele pode mostrar um estado visual no app e enviar notificação se a permissão do navegador estiver concedida.

No iPhone, notificações de PWA dependem da versão do iOS, das permissões do Safari e do app estar instalado na Tela de Início. Este MVP não promete comportamento igual ao app Relógio do iPhone e não envia notificações com o app totalmente fechado usando backend ou Web Push.

## Aviso médico

Este app não sugere remédios, doses, intervalos, tratamentos ou qualquer orientação médica. Ele apenas organiza nomes e horários inseridos pela família.

Este app apenas ajuda a organizar horários. Siga sempre a orientação médica.
