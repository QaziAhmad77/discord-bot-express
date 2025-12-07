const { SlashCommandBuilder } = require('discord.js');
const Attendance = require('../models/Attendance');

// Helper function to get date string in YYYY-MM-DD format
function getDateString(date = new Date()) {
  return date.toISOString().split('T')[0];
}

// Helper function to calculate duration between two dates
function calculateDuration(checkIn, checkOut) {
  const diffMs = checkOut - checkIn;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return { hours: diffHours, minutes: diffMinutes };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkout')
    .setDescription('Check out and mark your departure'),
  async execute(interaction) {
    await interaction.deferReply();

    const userId = interaction.user.id;
    const today = getDateString();
    const now = new Date();

    try {
      // Find today's check-in record
      const attendance = await Attendance.findOne({
        userId,
        date: today,
      });

      if (!attendance) {
        await interaction.editReply({
          content: "❌ You haven't checked in today! Use `/checkin` first.",
        });
        return;
      }

      if (attendance.checkOut) {
        await interaction.editReply({
          content: `✅ You've already checked out today!\n**Check-out Time:** ${attendance.checkOut.toLocaleString()}`,
        });
        return;
      }

      // Update check-out time
      attendance.checkOut = now;
      attendance.status = 'present';
      await attendance.save();

      // Calculate duration
      const duration = calculateDuration(attendance.checkIn, now);

      await interaction.editReply({
        content: `✅ Checked out successfully!\n**Check-out Time:** ${now.toLocaleString()}\n**Duration:** ${
          duration.hours
        }h ${duration.minutes}m\n\nThank you for your time today! 🎉`,
      });
    } catch (error) {
      console.error('Error checking out:', error);
      await interaction.editReply({
        content:
          '❌ An error occurred while checking out. Please try again later.',
      });
    }
  },
};
