import nodemailer from 'nodemailer';

const fake = {
  sendMail: async (opts) => console.log('[MAIL]', opts)
};

export const getTransport = () => {
  if (!process.env.SMTP_HOST) return fake;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
};

export const notifyAdminPreorder = async (po) => {
  const t = getTransport();
  await t.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@letzplay.local',
    to: 'admin@letzplay.local',
    subject: `New Preorder: ${po.productName}`,
    text: JSON.stringify(po, null, 2)
  });
};
