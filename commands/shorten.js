const { SlashCommandBuilder } = require('discord.js');
const Url = require('../models/Url');
const config = require('../config/app');
const crypto = require('crypto');

// Generate a random short code
function generateShortCode() {
  return crypto.randomBytes(4).toString('base64url').substring(0, 8);
}

// Validate URL format
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shorten')
    .setDescription('Shorten a URL and save it to the database')
    .addStringOption((option) =>
      option
        .setName('url')
        .setDescription('The URL to shorten')
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();

    const originalUrl = interaction.options.getString('url');

    // Validate URL
    if (!isValidUrl(originalUrl)) {
      await interaction.editReply({
        content: '❌ Invalid URL. Please provide a valid HTTP or HTTPS URL.',
      });
      return;
    }

    try {
      // Check if URL already exists
      let urlDoc = await Url.findOne({ originalUrl });

      if (urlDoc) {
        // URL already exists, return existing short URL
        const shortUrl = `${config.baseUrl}/${urlDoc.shortCode}`;
        await interaction.editReply({
          content: `✅ This URL was already shortened!\n**Short URL:** ${shortUrl}\n**Original URL:** ${originalUrl}`,
        });
        return;
      }

      // Generate unique short code
      let shortCode;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      while (!isUnique && attempts < maxAttempts) {
        shortCode = generateShortCode();
        const existing = await Url.findOne({ shortCode });
        if (!existing) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        await interaction.editReply({
          content: '❌ Failed to generate a unique short code. Please try again.',
        });
        return;
      }

      // Create new URL document
      urlDoc = new Url({
        originalUrl,
        shortCode,
      });

      await urlDoc.save();

      const shortUrl = `${config.baseUrl}/${shortCode}`;

      await interaction.editReply({
        content: `✅ URL shortened successfully!\n**Short URL:** ${shortUrl}\n**Original URL:** ${originalUrl}`,
      });
    } catch (error) {
      console.error('Error shortening URL:', error);
      await interaction.editReply({
        content: '❌ An error occurred while shortening the URL. Please try again later.',
      });
    }
  },
};

