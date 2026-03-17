# 🤖 Discord Helper Bot

![Node.js](https://img.shields.io/badge/node.js-24%2B-green)
![Bun](https://img.shields.io/badge/bun-supported-black)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)
![Discord.js](https://img.shields.io/badge/discord.js-v14-blueviolet)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

Para criar seu bot no Discord acesse: https://discordjs.guide/legacy/preparations/app-setup

Bot de Discord baseado em **slash commands dinâmicos via JSON**, com suporte a:

- respostas automáticas
- controle de canais permitidos
- fácil manutenção sem mexer no código

---

## 📦 Tecnologias

- Node.js / Bun
- TypeScript
- discord.js v14

---

## 🚀 Instalação

```bash
git clone <repo>
cd <repo>

# usando bun
bun install

# ou npm
npm install

⚙️ Configuração
Crie um .env na raiz:

DISCORD_TOKEN="SEU_TOKEN_DO_BOT"
CLIENT_ID="ID_DA_APPLICATION"
GUILD_ID="ID_DO_SERVIDOR"

# opcional: restringir canais
ALLOWED_CHANNELS="1234567890,9876543210"
```

## 📁 Estrutura
```bash
src/
  index.ts              # bot principal
  deploy-commands.ts    # registra comandos no Discord

commands.json           # comandos dinâmicos
.env                    # variáveis de ambiente
```

## 🧠 Como funciona

Os comandos são definidos no commands.json:
```json
[
  {
    "name": "ping",
    "description": "Teste",
    "response": "Pong!"
  }
]
```
O bot:
1. lê o JSON
2. registra os comandos no Discord
3. responde automaticamente baseado no response

## ▶️ Executar
Rodar: `docker compose up -d`

## 🔒 Restrição por canal

Se definir:
`ALLOWED_CHANNELS="123,456"`

O bot:
só responde nesses canais: **responde erro (ephemeral) nos outros**

Se deixar vazio: **funciona em todos os canais**

## 📝 Respostas longas (formatadas)
Use code block para melhor visual no Discord:
```json
{
  "name": "exemplo",
  "description": "Teste",
  "response": "```txt\nLinha 1\nLinha 2\n```"
}
```

## ⚠️ Limitações
- Discord limita respostas a 2000 caracteres
- comandos não podem ter nomes duplicados
- nomes devem ser:
    - minúsculos
    - sem espaço
    - sem acentos

## 🔐 Segurança
❌ NÃO faça:
- enviar senha via comando
- logar tokens
- salvar credenciais em JSON

✅ Faça:
- usar painel web ou modal
- usar respostas ephemeral (flags: 64)

💡 Boas práticas
- manter comandos no JSON (não no código)
- usar nomes padronizados (qint_*)
- validar JSON antes de subir
- usar .env para configs sensíveis

## 📄 Licença
MIT