import { createOffer } from '../firebase/firestore';

export const addSampleOffers = async () => {
  const sampleOffers = [
    {
      title: "Pomoc w schronisku dla zwierząt",
      description: "Codzienna opieka nad zwierzętami - karmienie, spacery, sprzątanie. Idealne dla miłośników zwierząt.",
      organization: "Fundacja Przyjaciół Zwierząt",
      organizationId: "org1",
      category: "Opieka nad zwierzętami",
      location: "ul. Schroniskowa 15, 31-506 Kraków",
      coordinates: {
        lat: 50.0647,
        lng: 19.9450
      },
      startDate: "2024-01-15",
      endDate: "2024-03-15",
      maxParticipants: 10,
      requirements: [
        "Miłość do zwierząt",
        "Dostępność w weekendy",
        "Podstawowa znajomość opieki nad zwierzętami"
      ],
      benefits: [
        "Doświadczenie w opiece nad zwierzętami",
        "Certyfikat wolontariatu",
        "Możliwość adopcji zwierząt"
      ],
      contactEmail: "wolontariat@fundacjazwierzat.pl",
      contactPhone: "+48 12 345 67 89",
      status: "active" as const,
      urgency: "medium" as const
    },
    {
      title: "Pakowanie paczek świątecznych",
      description: "Przygotowywanie paczek żywnościowych dla rodzin w potrzebie. Akcja świąteczna.",
      organization: "Caritas Kraków",
      organizationId: "org2",
      category: "Pomoc społeczna",
      location: "ul. Kanonicza 15, 31-002 Kraków",
      coordinates: {
        lat: 50.0556,
        lng: 19.9372
      },
      startDate: "2024-12-01",
      endDate: "2024-12-24",
      maxParticipants: 20,
      requirements: [
        "Dostępność w grudniu",
        "Chęć pomocy potrzebującym",
        "Podstawowa sprawność fizyczna"
      ],
      benefits: [
        "Satysfakcja z pomocy innym",
        "Doświadczenie w organizacji akcji charytatywnych",
        "Certyfikat wolontariatu"
      ],
      contactEmail: "wolontariat@caritas.krakow.pl",
      contactPhone: "+48 12 234 56 78",
      status: "active" as const,
      urgency: "high" as const
    },
    {
      title: "Zajęcia z dziećmi w świetlicy",
      description: "Prowadzenie zajęć plastycznych i gier dla dzieci w wieku 6-12 lat.",
      organization: "Stowarzyszenie Dziecięcy Uśmiech",
      organizationId: "org3",
      category: "Edukacja",
      location: "ul. Nowa 24, 31-506 Kraków",
      coordinates: {
        lat: 50.0647,
        lng: 19.9450
      },
      startDate: "2024-02-01",
      endDate: "2024-06-30",
      maxParticipants: 8,
      requirements: [
        "Doświadczenie w pracy z dziećmi",
        "Kreatywność",
        "Cierpliwość",
        "Dostępność popołudniami"
      ],
      benefits: [
        "Doświadczenie pedagogiczne",
        "Rozwój umiejętności interpersonalnych",
        "Certyfikat wolontariatu",
        "Możliwość stałej współpracy"
      ],
      contactEmail: "kontakt@dzieciecyusmiech.pl",
      contactPhone: "+48 12 345 67 90",
      status: "active" as const,
      urgency: "low" as const
    },
    {
      title: "Sprzątanie parku miejskiego",
      description: "Sprzątanie i porządkowanie terenów zielonych w parku. Akcja ekologiczna.",
      organization: "Ekolodia Kraków",
      organizationId: "org4",
      category: "Ekologia",
      location: "Park Jordana, 30-001 Kraków",
      coordinates: {
        lat: 50.0586,
        lng: 19.9444
      },
      startDate: "2024-04-22",
      endDate: "2024-04-22",
      maxParticipants: 30,
      requirements: [
        "Chęć dbania o środowisko",
        "Podstawowa sprawność fizyczna",
        "Dostępność w sobotę"
      ],
      benefits: [
        "Wkład w ochronę środowiska",
        "Doświadczenie w akcjach ekologicznych",
        "Certyfikat wolontariatu",
        "Spotkanie z innymi ekologami"
      ],
      contactEmail: "akcje@ekolodia.krakow.pl",
      contactPhone: "+48 12 456 78 90",
      status: "active" as const,
      urgency: "medium" as const
    },
    {
      title: "Nauka języka polskiego dla uchodźców",
      description: "Prowadzenie bezpłatnych lekcji języka polskiego dla osób potrzebujących.",
      organization: "Centrum Pomocy Uchodźcom",
      organizationId: "org5",
      category: "Edukacja",
      location: "ul. Koszykowa 61, 30-001 Kraków",
      coordinates: {
        lat: 50.0647,
        lng: 19.9450
      },
      startDate: "2024-01-08",
      endDate: "2024-12-20",
      maxParticipants: 12,
      requirements: [
        "Znajomość języka polskiego na poziomie native",
        "Cierpliwość i empatia",
        "Dostępność w tygodniu",
        "Podstawowe umiejętności dydaktyczne"
      ],
      benefits: [
        "Doświadczenie w nauczaniu",
        "Rozwój umiejętności komunikacyjnych",
        "Certyfikat wolontariatu",
        "Możliwość poznania innych kultur"
      ],
      contactEmail: "edukacja@cpu.krakow.pl",
      contactPhone: "+48 12 567 89 01",
      status: "active" as const,
      urgency: "high" as const
    }
  ];

  console.log('Adding sample offers to Firestore...');
  
  for (const offer of sampleOffers) {
    try {
      const offerId = await createOffer(offer);
      if (offerId) {
        console.log(`Created offer: ${offer.title} (ID: ${offerId})`);
      } else {
        console.error(`Failed to create offer: ${offer.title}`);
      }
    } catch (error) {
      console.error(`Error creating offer ${offer.title}:`, error);
    }
  }
  
  console.log('Sample offers added successfully!');
};
