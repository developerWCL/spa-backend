/**
 * Email template: Booking Received
 * Sent to guest when a booking is created and pending confirmation.
 */
export function bookingReceivedTemplate(data: {
  recipientName: string;
  bookingId: string;
  bookingDate: string;
  services: { name: string; price: string }[];
  subtotalAmount?: string;
  totalAmount: string;
  discountAmount?: string;
  currency: string;
  guestCount: number;
  specialRequest?: string;
  branchName?: string;
  branchPhone?: string;
  branchEmail?: string;
  spaName?: string;
  logoUrl?: string;
  primaryColor?: string;
  paymentType?: string;
  captureId?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  promotionName?: string;
  promotionCode?: string;
  paymentMethod?: string;
}): string {
  const PRIMARY = data.primaryColor || '#2d7d62';
  const LIGHT_BG = '#f0faf6';
  const spaName = data.spaName || 'Orientala Spa';
  const header = data.logoUrl
    ? `<img src="${data.logoUrl}" alt="${spaName}" style="height:48px;width:auto;display:block;"/>`
    : `<p style="margin:0;color:${PRIMARY};font-size:22px;font-weight:700;letter-spacing:0.5px;">${spaName}</p>`;

  const lastIdx = data.services.length - 1;
  const serviceRows = data.services
    .map(
      (s, i) => `<tr>
        <td style="padding:8px 0;${i < lastIdx ? 'border-bottom:1px solid #e5e7eb;' : ''}color:#374151;">${s.name}</td>
        <td style="padding:8px 0;${i < lastIdx ? 'border-bottom:1px solid #e5e7eb;' : ''}color:#374151;text-align:right;white-space:nowrap;">${s.price} ${data.currency}</td>
      </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#f9fafb;padding:24px 32px;border-bottom:1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">${header}</td>
                  <td style="text-align:right;vertical-align:middle;">
                    <p style="margin:0;color:${PRIMARY};font-size:13px;font-weight:600;">Booking Received</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 8px;color:#111827;font-size:16px;">Dear <strong>${data.recipientName}</strong>,</p>
              <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
                A new booking has been received and is pending your review and confirmation. Please verify the booking details and confirm or make necessary adjustments.
              </p>

              <!-- Booking ID box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:${LIGHT_BG};border-radius:6px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;">Booking Reference</p>
                    <p style="margin:0;color:${PRIMARY};font-size:20px;font-weight:700;">${data.bookingId}</p>
                    ${data.branchName ? `<p style="margin:8px 0 0;color:#6b7280;font-size:13px;">${data.branchName}</p>` : ''}
                  </td>
                  <td style="padding:16px 20px;text-align:right;vertical-align:middle;">
                    <span style="background:#f59e0b;color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;">PENDING</span>
                  </td>
                </tr>
              </table>

              <!-- Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td width="50%" style="padding:0 12px 0 0;vertical-align:top;">
                    <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;">Requested Date</p>
                    <p style="margin:0;color:#111827;font-size:15px;font-weight:600;">${data.bookingDate}</p>
                  </td>
                  <td width="50%" style="padding:0 0 0 12px;vertical-align:top;">
                    <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;">Guests</p>
                    <p style="margin:0;color:#111827;font-size:15px;font-weight:600;">${data.guestCount} Adult${data.guestCount !== 1 ? 's' : ''}</p>
                  </td>
                </tr>
              </table>

              <!-- Guest Information -->
              <p style="margin:0 0 12px;color:#111827;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Guest Information</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background:${LIGHT_BG};border-radius:6px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 8px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;">Name</p>
                    <p style="margin:0 0 12px;color:#111827;font-size:14px;">${data.guestName}</p>
                    ${data.guestEmail ? `<p style="margin:0 0 8px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;">Email</p><p style="margin:0 0 12px;color:#111827;font-size:14px;">${data.guestEmail}</p>` : ''}
                    ${data.guestPhone ? `<p style="margin:0 0 8px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;">Phone</p><p style="margin:0;color:#111827;font-size:14px;">${data.guestPhone}</p>` : ''}
                  </td>
                </tr>
              </table>

              <!-- Services -->
              <p style="margin:0 0 8px;color:#111827;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Services</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                ${serviceRows}
              </table>

              ${data.paymentType ? `
              <p style="margin:0 0 8px;color:#111827;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">Payment Details</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:8px 0;color:#374151;border-bottom:1px solid #e5e7eb;">Payment Type</td>
                  <td style="padding:8px 0;color:#374151;text-align:right;border-bottom:1px solid #e5e7eb;white-space:nowrap;">${data.paymentType}</td>
                </tr>
                ${data.paymentType.toLowerCase() === 'paypal' && data.captureId ? `
                <tr>
                  <td style="padding:8px 0;color:#374151;">Capture ID</td>
                  <td style="padding:8px 0;color:#374151;text-align:right;white-space:nowrap;">${data.captureId}</td>
                </tr>
                ` : ''}
              </table>
              ` : ''}

              ${data.specialRequest ? `
              <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;">Special Request</p>
              <p style="margin:0 0 24px;color:#374151;font-size:14px;">${data.specialRequest}</p>
              ` : ''}

              <!-- Promotion -->
              ${data.promotionName ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#dcfce7;border-radius:6px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;color:#15803d;font-size:14px;font-weight:600;">Promotion used: <strong>${data.promotionName}</strong> (${data.promotionCode})</p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Total -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid ${PRIMARY};margin-bottom:32px;">
                ${data.subtotalAmount ? `
                <tr>
                  <td style="padding:8px 0;color:#111827;font-size:14px;">Subtotal</td>
                  <td style="padding:8px 0;text-align:right;color:#374151;font-size:14px;white-space:nowrap;">${data.subtotalAmount} ${data.currency}</td>
                </tr>
                ` : ''}
                ${data.discountAmount && parseFloat(data.discountAmount) > 0 ? `
                <tr>
                  <td style="padding:8px 0;color:#10b981;font-size:14px;font-weight:600;">Discount</td>
                  <td style="padding:8px 0;text-align:right;color:#10b981;font-size:14px;font-weight:600;">-${data.discountAmount} ${data.currency}</td>
                </tr>
                ` : ''}  
                <tr>
                  <td style="padding:16px 0 0;color:#111827;font-size:15px;font-weight:700;">Total</td>
                  <td style="padding:16px 0 0;text-align:right;color:${PRIMARY};font-size:18px;font-weight:700;">${data.totalAmount} ${data.currency}</td>
                </tr>
              </table>

              <p style="margin:0 0 16px;color:#6b7280;font-size:13px;line-height:1.6;">
                We will review your booking request and send you a confirmation email within 24 hours. If you need to make any changes, please contact us as soon as possible.
              </p>

              <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
                Once confirmed, please arrive 10–15 minutes before your appointment. If you need to reschedule or cancel, contact us at least 24 hours in advance.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;">
              ${data.branchName ? `<p style="margin:0 0 4px;color:#374151;font-size:13px;font-weight:600;">${data.branchName}</p>` : ''}
              ${data.branchPhone ? `<p style="margin:0 0 2px;color:#6b7280;font-size:12px;">Tel: ${data.branchPhone}</p>` : ''}
              ${data.branchEmail ? `<p style="margin:0;color:#6b7280;font-size:12px;">Email: ${data.branchEmail}</p>` : ''}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
