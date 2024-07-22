import MailerLite from '@mailerlite/mailerlite-nodejs';
import config from '../config';

const mailerlite = new MailerLite({
  api_key: process.env.MAILERLITE_API_KEY
});

export async function subscribeToMailerlite(email) {
  try {
    const params = {
      email: email,
      groups: [config.mailerlite.groupId],
      status: 'active'
    };

    await mailerlite.subscribers.createOrUpdate(params);
  } catch (error) {
    console.error('Error subscribing to Mailerlite:', error);
    throw error;
  }
}