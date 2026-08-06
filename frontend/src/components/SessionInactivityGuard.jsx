import { useEffect, useRef, useState } from "react";

const SESSION_ACTIVITY_KEY = "mcu:last-session-activity";
const SESSION_EVENT = "mcu:session-ended";
const MINUTE = 60 * 1000;
const idleMinutes = Math.max(1, Number(import.meta.env.VITE_IDLE_TIMEOUT_MINUTES) || 30);
const warningMinutes = Math.min(
  Math.max(1, Number(import.meta.env.VITE_IDLE_WARNING_MINUTES) || 2),
  Math.max(1, idleMinutes - 1),
);
const idleMs = idleMinutes * MINUTE;
const warningMs = warningMinutes * MINUTE;

function redirectAfterLogout() {
  const isAdminPage = window.location.pathname.startsWith("/admin");
  window.location.replace(isAdminPage ? "/login?logout=inactive" : "/?session=expired");
}

/** Enforces browser inactivity logout after the API has confirmed a session. */
export default function SessionInactivityGuard() {
  const [activeSession, setActiveSession] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const expiringRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me")
      .then((response) => {
        if (!response.ok) throw new Error("No active session");
        if (!cancelled) setActiveSession(true);
      })
      .catch(() => {
        if (!cancelled) setActiveSession(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!activeSession) return undefined;

    const setLastActivity = () => {
      const now = Date.now();
      try { localStorage.setItem(SESSION_ACTIVITY_KEY, String(now)); } catch { /* storage unavailable */ }
      setShowWarning(false);
    };

    const endSession = async () => {
      if (expiringRef.current) return;
      expiringRef.current = true;
      try { await fetch("/api/logout", { method: "POST" }); } catch { /* clear local state regardless */ }
      try { localStorage.setItem(SESSION_EVENT, String(Date.now())); } catch { /* storage unavailable */ }
      redirectAfterLogout();
    };

    const checkIdleTime = () => {
      let lastActivity = Date.now();
      try { lastActivity = Number(localStorage.getItem(SESSION_ACTIVITY_KEY)) || lastActivity; } catch { /* storage unavailable */ }
      const inactiveFor = Date.now() - lastActivity;
      if (inactiveFor >= idleMs) {
        endSession();
      } else if (inactiveFor >= idleMs - warningMs) {
        setShowWarning(true);
      }
    };

    const onStorage = (event) => {
      if (event.key === SESSION_EVENT) redirectAfterLogout();
      if (event.key === SESSION_ACTIVITY_KEY) setShowWarning(false);
    };

    setLastActivity();
    const activityEvents = ["pointerdown", "keydown", "touchstart", "scroll", "focus"];
    activityEvents.forEach((event) => window.addEventListener(event, setLastActivity, { passive: true }));
    window.addEventListener("storage", onStorage);
    const interval = window.setInterval(checkIdleTime, 10 * 1000);

    return () => {
      activityEvents.forEach((event) => window.removeEventListener(event, setLastActivity));
      window.removeEventListener("storage", onStorage);
      window.clearInterval(interval);
    };
  }, [activeSession]);

  if (!showWarning) return null;
  return (
    <div className="session-timeout-warning" role="alertdialog" aria-live="assertive" aria-label="Session inactivity warning">
      <strong>Your session will end soon</strong>
      <span>You will be signed out after {idleMinutes} minutes of inactivity.</span>
      <button type="button" onClick={() => {
        try { localStorage.setItem(SESSION_ACTIVITY_KEY, String(Date.now())); } catch { /* storage unavailable */ }
        setShowWarning(false);
      }}>Stay signed in</button>
    </div>
  );
}
