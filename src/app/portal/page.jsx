import PortalClient from './PortalClient'; 

export const metadata = {
  title: "Portal | IEADSM",
  description: "Área de gerenciamento para ministros e administradores.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PortalPage() {
  return <PortalClient />;
}
