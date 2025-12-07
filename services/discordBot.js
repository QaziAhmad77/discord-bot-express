require('dotenv').config();
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config/app');

/**
 * Initialize and start Discord bot
 * @returns {Promise<Client>}
 */
const initializeBot = async () => {
  const token = config.discord.token;

  if (!token) {
    throw new Error(
      'No token provided. Please set the TOKEN environment variable.'
    );
  }

  // Create a new client instance
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  // Load commands
  client.commands = new Collection();
  const commandsPath = path.join(__dirname, '../commands');
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      console.log(`✅ Loaded command: ${command.data.name}`);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing "data" or "execute" property.`
      );
    }
  }

  // Ready event
  client.once(Events.ClientReady, (readyClient) => {
    console.log(
      `🤖 Discord bot ready! Logged in as ${readyClient.user.displayName}`
    );
  });

  // Message event (for traditional commands)
  client.on(Events.MessageCreate, (message) => {
    if (message.author.bot) return;

    if (message.content.toLowerCase() === 'hi') {
      message.reply(
        `Hello ${message.author.displayName}! I am ${client.user.displayName}`
      );
    }
  });

  // Slash command handler
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error('Error executing command:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    }
  });

  // Log in to Discord
  await client.login(token);
  return client;
};

module.exports = { initializeBot };
