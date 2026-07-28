import React, { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, KeyRound, UserRound } from "lucide-react";
import { adminApi } from "../../services/adminApi";

function Login() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => document.body.classList.remove("login-page");
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await adminApi.login({ username, password });
      window.location.href = "/admin";
    } catch (requestError) {
      setError(
        requestError instanceof TypeError
          ? "Cannot connect to the API. Start the backend server and try again."
          : requestError.message,
      );
      setSubmitting(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-visual">
        <div className="login-brand">
          <span className="brand-mark">M</span>
          <span><strong>MCU</strong><small>ALL-IN-ONE</small></span>
        </div>
        <div className="visual-copy">
          <span className="login-kicker"><i /> ADMINISTRATION PORTAL</span>
          <h1>One ecosystem.<br /><em>Every service.</em></h1>
          <p>Manage MCU’s connected websites and digital platforms from one secure place.</p>
        </div>
        <div className="palette-row" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
        <span className="login-orb orb-a" /><span className="login-orb orb-b" />
      </section>

      <section className="login-form-area">
        <form className="login-form" onSubmit={handleSubmit}>
          <span className="mobile-login-logo">MCU</span>
          <div className="login-heading">
            <span className="eyebrow">SECURE ADMIN ACCESS</span>
            <h2>Welcome back</h2>
            <p>Sign in to continue to your dashboard.</p>
          </div>
          <label>
            Username
            <span className="login-input">
              <UserRound size={17} />
              <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required placeholder="Enter your username" />
            </span>
          </label>
          <label>
            Password
            <span className="login-input">
              <KeyRound size={17} />
              <input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} autoComplete="current-password" required placeholder="Enter your password" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>
          <div className="login-options"><label><input type="checkbox" /> Remember me</label><a href="mailto:info@mcu.edu.ph">Need help?</a></div>
          <p className="login-error" role="alert">{error}</p>
          <button className="login-button" type="submit" disabled={submitting}>
            <span>{submitting ? "Signing in..." : "Sign in to dashboard"}</span><ArrowRight size={19} />
          </button>
          <div className="default-login">
            <strong>Default local account</strong>
            <span>Username: <code>admin</code></span>
            <span>Password: <code>MCUAdmin@2026</code></span>
          </div>
          <small className="login-footer">Authorized MCU personnel only</small>
        </form>
      </section>
    </main>
  );
}

export default Login;
