import { useCallback } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/auth";
import { api } from "../lib/api";
import { useToast } from "../components/Toast";

/** Handlers shared by every authenticated page (dashboard, settings, …). */
export function useAppActions() {
  const { setUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignIn = useCallback(() => navigate("/login"), [navigate]);

  const handleNeedAuth = useCallback(() => {
    setUser(null);
    navigate("/login");
  }, [setUser, navigate]);

  const handleSignOut = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* session already invalid — still sign out locally */
    }
    setUser(null);
    toast("Signed out");
    navigate("/login", { replace: true });
  }, [setUser, toast, navigate]);

  const handleNewLink = useCallback(() => {
    navigate("/");
    document.getElementById("shorten")?.scrollIntoView({ behavior: "smooth" });
    window.setTimeout(() => {
      document
        .querySelector<HTMLInputElement>('[aria-label="URL to shorten"]')
        ?.focus();
    }, 300);
  }, [navigate]);

  return { handleSignIn, handleNeedAuth, handleSignOut, handleNewLink };
}