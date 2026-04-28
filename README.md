# Rotina do Bebê

Rotina do Bebê é um PWA mobile-first para iPhone criado para ajudar a registrar mamadas, sono, trocas de fralda e lembretes de remédios definidos pela mãe. Todos os dados ficam salvos localmente no aparelho, sem login, backend ou banco de dados externo.

> Este app apenas ajuda a organizar horários. Siga sempre a orientação médica.

## Funcionalidades

- Registrar "Mamou agora", "Dormiu agora" e "Acordou agora".
- Registrar troca de fralda como Xixi, Cocô, Xixi + cocô ou Fralda seca.
- Ver status atual: dormindo ou acordado, com tempo em andamento.
- Configurar nome e data de nascimento do bebê.
- Ver dias de vida, idade em semanas/meses/anos e marcos completos na tela inicial.
- Ver última mamada, última fralda, resumo do dia e histórico recente.
- Criar remédios com múltiplos horários, observação e status ativo/inativo.
- Marcar doses como tomadas ou puladas.
- Ver o próximo lembrete de remédio do dia.
- Receber aviso visual dentro do app quando um lembrete chega.
- Exportar, importar e limpar os dados locais.

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

## Publicação

Você pode publicar o conteúdo gerado em `dist` em serviços como Vercel, Netlify, GitHub Pages ou qualquer hospedagem estática com HTTPS.

Exemplo com GitHub CLI:

```bash
cd ~/Documents/marite
gh repo create marite --private --source=. --remote=origin --push
```

## Limitações dos lembretes e notificações

O app usa lembretes dentro da própria PWA. Quando o horário chega, ele mostra um aviso visual, tenta tocar um som simples quando o navegador permite e envia notificação se a permissão estiver concedida.

No iPhone, notificações de PWA dependem da versão do iOS, das permissões do Safari e do app estar instalado na Tela de Início. Este MVP não promete comportamento igual ao app Relógio do iPhone e não envia notificações com o app totalmente fechado usando backend ou Web Push.

## Aviso médico

Este app não sugere remédios, doses, intervalos, tratamentos ou qualquer orientação médica. Ele apenas organiza nomes e horários inseridos pela mãe.

Este app apenas ajuda a organizar horários. Siga sempre a orientação médica.
