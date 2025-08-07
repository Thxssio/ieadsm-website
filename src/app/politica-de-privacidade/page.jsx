export const metadata = {
  title: "Política de Privacidade | IEADSM",
  description:
    "Política de Privacidade da Igreja Evangélica Assembleia de Deus de Santa Maria – RS.",
};

export default function PoliticaDePrivacidadePage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-900">Política de Privacidade</h1>
      <p className="mt-4 text-stone-700">
        <strong>Quem somos:</strong> Igreja Evangélica Assembleia de Deus de Santa Maria – RS (IEADSM).
      </p>

      <h2 className="mt-8 text-xl font-semibold text-stone-900">Coleta de dados</h2>
      <p className="mt-2 text-stone-700">
        Este site pode coletar dados técnicos de navegação (endereço IP, data/horário, páginas
        acessadas e user agent) para segurança e estatística. Quando você preenche formulários (ex.:
        contato/inscrição), coletamos os dados informados nesses formulários (nome, e-mail, mensagem).
      </p>

      <h2 className="mt-8 text-xl font-semibold text-stone-900">Conteúdos incorporados</h2>
      <p className="mt-2 text-stone-700">
        Páginas deste site podem exibir conteúdos do Facebook e Instagram. Esses provedores podem
        coletar dados conforme suas próprias políticas. Consulte a{" "}
        <a
          href="https://www.facebook.com/privacy/policy"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Política de Dados da Meta
        </a>.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-stone-900">Base legal</h2>
      <p className="mt-2 text-stone-700">
        Utilizamos as bases legais de <em>legítimo interesse</em> (funcionamento e segurança do site)
        e <em>consentimento</em> quando aplicável (ex.: envio de formulário).
      </p>

      <h2 className="mt-8 text-xl font-semibold text-stone-900">Uso e compartilhamento</h2>
      <p className="mt-2 text-stone-700">
        Usamos os dados para atender solicitações, melhorar o site e cumprir obrigações legais. Não
        vendemos dados. Podemos usar provedores como hospedagem, CDN, e serviços de e-mail.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-stone-900">Retenção</h2>
      <p className="mt-2 text-stone-700">
        Mantemos os dados pelo tempo necessário às finalidades informadas ou conforme exigências legais.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-stone-900">Direitos do titular (LGPD)</h2>
      <p className="mt-2 text-stone-700">
        Você pode solicitar acesso, correção, portabilidade, anonimização, oposição e{" "}
        <a href="/excluir-dados" className="underline">
          exclusão dos seus dados
        </a>
        .
      </p>

      <h2 className="mt-8 text-xl font-semibold text-stone-900">Contato (Encarregado/DPO)</h2>
      <p className="mt-2 text-stone-700">
        E-mail:{" "}
        <a href="mailto:contato@adsantamariars.com.br" className="underline">
          contato@adsantamariars.com.br
        </a>
      </p>

      <p className="mt-10 text-sm text-stone-500">
        Última atualização: 06/08/2025
      </p>
    </section>
  );
}
