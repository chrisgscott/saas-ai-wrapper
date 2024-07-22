import MailerLite from '@mailerlite/mailerlite-nodejs';
import dbConnect from '../../lib/mongodb';
import Strategy from '../../models/Strategy';
import config from '../../config';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await dbConnect();

      const { strategyId, email } = req.body;
      console.log('Received request:', { strategyId, email });

      // Update strategy in database
      let strategy = await Strategy.findById(strategyId);
      if (!strategy) {
        return res.status(404).json({ success: false, error: 'Strategy not found' });
      }
      strategy.email = email;
      strategy = await strategy.save();
      console.log('Strategy updated:', strategy);

      // Initialize Mailerlite client
      const mailerlite = new MailerLite({
        api_key: process.env.MAILERLITE_API_KEY
      });

      // Subscribe to Mailerlite
      const params = {
        email: email,
        groups: [config.mailerlite.groupId], // This is now already a string
        status: 'active'
      };
      
      console.log('Mailerlite params:', params);

      try {
        const response = await mailerlite.subscribers.createOrUpdate(params);
        console.log('Mailerlite response:', response);
        res.status(200).json({ success: true, message: 'Email saved and subscribed successfully' });
      } catch (mailerliteError) {
        console.error('Mailerlite API error:', mailerliteError.response?.data || mailerliteError);
        res.status(422).json({ 
          success: false, 
          error: 'Failed to subscribe email to Mailerlite',
          details: mailerliteError.response?.data || mailerliteError.message
        });
      }
    } catch (error) {
      console.error('Error in subscribe-email:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'An error occurred while processing your request.',
        details: error
      });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}