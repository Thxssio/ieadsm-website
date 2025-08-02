import { LogIn } from "lucide-react";
import IconWrapper from "../components/common/IconWrapper";
import EmailPasswordForm from "./EmailPasswordForm";
import SocialButtons from "./SocialButtons";

export const metadata = {
  title: "Área do Ministro | IEADSM",
  description: "Login de ministros.",
};

export default function LoginPage() {
  return (
    <div className="bg-white py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <IconWrapper><LogIn size={32} /></IconWrapper>

        <h1 className="mt-6 text-3xl font-bold text-stone-900 tracking-tight sm:text-4xl">
          Área do Ministro
        </h1>
        <p className="mt-4 text-lg text-stone-600">
          Entre com seu e‑mail e senha ou use uma conta social.
        </p>

        <div className="mt-10 mx-auto max-w-md space-y-6">
          {/* Social: Google e Apple */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <SocialButtons />
          </div>

          {/* Email / senha */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm text-left">
            <EmailPasswordForm />
            <p className="mt-4 text-xs text-stone-500 text-center">
              Ao continuar, você concorda com nossos termos de uso e política de privacidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
