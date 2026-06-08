import { useState, useEffect } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { authAPI, twoFactorAPI } from "../services/api.js";
import QRCode from 'qrcode';
import '../styles/auth.css';

/**
 * Login Component
 *
 * Handles user authentification wih email and password and the following 2FA registration/authentication.
 * Supports three user roles: user, admin and super_admin.
 * Automatically redirects authenticated users to dashboard.
 *
 * @returns {React.JSX.Element}
 * @component
 */
const Login = () => {
    const navigate = useNavigate();
    const { completeLogin, isAuthenticated } = useAuth();

    // Step management
    const [step, setStep] = useState('credentials');

    // Credentials
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // 2FA tokens (short-lived, stored only in state - never in sessionStorage)
    const [setupToken, setSetupToken] = useState('');
    const [tempToken, setTempToken] = useState('');

    // 2FA setup
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
    const [manualSecret, setManualSecret] = useState('');

     // Shared
    const [totpCode, setTotpCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    /**
     * Redirects to dashboard if user is already authenticated
     */
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    /**
     * Handle login credentials form submission
     *
     * @param {Event} e - Form submission event
     */
    const handleCredentialsSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.login(email, password);
            const data =  response.data;

            if (data.requires_2fa_setup) {
                setSetupToken(data.setup_token);
                await loadQrCode(data.setup_token);
                setStep('setup');
            } else if (data.requires_2fa) {
                setTempToken(data.temp_token);
                setStep('verify');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Identifiants incorrects');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Fetch QR code from backend and convert to displayable image
     *
     * @param {string} token - Setup token
     */
    const loadQrCode = async (token) => {
        try {
            const response = await twoFactorAPI.getSetup(token);
            const { qr_code_url, secret } = response.data.data;
            const dataUrl = await QRCode.toDataURL(qr_code_url, { width: 200 });
            setQrCodeDataUrl(dataUrl);
            setManualSecret(secret);
        } catch (error) {
            setError('Failed to  load QR code. Please go back and try again.');
            console.error('QR code load error: ', error);
        }
    }

    /**
     * Confirm 2FA setup with first TOTP code
     */
    const handleSetupConfirm = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await twoFactorAPI.confirmSetup(setupToken, totpCode);
            const { user, access_token, refresh_token } = response.data.data;

            const result = completeLogin(user, access_token, refresh_token);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Invalid code. please try again.');
            setTotpCode('');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Verify TOTP code on subsequent logins
     */
    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await twoFactorAPI.verify(tempToken, totpCode);
            const { user, access_token, refresh_token } = response.data.data;

            const result = completeLogin(user, access_token, refresh_token);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Invalid code. Please try again.');
            setTotpCode('');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Go back to credentials step and reset 2FA state
     */
    const handleBack = () => {
        setStep('credentials');
        setError('');
        setTotpCode('');
        setSetupToken('');
        setTempToken('');
        setQrCodeDataUrl('');
        setManualSecret('');
    };

    /**
     * Render Credentials form
     */
    const renderCredentials = () => (
        <>
            <h2 className="auth-title">Connection</h2>

            {error && <div className="error-alert">{error}</div>}

            <form onSubmit={handleCredentialsSubmit}>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="form-input"
                        placeholder="user@company.com"
                        disabled={loading}
                    />
                </div>
                <div className="form-group-last">
                    <label className="form-label">Mot de passe</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="form-input"
                        placeholder="mot de passe"
                        disabled={loading}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                >
                    {loading ? 'Connection...' : 'Se connecter'}
                </button>
            </form>

            <div className="test-accounts">
                <p className="test-accounts-title">Comptes de test:</p>
                <p className="test-account-item">👤 User: user@company.com / password123</p>
                <p className="test-account-item">🛡️ Admin: admin@company.com / password123</p>
                <p className="test-account-item">⚡ Super Admin: superadmin@company.com / password123</p>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Link to="/forgot-password" style={{ color: '#3498db', fontSize: '0.85rem', textDecoration: 'none' }}>
                    Forgot your password?
                </Link>
            </div>
        </>
    );

    /**
     * 2FA Setup (first login)
     */
    const renderSetup = () => (
        <>
            <h2 className="auth-title">Configuration 2FA</h2>
            <p style={{ color: '#7f8c8d', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
                Scannez le QR code avec Google Authenticator ou une application TOTP
            </p>

            {error && <div className="error-alert">{error}</div>}

            {qrCodeDataUrl ? (
                <div style={{ textAlign: 'center', margin: '1rem 0' }}>
                    <img
                        src={qrCodeDataUrl}
                        alt={"2FA QR code"}
                        style={{ border: '8px solid white', borderRadius: '8px' }}
                    />
                    <p style={{ fontSize: '0.8rem', color: '#7f8c8d', marginTop: '1rem' }}>
                        Impossible de scanner ? Entrez ce code manuellement :
                    </p>
                    <code style={{
                        display: 'block',
                        background: '#f8f9fa',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        letterSpacing: '2px',
                        wordBreak: 'break-all',
                        color: '#2c3e50',
                    }}>
                        {manualSecret}
                    </code>
                </div>
            ) : (
                <p style={{ textAlign: 'center', color: '#7f8c8d' }}>
                    Chargement du QR code...
                </p>
            )}

            <form onSubmit={handleSetupConfirm}>
                <div className="form-group">
                    <label className="form-label">
                        Code de vérification (6 chiffres)
                    </label>
                    <input
                        type="text"
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="form-input"
                        placeholder="000000"
                        maxLength={6}
                        required
                        disabled={loading}
                        autoComplete="one-time-code"
                        style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px' }}
                    />
                </div>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || totpCode.length !== 6}
                >
                    {loading ? 'Verification' : 'Activer le 2FA'}
                </button>
            </form>

            <button onClick={handleBack} className="btn-back">
                ← Retour
            </button>
        </>
    );

    /**
     * Verify (subsequent logins)
     */
    const renderVerify = () => (
        <>
            <h2 className="auth-title">Authentification 2FA</h2>
            <p style={{ color: '#7f8c8d', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
                Entrez le code à 6 chiffres de votre application d'authentification
            </p>

            {error && <div className="error-alert">{error}</div>}

            <form onSubmit={handleVerify}>
                <div className="form-group">
                    <label className="form-label">Code d'authentification</label>
                    <input
                        type="text"
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="form-input"
                        placeholder="000000"
                        maxLength={6}
                        required
                        disabled={loading}
                        autoFocus
                        autoComplete="one-time-code"
                        style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px' }}
                    />
                </div>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || totpCode.length !== 6}
                >
                    {loading ? 'Verification' : 'Vérifier'}
                </button>
            </form>

            <button onClick={handleBack} className="btn-back">
                ← Retour
            </button>
        </>
    );

    return (
        <div className="auth-container">
            <div className="auth-card">
                {step === 'credentials' && renderCredentials()}
                {step === 'setup' && renderSetup()}
                {step === 'verify' && renderVerify()}
            </div>
        </div>
    );
};

export default Login;