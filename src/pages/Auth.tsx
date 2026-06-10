import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, LogIn, UserPlus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, resetPassword } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setResetSent(false);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);

        if (error) {
          setError(
            error === "Invalid login credentials"
              ? "Invalid login credentials. Please check your email and password."
              : error
          );
        } else {
          navigate("/", { replace: true });
        }
      } else {
        const { error } = await signUp(email, password, fullName);

        if (error) {
          setError(error);
        } else {
          setSignUpSuccess(true);
          navigate("/", { replace: true });
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Enter your email first, then click Forgot password.");
      return;
    }

    setError(null);
    setResetSent(false);
    setLoading(true);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        setError(error);
      } else {
        setResetSent(true);
      }
    } catch {
      setError("Password reset is not available right now.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin((prev) => !prev);
    setError(null);
    setSignUpSuccess(false);
    setResetSent(false);
    setPassword("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary glow-strong">
            <Shield className="h-7 w-7 text-primary-foreground" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Obligation Capsule Fabric
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isLogin
                ? "Sign in to access compliance controls"
                : "Create your account to get started"}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-warning/30 bg-warning/10 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <div>
              <p className="text-xs font-medium text-warning">
                Authentication Required
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                All compliance operations require authenticated access.
                Unauthorized access is logged and reported.
              </p>
            </div>
          </div>
        </div>

        {signUpSuccess ? (
          <div className="rounded-lg border border-success/30 bg-success/10 p-4 text-center">
            <p className="text-sm font-medium text-success">Account created</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Redirecting you now.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm text-foreground">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-xs">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {resetSent && (
              <Alert>
                <AlertDescription className="text-xs">
                  Password reset email sent. Check your inbox and spam folder.
                </AlertDescription>
              </Alert>
            )}

            {isLogin && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-primary hover:underline"
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {isLogin ? (
                <LogIn className="h-4 w-4" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}

              {loading
                ? "Processing…"
                : isLogin
                  ? "Sign In"
                  : "Create Account"}
            </Button>
          </form>
        )}

        {!signUpSuccess && (
          <p className="text-center text-xs text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={toggleMode}
              className="text-primary hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default Auth;