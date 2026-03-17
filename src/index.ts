import 'dotenv/config'
import fs from 'node:fs'
import { Client, Events, GatewayIntentBits } from 'discord.js'
import type { ChatInputCommandInteraction } from 'discord.js'

/*
  Estrutura esperada no commands.json.
*/
type CommandJson = {
    name: string
    description: string
    response: string
}

/*
  Validação do token.
*/
const DISCORD_TOKEN = process.env.DISCORD_TOKEN

if (!DISCORD_TOKEN) {
    throw new Error('DISCORD_TOKEN não definido no .env')
}

/*
  Carrega o JSON uma vez na inicialização.
*/
const rawJson = fs.readFileSync('./commands.json', 'utf-8')
const commandsJson = JSON.parse(rawJson) as CommandJson[]

if (!Array.isArray(commandsJson)) {
    throw new Error('commands.json inválido: o conteúdo deve ser um array')
}

for (const cmd of commandsJson) {
    if (!cmd.name || !cmd.description || !cmd.response) {
        throw new Error(
            'commands.json inválido: todo comando precisa ter name, description e response'
        )
    }
}

/*
  Evita conflito com o comando help separado.
*/
if (commandsJson.some((cmd) => cmd.name === 'help')) {
    throw new Error(
        'commands.json inválido: o comando "help" é reservado e deve ser tratado separadamente'
    )
}

/*
  Mapa para buscar o comando pelo nome rapidamente.
*/
const commandsMap = new Map<string, CommandJson>()

for (const cmd of commandsJson) {
    commandsMap.set(cmd.name, cmd)
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
})

client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`)
})

client.on(Events.InteractionCreate, async (interaction) => {
    /*
      Ignora tudo que não for slash command.
    */
    if (!interaction.isChatInputCommand()) return

    await handleSlashCommand(interaction)
})

async function handleSlashCommand(
    interaction: ChatInputCommandInteraction
): Promise<void> {
    console.log({
        type: 'SLASH_COMMAND',
        command: interaction.commandName,
        user: interaction.user.tag,
        userId: interaction.user.id,
        guild: interaction.guild?.name,
        guildId: interaction.guildId,
        channelId: interaction.channelId,
        timestamp: new Date().toISOString(),
    })

    /*
      BLOQUEIO DE CANAL
      Define os canais permitidos via .env
      Ex: ALLOWED_CHANNELS=123,456
    */
    const allowedChannels = (process.env.ALLOWED_CHANNELS ?? '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)

    /*
      Se houver canais definidos e o atual não estiver na lista → bloqueia.
    */
    if (
        allowedChannels.length > 0 &&
        !allowedChannels.includes(interaction.channelId)
    ) {
        await interaction.reply({
            content: 'Este comando só pode ser usado no canal configurado.',
            flags: 64,
        })
        return
    }

    try {
        /*
          Comando /help separado:
          monta a lista com base em todos os comandos do commands.json.
        */
        if (interaction.commandName === 'help') {
            const helpMessage = commandsJson
                .map((cmd) => `/${cmd.name} - ${cmd.description}`)
                .join('\n')

            await interaction.reply({
                content:
                    helpMessage.length > 0
                        ? `Comandos disponíveis:\n\n${helpMessage}`
                        : 'Nenhum comando disponível no momento.',
                flags: 64,
            })
            return
        }

        /*
          Procura o comando dinâmico no JSON.
        */
        const command = commandsMap.get(interaction.commandName)

        /*
          Se não existir, responde para o Discord não ficar pendurado.
        */
        if (!command) {
            await interaction.reply({
                content: 'Comando não encontrado.',
                flags: 64,
            })
            return
        }

        /*
          Resposta dinâmica vinda do JSON.
        */
        await interaction.reply({
            content: command.response,
            flags: 64,
        })
    } catch (error) {
        console.error('Erro ao processar interação:', error)

        /*
          Garante que o Discord sempre receba alguma resposta.
        */
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: 'Ocorreu um erro ao executar o comando.',
                flags: 64,
            })
        } else {
            await interaction.reply({
                content: 'Ocorreu um erro ao executar o comando.',
                flags: 64,
            })
        }
    }
}

client.login(DISCORD_TOKEN)