import { getSession } from "@/actions/auth";
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";
import LoginForm from "@/components/auth/login-form";

const LoginPage = async () => {
  const session = await getSession();
  if (session.isLoggedIn) redirect(routes.ADMIN);

  return <LoginForm />;
};

export default LoginPage;
