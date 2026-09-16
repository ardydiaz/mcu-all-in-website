import React, { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";

function MicrosoftLogo() {
  return (
    <span className="microsoft-logo" aria-hidden="true">
      <i /><i /><i /><i />
    </span>
  );
}

export default function Login() {
  const [starting, setStarting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState(false);

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => document.body.classList.remove("login-page");
  }, []);

  useEffect(() => {
    if (!logoutSuccess) return undefined;
    const timeout = window.setTimeout(() => setLogoutSuccess(false), 3500);
    return () => window.clearTimeout(timeout);
  }, [logoutSuccess]);

  useEffect(() => {
    const parameters = new URLSearchParams(window.location.search);
    if (parameters.get("logout") === "success") setLogoutSuccess(true);
    const loginState = parameters.get("microsoftLogin");
    if (loginState === "approvalRequired") {
      setApprovalRequired(true);
      return undefined;
    }
    if (loginState !== "success") return undefined;
    const requestedNext = parameters.get("next");
    const next = requestedNext?.startsWith("/admin") ? requestedNext : "/admin";
    setLoginSuccess(true);
    const timeout = window.setTimeout(() => window.location.replace(next), 1600);
    return () => window.clearTimeout(timeout);
  }, []);

  function signInWithMicrosoft() {
    setStarting(true);
    const requestedReturn = new URLSearchParams(window.location.search).get("returnTo");
    const returnTo = requestedReturn?.startsWith("/admin") ? requestedReturn : "/admin";
    window.location.href = `/api/auth/microsoft?returnTo=${encodeURIComponent(returnTo)}`;
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
        <div className="login-form microsoft-login-card">
          <span className="mobile-login-logo">MCU</span>
          <div className="login-heading">
            <span className="eyebrow">SECURE ADMIN ACCESS</span>
            <h2>Welcome back</h2>
            <p>Use your official MCU Microsoft 365 account to continue.</p>
          </div>

          <div className="microsoft-security">
            <span><ShieldCheck size={23} /></span>
            <div>
              <strong>Protected by Microsoft Entra ID</strong>
              <p>Your MCU password is handled only by Microsoft. This application never receives or stores it.</p>
            </div>
          </div>

          <button className="microsoft-login-button" type="button" onClick={signInWithMicrosoft} disabled={starting || loginSuccess}>
            <MicrosoftLogo />
            <span>{starting ? "Redirecting to Microsoft…" : "Sign in with Microsoft"}</span>
            <ArrowRight size={19} />
          </button>

          <div className="role-note">
            <strong>Account access</strong>
            <p>Super Admin and Administrator accounts continue to the dashboard. Faculty and Student accounts return to the public portal.</p>
          </div>
          {approvalRequired && <a className="return-public-link" href="/">Return to the public portal</a>}
          <small className="login-footer">Authorized MCU accounts only</small>
        </div>
      </section>
      {loginSuccess && <div className="login-success-toast" role="status" aria-live="polite"><span>✓</span><div><strong>Microsoft sign-in successful</strong><small>Redirecting you securely…</small></div></div>}
      {approvalRequired && <div className="login-success-toast login-warning-toast" role="alert" aria-live="assertive"><span>!</span><div><strong>Admin approval required</strong><small>Your account is signed in, but it is not approved for Admin Dashboard access.</small></div></div>}
      {logoutSuccess && <div className="login-success-toast login-logout-toast" role="status" aria-live="polite"><span>✓</span><div><strong>Signed out successfully</strong><small>Your secure session has been ended.</small></div></div>}
    </main>
  );
}
