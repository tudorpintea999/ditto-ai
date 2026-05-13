import os
import httpx


def send_welcome_email(to_email: str, api_key: str) -> bool:
    """Send the welcome + API key email via Resend. Returns True on success."""
    resend_key = os.environ.get("RESEND_API_KEY", "")
    if not resend_key:
        return False

    html = f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your NOTTURA AI key</title>
</head>
<body style="margin:0;padding:0;background:#070709;font-family:'Courier New',monospace;color:#c8d6e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#070709;padding:48px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#0d0d10;border:1px solid rgba(0,229,255,0.15);border-radius:4px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid rgba(0,229,255,0.1);">
              <p style="margin:0;font-size:11px;letter-spacing:0.25em;color:rgba(0,229,255,0.5);">// NOTTURA AI</p>
              <h1 style="margin:8px 0 0;font-size:28px;font-weight:700;letter-spacing:0.15em;color:#00e5ff;text-shadow:0 0 20px rgba(0,229,255,0.3);">
                YOUR KEY IS READY
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#c8d6e5;font-family:Georgia,serif;">
                Welcome to NOTTURA AI. Below is your personal API key. Keep it safe — it's your access credential to the extension.
              </p>

              <!-- Key block -->
              <div style="background:#070709;border:1px solid rgba(0,229,255,0.3);border-radius:2px;padding:20px 24px;margin:0 0 32px;">
                <p style="margin:0 0 8px;font-size:9px;letter-spacing:0.2em;color:rgba(0,229,255,0.5);">API KEY</p>
                <p style="margin:0;font-size:15px;letter-spacing:0.08em;color:#00e5ff;word-break:break-all;">{api_key}</p>
              </div>

              <!-- Steps -->
              <p style="margin:0 0 16px;font-size:9px;letter-spacing:0.2em;color:rgba(0,229,255,0.5);">// HOW TO ACTIVATE</p>
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                    <span style="font-size:11px;letter-spacing:0.15em;color:rgba(0,229,255,0.4);">01 &nbsp;</span>
                    <span style="font-size:13px;color:#c8d6e5;font-family:Georgia,serif;">Install the extension from the Chrome Web Store</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                    <span style="font-size:11px;letter-spacing:0.15em;color:rgba(0,229,255,0.4);">02 &nbsp;</span>
                    <span style="font-size:13px;color:#c8d6e5;font-family:Georgia,serif;">Click the NOTTURA icon, paste your key above</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 0;">
                    <span style="font-size:11px;letter-spacing:0.15em;color:rgba(0,229,255,0.4);">03 &nbsp;</span>
                    <span style="font-size:13px;color:#c8d6e5;font-family:Georgia,serif;">Open any video, hit INITIATE CAPTURE, get your PDF</span>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <div style="margin:32px 0 0;text-align:center;">
                <a href="https://chromewebstore.google.com/detail/nottura-ai-%E2%80%94-video-to-pdf/kldfpbnafadeaobolmkkleddcifechac"
                   style="display:inline-block;background:rgba(0,229,255,0.08);border:1px solid #00e5ff;color:#00e5ff;padding:12px 32px;border-radius:2px;font-size:12px;letter-spacing:0.15em;font-weight:700;text-decoration:none;">
                  OPEN CHROME STORE →
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.04);">
              <p style="margin:0;font-size:10px;letter-spacing:0.1em;color:rgba(58,74,90,0.8);">
                NOTTURA AI · notturaai.xyz · You're receiving this because you subscribed.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    try:
        response = httpx.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {resend_key}",
                "Content-Type": "application/json",
            },
            json={
                "from": "NOTTURA AI <welcome@notturaai.xyz>",
                "to": [to_email],
                "subject": "Your NOTTURA AI key is ready",
                "html": html,
            },
            timeout=10,
        )
        return response.status_code == 200
    except Exception:
        return False
