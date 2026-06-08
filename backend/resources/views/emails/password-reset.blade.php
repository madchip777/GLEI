<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            color: #2c3e50;
        }
        .header {
            background: #c0392b;
            color: white;
            padding: 20px 30px;
            border-radius: 8px 8px 0 0;
        }
        .header h2 { margin: 0; font-size: 1.4rem; }
        .header p { margin: 5px 0 0 0; opacity: 0.7; font-size: 0.9rem; }
        .body {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 8px 8px;
            border: 1px solid #e0e0e0;
            border-top: none;
        }
        .credentials-box {
            background: white;
            border: 1px solid #e0e0e0;
            border-left: 4px solid #c0392b;
            border-radius: 4px;
            padding: 20px;
            margin: 20px 0;
        }
        .credentials-box p { margin: 8px 0; font-size: 0.95rem; }
        .credentials-box strong {
            display: inline-block;
            width: 120px;
            color: #7f8c8d;
        }
        .password {
            font-family: monospace;
            font-size: 1.1rem;
            background: #f8f9fa;
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid #e0e0e0;
            letter-spacing: 2px;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 4px;
            padding: 12px 16px;
            margin: 20px 0;
            font-size: 0.9rem;
        }
        .btn {
            display: inline-block;
            background: #c0392b;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            margin: 10px 0;
            font-size: 0.95rem;
        }
        .expiry {
            font-size: 0.85rem;
            color: #c0392b;
            margin-top: 8px;
        }
        .footer {
            margin-top: 30px;
            font-size: 0.8rem;
            color: #95a5a6;
            border-top: 1px solid #e0e0e0;
            padding-top: 15px;
        }
    </style>
</head>
<body>
<div class="header">
    <h2>GLEI Support System</h2>
    <p>Password Reset</p>
</div>
<div class="body">
    <p>Hello <strong>{{ $user->name }}</strong>,</p>

    @if($resetLink)
        {{-- Self-service reset flow --}}
        <p>A password reset was requested for your account. Click the button below to reset your password:</p>

        <a href="{{ $resetLink }}" class="btn">Reset My Password</a>

        <p class="expiry">⏱ This link expires in 60 minutes.</p>

        <div class="warning">
            <strong>⚠ Did not request this?</strong>
            If you did not request a password reset, please contact your administrator immediately
            as your account may be compromised.
        </div>
    @endif

    @if($temporaryPassword)
        {{-- Admin reset flow --}}
        <p>Your password has been reset by an administrator. Here are your new temporary credentials:</p>

        <div class="credentials-box">
            <p><strong>Email:</strong> {{ $user->email }}</p>
            <p><strong>Password:</strong> <span class="password">{{ $temporaryPassword }}</span></p>
        </div>

        <div class="warning">
            <strong>⚠ Important:</strong> This is a temporary password.
            You will be required to change it on your next login.
        </div>

        <a href="http://localhost:5173/login" class="btn">Access GLEI Portal</a>
    @endif

    <div class="footer">
        <p>This is an automated message from the GLEI Support System. Please do not reply to this email.</p>
    </div>
</div>
</body>
</html>
