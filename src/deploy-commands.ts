import 'dotenv/config'
import { REST, Routes, SlashCommandBuilder } from 'discord.js'
import fs from 'node:fs'

/*
  Estrutura esperada no commands.json.
*/
type CommandJson = {
    name: string
    description: string
    response: string
}

/*
  Validação das variáveis de ambiente.
*/
const DISCORD_TOKEN = process.env.DISCORD_TOKEN
const CLIENT_ID = process.env.CLIENT_ID
const GUILD_ID = process.env.GUILD_ID

if (!DISCORD_TOKEN) {
    throw new Error('DISCORD_TOKEN não definido no .env')
}

if (!CLIENT_ID) {
    throw new Error('CLIENT_ID não definido no .env')
}

if (!GUILD_ID) {
    throw new Error('GUILD_ID não definido no .env')
}

/*
  Lê e valida o JSON dos comandos.
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
  Converte para o formato aceito pelo Discord.
*/
const commands = commandsJson.map((cmd) =>
    new SlashCommandBuilder()
        .setName(cmd.name)
        .setDescription(cmd.description)
        .toJSON()
)

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN)

async function deployCommands(): Promise<void> {
    try {
        console.log('Registrando comandos...')

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID!, GUILD_ID!),
            { body: commands }
        )

        console.log('Comandos registrados com sucesso.')
    } catch (error) {
        console.error('Erro ao registrar comandos:', error)
    }
}

void deployCommands()