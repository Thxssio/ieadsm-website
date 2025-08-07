import RegisterForm from "./RegisterForm";

export const metadata = {
  title: "Criar conta — IEADSM",
  description: "Cadastro de ministros.",
};

export default function RegisterPage() {
  return (
    <div className="bg-white py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
        <h1 className="text-3xl font-bold text-stone-900">Criar conta</h1>
        <p className="mt-2 text-stone-600">
          Use seu e‑mail e defina uma senha para se cadastrar.
        </p>
        <div className="mt-6 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}