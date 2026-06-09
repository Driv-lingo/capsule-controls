import { Shield, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ResetPassword = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary glow-strong">
            <Shield className="h-7 w-7 text-primary-foreground" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Reset Password
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Password reset is not connected yet.
            </p>
          </div>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Supabase password reset has been removed. Password reset needs to be
            rebuilt using the new Vercel database authentication system.
          </AlertDescription>
        </Alert>

        <Button
          type="button"
          className="w-full gap-2"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Button>
      </div>
    </div>
  );
};

export default ResetPassword;
