import ResetPasswordForm from "@/recuperar-senha/ResetPasswordForm";

export const metadata = {
  title: "Recuperar senha | IEADSM",
  description: "Envie um e-mail de redefinição de senha.",
};

export default function ResetPage() {
  return (
    <div className="bg-white dark:bg-slate-900 py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
        <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">Recuperar senha</h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">Informe seu e‑mail para receber o link.</p>
        <div className="mt-6 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}

