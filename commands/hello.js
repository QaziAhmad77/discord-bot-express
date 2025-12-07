const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hello')
    .setDescription('Says hello to a user')
    .addUserOption((option) =>
      option
        .setName('target')
        .setDescription('The user to say hello to')
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser('target');
    await interaction.reply(`Hello, ${user}!`);
  },
};
