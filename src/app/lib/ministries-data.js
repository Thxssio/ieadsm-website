// lib/ministries-data.js
import { Users, Megaphone, Smile, Heart, BookMarked, Music, UserCheck, Handshake, Stethoscope, Speaker, Radio, Globe2 } from 'lucide-react';

export const ministries = [
  { 
    id: 'depad', 
    name: "DEPAD – Departamento de Adolescentes", 
    icon: <Users size={20} />,
    description: "O DEPAD cuida do desenvolvimento espiritual e emocional dos adolescentes da IEADSM, promovendo cultos, encontros e atividades que os aproximam de Deus. Com foco em formação cristã e identidade, busca preparar essa geração para viver e servir com propósito.",
    schedule: "Encontros e cultos divulgados nos canais da igreja.",
    // --- Liderança ---
    leader: "Coord: Ev. Maurício Hillesheim e Aline Hillesheim", // Resumo para o card
    leaderPhoto: "/default.jpg",
    image: "/default-img.png",
    team: { // Lista completa
      "Coordenadores": ["Ev. Maurício Hillesheim e Aline Hillesheim"],
      "Supervisores": ["Anderson dos Santos e Annye Bittencourt", "Dc. Deivison Penteado e Sabrina Nunes", "Pb. Valmor Barrozo e Elizamara Barrozo"],
      "Conselheiros": ["Ir. Nilton Lopes e Neuza Lopes"]
    }
  },
  { 
    id: 'afinidade', 
    name: "AFINIDADE – Amigos Fiéis da Nova Idade", 
    icon: <Smile size={20} />,
    description: "Departamento voltado aos irmãos da melhor idade, promovendo integração, comunhão e cuidado espiritual. O AFINIDADE valoriza a sabedoria e a experiência dos idosos, oferecendo programações edificantes, encontros e ações de apoio mútuo.",
    schedule: "Programações e encontros anunciados previamente.",
    // --- Liderança ---
    leader: "Coord: Irmã Ondina de Oliveira Alves",
    leaderPhoto: "/default.jpg",
    image: "/default-img.png",
    team: {
      "Coordenadora": ["Irmã Ondina de Oliveira Alves"],
      "Supervisores": ["Pr. Joel Jardim e Elizabete Jardim", "Pb. André Tavares e Elza Tavares", "Dc. Hanilton Silva e Denise Silva"]
    }
  },
  { 
    id: 'acaoSocial', 
    name: "Ação Social", 
    icon: <Handshake size={20} />,
    description: "Com o compromisso de ser resposta prática ao amor de Cristo, a Ação Social desenvolve projetos de assistência a famílias em vulnerabilidade, campanhas solidárias e apoio emergencial. Seu foco é estender a mão e compartilhar esperança com quem mais precisa.",
    schedule: "As campanhas e ações são divulgadas nos cultos.",
    // --- Liderança ---
    leader: "Supervisão: Irmã Elizabete Jardim e Irmão João Vargas",
    leaderPhoto: "/default.jpg",
    image: "/default-img.png",
    team: {
      "Supervisores": ["Irmã Elizabete Jardim", "Irmão João Vargas"]
    }
  },
  { 
    id: 'capelania', 
    name: "Capelania", 
    icon: <Stethoscope size={20} />,
    description: "A Capelania atua em hospitais, presídios, abrigos e outros ambientes institucionais, levando consolo, oração e a Palavra de Deus àqueles que enfrentam momentos difíceis. Uma extensão do cuidado pastoral fora das quatro paredes da igreja.",
    schedule: "Visitas e ações conforme a necessidade.",
    // --- Liderança ---
    leader: "Supervisão: Ev. Roberto Belle e Cleo Belle",
    leaderPhoto: "/default.jpg",
    image: "/default-img.png",
    team: {
      "Supervisores": ["Ev. Roberto Belle e Cleo Belle", "Pb. Leonir dos Santos", "Pb. Altevir dos Santos", "Pb. Valdair de Paula"]
    }
  },
  { 
    id: 'decom', 
    name: "DECOM – Departamento de Comunicação", 
    icon: <Megaphone size={20} />,
    description: "Responsável por comunicar com excelência tudo o que Deus tem feito na IEADSM. O DECOM atua na produção de conteúdo, transmissões ao vivo, artes visuais, redes sociais e cobertura dos eventos, sempre com criatividade e compromisso com a verdade.",
    schedule: "Atuação contínua e durante todos os eventos.",
    // --- Liderança ---
    leader: "Supervisão: Irmão Samuel Calebe Bandeira",
    leaderPhoto: "/default.jpg",
    image: "/default-img.png",
    team: {
      "Supervisor": ["Irmão Samuel Calebe Bandeira"],
      "Auxiliares": ["Ismaias Mota da Silva e Ivana Bianchin", "Lucas Mucenecki"],
      "Diácono": ["Andrei Viana"],
      "Assessora": ["Irmã Ana Caroline Vieira Obem"],
      "Conselheiros": ["Ev. Paulo Mucenecki e Cláudia Mucenecki"]
    }
  },
  { 
    id: 'discipulado', 
    name: "Discipulado", 
    icon: <UserCheck size={20} />,
    description: "Departamento que acompanha os novos convertidos, ensinando os princípios da fé cristã e auxiliando no processo de integração à igreja. O Discipulado é um elo importante entre a decisão por Cristo e a caminhada madura na fé.",
    schedule: "Classes e encontros para novos membros.",
    // --- Liderança ---
    leader: "Supervisão: Ev. Wladimir Carvalho e Liege Carvalho",
    leaderPhoto: "/default.jpg",
    image: "/default-img.png",
    team: {
      "Supervisores": ["Ev. Wladimir Carvalho e Liege Carvalho", "Ir. Leonardo Lopes da Silva e Alexandra Severo M. da Silva", "Dc. Dorval Oliveira da Silva e Elenara Santos da Silva"]
    }
  },
  { 
    id: 'ebd', 
    name: "EBD e Educação Cristã", 
    icon: <BookMarked size={20} />,
    description: "A Escola Bíblica Dominical é o braço de ensino da IEADSM, oferecendo classes para todas as idades e promovendo o estudo sistemático da Palavra de Deus. A Educação Cristã busca aprofundar o conhecimento bíblico e fortalecer a fé da igreja.",
    schedule: "Todos os domingos pela manhã.",
    // --- Liderança ---
    leader: "Supervisão: Irmã Cláudia Mucenecki e Pr. Luiz Carvalho dos Santos",
    leaderPhoto: "/default.jpg",
    image: "/default-img.png",
    team: {
      "Supervisores": ["Irmã Cláudia Mucenecki", "Pr. Luiz Carvalho dos Santos", "Ev. João Carlos Trindade", "Pb. Otoniel Borba da Silva"],
      "Conselheiras": ["Irmã Ondina Alves", "Irmã Diná Pacheco"]
    }
  },
  { 
    id: 'evangelismo', 
    name: "Evangelismo", 
    icon: <Speaker size={20} />,
    description: "Com paixão pelas almas, o Departamento de Evangelismo realiza ações evangelísticas em bairros, praças, hospitais e eventos, anunciando com ousadia a salvação em Jesus Cristo. Seu lema é: “Como ouvirão, se não há quem pregue?”",
    schedule: "Ações evangelísticas anunciadas nos cultos.",
    // --- Liderança ---
    leader: "Coord: Ev. Daniel dos Santos",
    leaderPhoto: "/default.jpg",
    image: "/default-img.png",
    team: {
      "Coordenador": ["Ev. Daniel dos Santos"],
      "Supervisores": ["Ev. Artur Paula da Silva", "Ev. Antonio Dalmiro da Silva", "Ev. Alexandre Beck", "Ev. Marcílio Ruíz Bissoli", "Ev. Mauro Tiago de Freitas", "Pb. Jairo Santos de Lima"]
    }
  },
  { 
    id: 'defam', 
    name: "DEFAM – Departamento da Família", 
    icon: <Heart size={20} />,
    description: "O DEFAM atua na edificação de lares segundo os princípios bíblicos, promovendo encontros, palestras e aconselhamentos para casais, pais e filhos. Seu objetivo é fortalecer as famílias como alicerce da igreja e da sociedade.",
    schedule: "Encontros e palestras divulgados previamente.",
    // --- Liderança ---
    leader: "Supervisão: Ev. Alexandre Flores e Marinês Sganzerla",
    leaderPhoto: "/default.jpg",
    image: "/default-img.png",
    team: {
      "Supervisores": ["Ev. Alexandre Flores e Marinês Sganzerla", "Pr. Cláudio Moisés Ferreira e Elisângela Ferreira", "Ev. Rodrigo Lopes e Simei Leal Oliveira", "Ir. Renato Pereira e Cássia Lauane P. de Jesus"]
    }
  },
  { 
    id: 'depinf', 
    name: "DEPINF – Departamento Infantil", 
    icon: <Smile size={20} />,
    description: "O DEPINF tem como missão evangelizar, ensinar e cuidar das crianças, conduzindo-as ao conhecimento de Deus desde os primeiros passos. Com linguagem acessível e atividades criativas, forma corações firmes no caminho do Senhor.",
    schedule: "Atividades durante os cultos principais.",
    // --- Liderança ---
    leader: "Coord: Irmã Aline Hillesheim",
    leaderPhoto: "/default.jpg",
    image: "/default-img.png",
    team: {
      "Coordenadora": ["Irmã Aline Hillesheim"],
      "Supervisoras": ["Irmã Camila Patzlaff Dias", "Irmã Juliana Barreto"]
    }
  },
  { 
    id: 'missoes', 
    name: "Missões", 
    icon: <Globe2 size={20} />,
    description: "O Departamento de Missões mobiliza a igreja para alcançar os confins da terra, apoiando missionários e promovendo ações de envio e sustento. Com fervor evangelístico, vive o compromisso de expandir o Reino de Deus em todas as nações.",
    schedule: "Cultos de missões e campanhas específicas.",
    // --- Liderança ---
    leader: "Supervisão: Ev. Jorge Souza da Silva",
    leaderPhoto: "/default.jpg",
    image: "/default-img.png",
    team: {
      "Supervisores": ["Ev. Jorge Souza da Silva", "Ev. Auderson Viera", "Ev. Alcemir Silva", "Ev. José Locateli"]
    }
  },
  { 
    id: 'musica', 
    name: "Música", 
    icon: <Music size={20} />,
    description: "Responsável pela organização e formação dos ministérios de louvor, corais e músicos da IEADSM. O Departamento de Música busca excelência na adoração, conduzindo a igreja à presença de Deus através dos cânticos espirituais e inspiração musical.",
    schedule: "Ensaios e escalas definidos internamente.",
    // --- Liderança ---
    leader: "Coord: Ev. Paulo Mucenecki e Cláudia Mucenecki",
    leaderPhoto: "/default.jpg",
    image: "/default-img.png",
    team: {
      "Coordenadores": ["Ev. Paulo Mucenecki e Cláudia Mucenecki"],
      "Supervisores": ["Ir. Rodrigo Dias", "Dc. Abner Lamberty", "Dc. Everton Scherer", "Pb. Diego Nunes"]
    }
  },
  { 
    id: 'voz', 
    name: "Programa “A Voz da Assembleia de Deus”", 
    icon: <Radio size={20} />,
    description: "Canal oficial de comunicação da IEADSM com a cidade, o programa leva mensagens, louvores e informações relevantes através do rádio e de plataformas digitais, sendo uma poderosa ferramenta de evangelismo e edificação.",
    schedule: "Consulte a programação da rádio local.",
    // --- Liderança ---
    leader: "Supervisão: Ev. Paulo Mucenecki",
    leaderPhoto: "/default.jpg",
    image: "/default-img.png",
    team: {
      "Supervisores": ["Ev. Paulo Mucenecki", "Aux. Lucas Mucenecki"]
    }
  },
  { 
    id: 'ufadesma', 
    name: "UFADESMA – União Feminina", 
    icon: <Users size={20} />,
    description: "União que reúne as irmãs da IEADSM em comunhão, serviço e oração. A UFADESMA promove congressos, encontros, discipulados e ações sociais, fortalecendo as mulheres em seu chamado espiritual e papel na obra do Senhor.",
    schedule: "Congressos, chás e círculos de oração.",
    // --- Liderança ---
    leader: "Coord: Irmã Miriã Lamberty",
    leaderPhoto: "/default.jpg",
    image: "/default-img.png",
    team: {
      "Coordenadora": ["Irmã Miriã Lamberty"],
      "Supervisoras": ["Irmã Elizabete Jardim", "Irmã Cleo Belle", "Irmã Lenir Souza"]
    }
  },
  { 
    id: 'umadesma', 
    name: "UMADESMA – União da Mocidade", 
    icon: <Users size={20} />,
    description: "A UMADESMA é o departamento que reúne a juventude da igreja em torno de propósitos eternos. Promove cultos, congressos, ações evangelísticas e sociais, despertando uma geração santa, avivada e disposta a fazer a diferença.",
    schedule: "Cultos e congressos anunciados nos canais oficiais.",
    // --- Liderança ---
    leader: "Coord: Ev. Angelo Rogério e Liliana Oviedo",
    leaderPhoto: "/default.jpg",
    image: "/default-img.png",
    team: {
      "Coordenadores": ["Ev. Angelo Rogério e Liliana Oviedo"],
      "Supervisores": ["Pb. Alan Patrick da Silva e Whenita Pimentel", "Pb. Fabricio Mello e Camila Marx", "Dc. João Romeu Derzette e Lauzemar Derzette"]
    }
  },
];