import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/auth";
import { SpinnerIcon } from "./Icons";

/** Wraps protected routes. Signed-out visitors are sent to /app/login with the
 *  current location preserved in state so the handoff (e.g. ?url=…) survives. */
export function RequireAuth() {
  const { user, ready } = useAuth();
  const location = useLocation();

  // Session restore (GET /auth/me) hasn't resolved yet — hold the redirect
  // so a signed-in reload doesn't flash the sign-in page.
  if (!ready) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <SpinnerIcon className="size-6 animate-spin text-ink-mute" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}