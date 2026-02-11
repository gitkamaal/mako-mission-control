import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mb-8">
          <span className="text-5xl">🦈</span>
          <h1 className="text-2xl font-bold mt-4">Mako Mission Control</h1>
          <p className="text-muted-foreground">Sign in to access the dashboard</p>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
