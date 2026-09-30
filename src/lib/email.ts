import nodemailer from 'nodemailer';

const OWNER_EMAIL =
  process.env.OWNER_ALERT_EMAIL ||
  process.env.ADMIN_EMAIL ||
  'siddreddylakshmankumar@gmail.com';

const SECONDARY_OWNER_EMAIL = 'siddireddytejapavan@gmail.com';

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || `"Vani Milk Center Alerts" <${SMTP_USER || 'alerts@vanimilkcenter.com'}>`;

function getTransporter() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

/**
 * Send an alert email to the shop owner(s)
 */
export async function sendOwnerAlertEmail({
  subject,
  title,
  actionType,
  detailsHtml,
  adminName,
  adminEmail,
}: {
  subject: string;
  title: string;
  actionType: 'PRODUCT_UPDATE' | 'SHOP_DETAILS_UPDATE' | 'ORDER_UPDATE' | 'CATEGORY_UPDATE';
  detailsHtml: string;
  adminName?: string;
  adminEmail?: string;
}): Promise<boolean> {
  const timestamp = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; padding: 24px; }
          .header h1 { margin: 0 0 4px 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 0; font-size: 13px; opacity: 0.9; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; background: rgba(255,255,255,0.25); color: #ffffff; margin-bottom: 8px; }
          .content { padding: 24px; font-size: 14px; line-height: 1.6; }
          .meta-box { background: #f1f5f9; border-radius: 12px; padding: 14px 16px; margin: 16px 0; font-size: 13px; }
          .meta-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
          .meta-row:last-child { margin-bottom: 0; }
          .meta-label { color: #64748b; font-weight: 600; }
          .meta-val { color: #0f172a; font-weight: 700; }
          .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; font-size: 12px; color: #64748b; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
          th { text-align: left; padding: 8px 12px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569; font-weight: 700; font-size: 11px; text-transform: uppercase; }
          td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">VANI MILK CENTER ALERT</span>
            <h1>${title}</h1>
            <p>Immediate administrative notification for shop owner</p>
          </div>
          <div class="content">
            <div class="meta-box">
              <div class="meta-row">
                <span class="meta-label">Event Type:</span>
                <span class="meta-val">${actionType}</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Updated By:</span>
                <span class="meta-val">${adminName || 'Admin'} (${adminEmail || 'Admin Panel'})</span>
              </div>
              <div class="meta-row">
                <span class="meta-label">Time (IST):</span>
                <span class="meta-val">${timestamp}</span>
              </div>
            </div>

            ${detailsHtml}
          </div>
          <div class="footer">
            <p style="margin: 0;">Vani Milk Center, Gopuvanipalem • Real-time Owner Notification System</p>
          </div>
        </div>
      </body>
    </html>
  `;

  // Log alert to server console
  console.log(`\n📬 [OWNER EMAIL ALERT TRIGGERED]`);
  console.log(`   Subject: ${subject}`);
  console.log(`   Recipients: ${OWNER_EMAIL}, ${SECONDARY_OWNER_EMAIL}`);
  console.log(`   Action: ${actionType} at ${timestamp}`);

  const transporter = getTransporter();
  if (!transporter) {
    console.log(`ℹ️ [Email Note]: SMTP credentials not set in .env (SMTP_HOST, SMTP_USER, SMTP_PASS).`);
    console.log(`   Alert logged successfully. To deliver real inbox emails, configure SMTP_HOST in .env.\n`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: [OWNER_EMAIL, SECONDARY_OWNER_EMAIL].join(', '),
      subject,
      html: fullHtml,
    });
    console.log(`✅ [Email Sent]: Successfully dispatched alert email to shop owner!`);
    return true;
  } catch (error: any) {
    console.warn(`⚠️ [Email Dispatch Warning]: Could not send email:`, error?.message || error);
    return false;
  }
}

/**
 * Alert for product additions, edits, and deletions
 */
export async function alertProductUpdated({
  action,
  productName,
  productId,
  categoryName,
  variants,
  adminName,
  adminEmail,
}: {
  action: 'CREATED' | 'UPDATED' | 'DELETED';
  productName: string;
  productId?: string;
  categoryName?: string;
  variants?: Array<{ packSize: string; price: number; stockQuantity?: number }>;
  adminName?: string;
  adminEmail?: string;
}) {
  let variantsTable = '';
  if (variants && variants.length > 0) {
    variantsTable = `
      <h3 style="font-size: 13px; font-weight: 700; margin: 16px 0 8px 0;">Pack Sizes & Pricing:</h3>
      <table>
        <thead>
          <tr>
            <th>Pack Size</th>
            <th>Price</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          ${variants
            .map(
              (v) => `
            <tr>
              <td><strong>${v.packSize}</strong></td>
              <td>₹${v.price}</td>
              <td>${v.stockQuantity ?? '-'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;
  }

  const detailsHtml = `
    <p>Product <strong>"${productName}"</strong> was <strong>${action}</strong> in your catalogue.</p>
    ${categoryName ? `<p>Category: <strong>${categoryName}</strong></p>` : ''}
    ${variantsTable}
  `;

  return sendOwnerAlertEmail({
    subject: `🔔 [Vani Milk Center] Product ${action}: ${productName}`,
    title: `Product ${action}: ${productName}`,
    actionType: 'PRODUCT_UPDATE',
    detailsHtml,
    adminName,
    adminEmail,
  });
}

/**
 * Alert for shop settings modifications
 */
export async function alertShopSettingsUpdated({
  changedFields,
  adminName,
  adminEmail,
}: {
  changedFields: Record<string, any>;
  adminName?: string;
  adminEmail?: string;
}) {
  const rows = Object.entries(changedFields)
    .map(
      ([key, val]) => `
      <tr>
        <td><strong>${key}</strong></td>
        <td>${String(val)}</td>
      </tr>
    `
    )
    .join('');

  const detailsHtml = `
    <p>The shop settings and business profile have been updated with new values:</p>
    <table>
      <thead>
        <tr>
          <th>Setting Name</th>
          <th>Updated Value</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;

  return sendOwnerAlertEmail({
    subject: `🔔 [Vani Milk Center] Shop Details & Settings Updated`,
    title: `Shop Details & Settings Updated`,
    actionType: 'SHOP_DETAILS_UPDATE',
    detailsHtml,
    adminName,
    adminEmail,
  });
}
