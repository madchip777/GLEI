<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .body { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
        .success { color: #27ae60; font-weight: bold; }
    </style>
</head>
<body>
<div class="header">
    <h2>GLEI Support System</h2>
</div>
<div class="body">
    <p class="success">✓ Email configuration is working correctly!</p>
    <p>This is a test email from the GLEI Support System.</p>
    <p>Sent at: {{ now()->format('d/m/Y H:i:s') }}</p>
</div>
</body>
</html>
