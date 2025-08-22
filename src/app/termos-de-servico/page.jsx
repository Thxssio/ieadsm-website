export const metadata = {
  title: "Termos de Serviço | IEADSM",
  description:
    "Termos de uso do site da Igreja Evangélica Assembleia de Deus de Santa Maria – RS.",
};

export default function TermosDeServicoPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-900">Termos de Serviço</h1>

      <p className="mt-4 text-stone-700">
        Estes Termos regulam o uso do site da Igreja Evangélica Assembleia de Deus de Santa Maria – RS
        (“IEADSM”). Ao acessar ou utilizar o site, você concorda com estes Termos.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-stone-900">1. Quem somos</h2>
      <p className="mt-2 text-stone-700">
        IEADSM é uma organização religiosa sem fins lucrativos. O site tem caráter informativo e
        institucional, para divulgar atividades, eventos e conteúdos da igreja.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-stone-900">2. Uso do site</h2>
      <ul className="mt-2 list-disc pl-6 text-stone-700">
        <li>Não é permitido usar o site para fins ilegais, difamatórios, abusivos ou que violem direitos de terceiros.</li>
        <li>É proibido tentar burlar medidas de segurança, realizar varreduras ou explorar vulnerabilidades.</li>
        <li>Podemos modificar, suspender ou encerrar funcionalidades a qualquer momento, sem aviso prévio.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold text-stone-900">3. Conteúdos incorporados (Meta/Facebook/Instagram)</h2>
      <p className="mt-2 text-stone-700">
        Nosso site pode <strong>incorporar</strong> conteúdos de terceiros (como Facebook, Instagram e Threads).
        Esses serviços podem coletar dados conforme suas próprias políticas. O uso desses conteúdos está
        sujeito também aos termos e políticas dessas plataformas.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-stone-900">4. Propriedade intelectual</h2>
      <p className="mt-2 text-stone-700">
        Salvo indicação em contrário, textos, imagens e marcas exibidos no site pertencem à IEADSM ou a
        seus licenciadores e são protegidos por direitos autorais e outras leis. É vedada a reprodução sem
        autorização prévia, exceto nos limites do uso justo permitido por lei.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-stone-900">5. Formulários e comunicações</h2>
      <p className="mt-2 text-stone-700">
        Ao enviar informações por formulários (ex.: contato/inscrição), você declara que são verdadeiras e
        autoriza o uso para atendimento às finalidades do próprio formulário. Para saber como tratamos dados
        pessoais, consulte nossa{" "}
        <a href="/politica-de-privacidade" className="underline">
          Política de Privacidade
        </a>{" "}
        e, se desejar, solicite{" "}
        <a href="/excluir-dados" className="underline">
          exclusão de dados
        </a>
        .
      </p>

      <h2 className="mt-8 text-xl font-semibold text-stone-900">6. Cookies e analytics</h2>
      <p className="mt-2 text-stone-700">
        Podemos utilizar cookies estritamente necessários ao funcionamento do site e métricas básicas de
        acesso. Detalhes e controles estão na{" "}
        <a href="/politica-de-privacidade" className="underline">
          Política de Privacidade
        </a>
        .
      </p>

      <h2 className="mt-8 text-xl font-semibold text-stone-900">7. Isenções e limitações de responsabilidade</h2>
      <p className="mt-2 text-stone-700">
        O site é fornecido “no estado em que se encontra”, sem garantias de disponibilidade contínua ou de
        ausência de erros. Na extensão permitida pela legislação aplicável, a IEADSM não se responsabiliza
        por danos indiretos, incidentais ou consequenciais decorrentes do uso ou da impossibilidade de uso
        do site ou de conteúdos de terceiros incorporados.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-stone-900">8. Links de terceiros</h2>
      <p className="mt-2 text-stone-700">
        Links externos são fornecidos por conveniência e não constituem endosso. Não controlamos nem
        respondemos pelo conteúdo de sites de terceiros.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-stone-900">9. Alterações</h2>
      <p className="mt-2 text-stone-700">
        Podemos atualizar estes Termos periodicamente. A versão vigente é a publicada nesta página. O uso
        contínuo do site após mudanças implica concordância com os Termos atualizados.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-stone-900">10. Contato</h2>
      <p className="mt-2 text-stone-700">
        Dúvidas sobre estes Termos:{" "}
        <a href="mailto:contato@adsantamariars.com.br" className="underline">
          contato@adsantamariars.com.br
        </a>
        .
      </p>

      <h2 className="mt-8 text-xl font-semibold text-stone-900">11. Foro e legislação aplicável</h2>
      <p className="mt-2 text-stone-700">
        Aplica-se a legislação brasileira. Fica eleito o foro de Santa Maria/RS, com renúncia a qualquer
        outro, por mais privilegiado que seja, salvo competência legal diversa.
      </p>

      <p className="mt-10 text-sm text-stone-500">Última atualização: 22/08/2025</p>
    </section>
  );
}
