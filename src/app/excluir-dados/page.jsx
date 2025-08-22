export const metadata = {
  title: "Exclusão de Dados | IEADSM",
  description:
    "Como solicitar a exclusão de dados pessoais no site da IEADSM conforme a LGPD.",
};

export default function ExcluirDadosPage() {
  const subject = "Exclus%C3%A3o%20de%20dados%20-%20IEADSM";
  const body =
    "Olá,%0A%0AQuero solicitar a exclusão dos meus dados.%0A%0ANome completo:%0AE-mail utilizado:%0ADescrição do pedido:%0A%0AObrigado.";

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-900">Solicitação de exclusão de dados</h1>

      <p className="mt-4 text-stone-700">
        Se você interagiu conosco (ex.: formulários) e deseja excluir seus dados, envie um e-mail para{" "}
        <a
          href={`mailto:contato@adsantamariars.com.br?subject=${subject}&body=${body}`}
          className="underline"
        >
          contato@adsantamariars.com.br
        </a>{" "}
        com o assunto <strong>“Exclusão de dados”</strong> e as informações abaixo:
      </p>

      <ol className="mt-4 list-decimal pl-6 text-stone-700">
        <li>Seu nome completo</li>
        <li>Endereço de e-mail usado no contato/inscrição</li>
        <li>Descrição do pedido (ex.: “excluir meus dados do formulário de contato”)</li>
      </ol>

      <h2 className="mt-8 text-xl font-semibold text-stone-900">Sobre conteúdos da Meta (Facebook/Instagram)</h2>
      <p className="mt-2 text-stone-700">
        Nosso site apenas <strong>incorpora</strong> conteúdos do Facebook e do Instagram e
        <strong> não utiliza Login da Meta</strong> nem armazena dados de contas da Meta. Para gerenciar ou excluir
        dados associados às suas contas nesses serviços, utilize:
      </p>
      <ul className="mt-3 list-disc pl-6 text-stone-700">
        <li>
          <strong>Facebook</strong>:{" "}
          <a
            href="https://www.facebook.com/settings?tab=applications"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Configurações &gt; Apps e sites
          </a>{" "}
          — remova o app/integração e siga as instruções para excluir dados.
        </li>
        <li>
          <strong>Instagram</strong>:{" "}
          <a
            href="https://www.instagram.com/accounts/manage_access/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Configurações &gt; Apps e sites
          </a>{" "}
          — revogue o acesso e gerencie os dados associados.
        </li>
        <li>
          Consulte também a{" "}
          <a
            href="https://www.facebook.com/privacy/policy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Política de Dados da Meta
          </a>
          .
        </li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold text-stone-900">Prazo e confirmação</h2>
      <p className="mt-2 text-stone-700">
        Responderemos ao seu pedido em até <strong>15 dias úteis</strong> (LGPD). Poderemos solicitar comprovação de
        identidade para proteger sua privacidade e, quando aplicável, enviaremos confirmação da exclusão.
      </p>

      <p className="mt-10 text-sm text-stone-500">Última atualização: 06/08/2025</p>
    </section>
  );
}
