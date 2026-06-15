import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  // In demo mode, skip login entirely
  if (process.env.DEMO_MODE === "true") {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
