import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router";
import { AuthPage } from "./components/AuthPage";
import { Dashboard } from "./components/Dashboard";
import { RequireAuth } from "./components/RequireAuth";
import { ToastProvider, useToast } from "./components/Toast";
import { AuthProvider, useAuth } from "./context/auth";

/** Public only: signed-in visitors bounce straight to the dashboard, and the
 *  location that sent them here is re-targeted after sign-in (see onSuccess). */
function LoginRoute() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // A signed-in user landing here directly goes to the dashboard. Don't bounce
  // when RequireAuth sent them (state.from set) — that path's handoff is handled
  // by onSuccess below, and a <Navigate> here would clobber the ?url= prefill.
  if (user && !location.state?.from) return <Navigate to="/" replace />;

  const state = location.state as
    | { from?: { pathname?: string; search?: string } }
    | null;
  const target = state?.from?.pathname
    ? state.from.pathname + (state.from.search ?? "")
    : "/";

  return (
    <AuthPage
      initialMode="login"
      onSuccess={(authedUser) => {
        setUser(authedUser);
        toast(`Signed in as ${authedUser.name ?? authedUser.email}`);
        navigate(target, { replace: true });
      }}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route element={<RequireAuth />}>
            <Route path="/" element={<Dashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}