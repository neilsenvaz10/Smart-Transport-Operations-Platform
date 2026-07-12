import cron from 'node-cron';
import prisma from '../lib/prisma';
import { DriverStatus } from '@prisma/client';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_default_key');
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

export function startLicenseReminderCron() {
  // Run daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily driver license expiry checks...');
    try {
      const drivers = await prisma.driver.findMany({
        where: {
          status: {
            not: DriverStatus.suspended
          }
        },
        include: {
          user: true
        }
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const driver of drivers) {
        const expiryDate = new Date(driver.licenseExpiry);
        expiryDate.setHours(0, 0, 0, 0);
        
        const timeDiff = expiryDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

        // 1. Expired logic
        if (daysRemaining <= 0) {
          // Suspend driver
          await prisma.driver.update({
            where: { id: driver.id },
            data: { status: DriverStatus.suspended }
          });
          console.log(`Driver ${driver.name} suspended due to expired license.`);
          continue;
        }

        // 2. Reminder logic (30, 15, 7)
        if ([30, 15, 7].includes(daysRemaining)) {
          // Find fleet managers to notify
          const managers = await prisma.user.findMany({
            where: { role: 'fleet_manager' }
          });

          for (const manager of managers) {
            await resend.emails.send({
              from: `TransitOps <${FROM_EMAIL}>`,
              to: manager.email,
              subject: 'Driver License Expiry Alert',
              html: `
                <p>Hello ${manager.name},</p>
                <p>Driver <strong>${driver.name}</strong>'s license will expire in <strong>${daysRemaining} days</strong> (on ${expiryDate.toLocaleDateString()}).</p>
                <p>Please renew the license before assigning future trips.</p>
                <p>Regards,<br>TransitOps Team</p>
              `
            }).catch(e => console.error('Error sending reminder email:', e));
          }
        }
      }
    } catch (error) {
      console.error('Error running license checks:', error);
    }
  });
}
