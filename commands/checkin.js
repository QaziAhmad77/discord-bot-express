const { SlashCommandBuilder } = require('discord.js');
const Attendance = require('../models/Attendance');

// Helper function to get date string in YYYY-MM-DD format
function getDateString(date = new Date()) {
  return date.toISOString().split('T')[0];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkin')
    .setDescription('Check in and mark your attendance'),
  async execute(interaction) {
    await interaction.deferReply();

    const userId = interaction.user.id;
    const username = interaction.user.username;
    const today = getDateString();
    const now = new Date();

    try {
      // Check if user already checked in today
      const existingRecord = await Attendance.findOne({
        userId,
        date: today,
      });

      if (existingRecord) {
        await interaction.editReply({
          content: `✅ You're already checked in today!\n**Check-in Time:** ${existingRecord.checkIn.toLocaleString()}\n**Status:** ${existingRecord.checkOut ? 'Checked out' : 'Still checked in'}`,
        });
        return;
      }

      // Create new check-in record
      const attendance = new Attendance({
        userId,
        username,
        date: today,
        checkIn: now,
        status: 'checked-in',
      });

      await attendance.save();

      await interaction.editReply({
        content: `✅ Checked in successfully!\n**Time:** ${now.toLocaleString()}\n**Date:** ${today}\n\nUse \`/checkout\` when you're leaving.`,
      });
    } catch (error) {
      console.error('Error checking in:', error);
      await interaction.editReply({
        content: '❌ An error occurred while checking in. Please try again later.',
      });
    }
  },
};

