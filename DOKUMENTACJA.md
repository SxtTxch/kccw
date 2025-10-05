# Krakowskie Serce - Dokumentacja Techniczna

## Spis treści
1. [Wprowadzenie](#wprowadzenie)
2. [Architektura systemu](#architektura-systemu)
3. [Stack technologiczny](#stack-technologiczny)
4. [Struktura projektu](#struktura-projektu)
5. [Funkcjonalności](#funkcjonalności)
6. [Instalacja i uruchomienie](#instalacja-i-uruchomienie)
7. [Konfiguracja](#konfiguracja)
8. [API i baza danych](#api-i-baza-danych)
9. [Bezpieczeństwo](#bezpieczeństwo)
10. [Dostępność](#dostępność)
11. [Deployment](#deployment)
12. [Rozwój i utrzymanie](#rozwój-i-utrzymanie)

## Wprowadzenie

**Krakowskie Serce** to platforma łącząca wolontariuszy, koordynatorów i organizacje w celu tworzenia znaczącego wpływu w Krakowie i poza nim. Aplikacja umożliwia efektywną współpracę między różnymi instytucjami, tworząc efekt synergii.

### Kluczowe innowacje

- **Współpraca wielu instytucji** - wzmocnienie sił w danej akcji poprzez współpracę
- **System bounty** - sponsorzy mogą finansować konkretne akcje wolontariackie
- **Wspomnienia - memory pins** - archiwum pozytywnych zmian i historii społeczności
- **System odznak** - gamifikacja postępów z osiągnięciami

## Architektura systemu

### Wzorzec architektoniczny
Aplikacja wykorzystuje wzorzec **Single Page Application (SPA)** z architekturą opartą na komponentach React.

### Główne warstwy
1. **Warstwa prezentacji** - React komponenty z TypeScript
2. **Warstwa logiki biznesowej** - Context API, custom hooks
3. **Warstwa danych** - Firebase Firestore, Authentication
4. **Warstwa infrastruktury** - Vercel hosting, CDN

### Diagram architektury
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Firebase      │    │   Vercel        │
│   (React SPA)   │◄──►│   - Auth        │    │   - Hosting     │
│                 │    │   - Firestore   │    │   - CDN         │
│   - Components  │    │   - Storage     │    │   - Analytics   │
│   - Context     │    │   - Functions   │    │                 │
│   - Hooks       │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Stack technologiczny

### Frontend
- **React 18.3.1** - nowoczesny framework UI
- **TypeScript** - bezpieczeństwo typów i lepsze doświadczenie deweloperskie
- **Vite 6.3.5** - szybkie narzędzie budowania
- **Tailwind CSS** - utility-first styling
- **Radix UI** - dostępne komponenty podstawowe

### Backend i usługi
- **Firebase Authentication** - uwierzytelnianie użytkowników
- **Firebase Firestore** - baza danych NoSQL
- **Firebase Storage** - przechowywanie plików
- **Firebase Functions** - funkcje serwerowe (opcjonalnie)

### Narzędzia deweloperskie
- **Lucide React** - ikony
- **jsPDF** - generowanie PDF
- **Recharts** - wykresy i analityka
- **React Hook Form** - zarządzanie formularzami

### Deployment
- **Vercel** - hosting i automatyczne wdrożenia
- **Git** - kontrola wersji

## Struktura projektu

```
src/
├── components/           # Komponenty React
│   ├── ui/              # Komponenty UI (Radix UI)
│   ├── VolunteerDashboard.tsx
│   ├── CoordinatorDashboard.tsx
│   ├── OrganizationDashboard.tsx
│   ├── Chat.tsx
│   ├── MapView.tsx
│   └── ...
├── contexts/            # Context API
│   ├── AuthContext.tsx
│   └── ChatContext.tsx
├── firebase/           # Konfiguracja Firebase
│   ├── config.ts
│   ├── auth.ts
│   └── firestore.ts
├── hooks/              # Custom hooks
│   └── useAnalytics.ts
├── utils/              # Funkcje pomocnicze
├── types/              # Definicje typów TypeScript
└── assets/             # Zasoby statyczne
```

## Funkcjonalności

### 1. System użytkowników

#### Typy użytkowników
- **Wolontariusz** - osoby pomagające w akcjach
- **Szkolny Koordynator Wolontariatu** - koordynatorzy w szkołach
- **Organizacja** - instytucje i organizacje pozarządowe

#### Rejestracja i uwierzytelnianie
- Rejestracja z walidacją wieku (min. 13 lat)
- Logowanie z zabezpieczeniem szyfrowaniem
- Walidacja typu użytkownika
- Zarządzanie sesją

### 2. Dashboardy użytkowników

#### Dashboard Wolontariusza
- Przeglądanie ofert wolontariackich
- Aplikowanie na oferty
- System odznak i osiągnięć
- Historia aktywności
- Mapa z lokalizacjami akcji
- Ustalanie wspólnych tras dojazdowych z innymi użytkownikami
- Ustawienia prywatności

#### Dashboard Koordynatora
- Zarządzanie uczniami
- Kontakt z organizacjami
- Analityka i raporty
- Komunikacja z wolontariuszami
- Zarządzanie szkołą

#### Dashboard Organizacji
- Tworzenie i zarządzanie ofertami
- Zarządzanie wolontariuszami
- System bounty i finansowania
- Analityka wpływu
- Współpraca z innymi organizacjami

### 3. System ofert wolontariackich

#### Tworzenie ofert
- Tytuł akcji
- Kategoria
- Opis oferty
- Wymagania
- Lokalizacja
- Termin
- Czas trwania
- Liczba potrzebnych osób
- Dane kontaktowe

#### Aplikowanie na oferty
- Filtrowanie i wyszukiwanie
- System zgłoszeń
- Zarządzanie aplikacjami
- Powiadomienia o statusie

### 4. System komunikacji

#### Chat w czasie rzeczywistym
- Komunikacja między wszystkimi typami użytkowników
- Grupy i kanały tematyczne
- Powiadomienia push
- Historia wiadomości

W wersji pokazowej trzeba manualnie odświeżać czat, ze względu na limit żądań w Firebase.

### 5. System mapy i lokalizacji

#### Interaktywna mapa
- Wizualizacja ofert wolontariackich
- Memory pins - wspomnienia z akcji
- Geolokalizacja
- Integracja z Google Maps

### 6. System odznak i gamifikacji

#### Odznaki
- Odznaki za uczestnictwo
- Odznaki za współpracę
- Odznaki za inicjatywę
- System poziomów i postępów

### 7. Analityka i raporty

#### Śledzenie wpływu
- Statystyki uczestnictwa
- Raporty dla koordynatorów
- Analityka dla organizacji
- Eksport danych do PDF

### 8. Ustawienia prywatności i RODO

#### Kontrola danych
- Zarządzanie danymi osobowymi
- Ustawienia prywatności
- Zgodność z RODO
- Zarządzanie cookies
- Eksport danych użytkownika

## Uprawnienia według ról

### Hierarchia uprawnień

```
Administrator
    ├── Pełny dostęp do systemu
    └── Zarządzanie wszystkimi rolami

Organizacja
    ├── Tworzenie i zarządzanie ofertami
    ├── Zarządzanie własnymi wolontariuszami
    ├── System bounty i finansowania
    ├── Zarządzanie współpracą z innymi organizacjami
    └── Analityka wpływu

Koordynator
    ├── Zarządzanie uczniami ze swojej szkoły
    ├── Zarządzanie szkołą
    ├── Analityka szkoły
    ├── Komunikacja z uczniami
    └── Komunikacja z organizacjami

Wolontariusz
    ├── Aplikowanie na oferty
    ├── System odznak i gamifikacji
    ├── Własna analityka
    ├── Tworzenie i zgłaszanie się do tras dojazdowych
    └── Komunikacja z innymi rolami
```

### Zasady bezpieczeństwa

#### Walidacja uprawnień
- **Walidacja typu użytkownika** - sprawdzanie roli przy logowaniu
- **Kontrola dostępu** - weryfikacja uprawnień przed akcjami
- **Izolacja danych** - użytkownicy widzą tylko swoje dane
- **Audit trail** - logowanie wszystkich działań

#### Ochrona danych wrażliwych
- **Szyfrowanie** - dane osobowe są szyfrowane
- **RODO compliance** - zgodność z przepisami o ochronie danych
- **Minimalizacja danych** - zbieranie tylko niezbędnych informacji
- **Prawa użytkownika** - możliwość eksportu i usunięcia danych

## Instalacja i uruchomienie

### Wymagania systemowe
- Node.js 18+ 
- npm lub yarn
- Konto Firebase
- Konto Vercel (opcjonalnie)

### Instalacja

```bash
# Klonowanie repozytorium
git clone https://github.com/SxtTxch/kccw
cd kccw-main

# Instalacja zależności
npm install

# Uruchomienie
npm run dev
```

### Konfiguracja środowiska

1. **Firebase Configuration**
   - Utwórz projekt w Firebase Console
   - Skopiuj konfigurację do `src/firebase/config.ts`
   - Włącz Authentication i Firestore

2. **Zmienne środowiskowe**
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   ```

## Konfiguracja

### Firebase Setup

#### Authentication
```
// Włącz metody uwierzytelniania
- Email/Password
```

#### Firestore Database
```
// Struktura kolekcji
users/           // Profile użytkowników
offers/          // Oferty wolontariackie
applications/    // Akcje wolontariackie
messages/        // Wiadomości chat
badges/          // System odznak
```

#### Security Rules
```javascript
// Przykładowe reguły bezpieczeństwa
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Vite Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

## API i baza danych

### Firestore Collections

#### Users Collection
```typescript
interface UserProfile {
  id: string;
  email: string;
  userType: 'wolontariusz' | 'koordynator' | 'organizacja';
  firstName: string;
  lastName: string;
  birthDate?: string;
  address: {
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
  };
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt: Date | null;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    language: string;
  };
  privacySettings: PrivacySettings;
  cookieSettings: CookieSettings;
}
```

#### Offers Collection
```typescript
interface Offer {
  id: string;
  title: string;
  description: string;
  organizationId: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  date: Date;
  maxVolunteers: number;
  currentVolunteers: number;
  requirements: string[];
  category: string;
  bounty?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Firebase Functions (opcjonalnie)

```typescript
// Przykładowa funkcja
export const sendNotification = functions.firestore
  .document('offers/{offerId}')
  .onCreate(async (snap, context) => {
    // Logika powiadomień
  });
```

### Walidacja danych
```typescript
// Przykład walidacji wieku
const validateAge = (birthDate: string): boolean => {
  const today = new Date();
  const birth = new Date(birthDate);
  const age = today.getFullYear() - birth.getFullYear();
  return age >= 13 && age <= 120;
};
```

## Dostępność

### Standardy WCAG 2.1
- Nawigacja klawiaturowa
- Wysoki kontrast (Alt + H)
- Skróty klawiaturowe (Alt + A)
- Screen reader support
- Semantyczne HTML

### Funkcje dostępności
```typescript
// Przykład obsługi skrótów klawiaturowych
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.altKey && event.key === 'a') {
      // Informacje o dostępności
    }
    if (event.altKey && event.key === 'h') {
      // Przełącz wysoki kontrast
    }
  };
}, []);
```

### Responsywność
- Mobile-first design
- Breakpoints dla różnych urządzeń
- Touch-friendly interface
- Optymalizacja dla małych ekranów

## Deployment

### Vercel Configuration

```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Automatyczne wdrożenia
- Połączenie z GitHub
- Automatyczne budowanie przy push do main
- Preview deploymentów dla PR
- Environment variable w Vercel

### Monitoring i Analytics
- Vercel Analytics
- Firebase Analytics
- Error tracking
- Performance monitoring

## Rozwój i utrzymanie

### Struktura kodu
- Komponenty funkcyjne z hookami
- TypeScript dla bezpieczeństwa typów
- Modularna architektura
- Separation of concerns

### Najlepsze praktyki
- ESLint i Prettier
- Konwencjonalne commity
- Proces code review
- Strategia testowania

### Dokumentacja kodu
```typescript
/**
 * Komponent dashboardu wolontariusza
 * @param user - profil użytkownika
 * @param onLogout - callback wylogowania
 */
interface VolunteerDashboardProps {
  user: User;
  onLogout: () => void;
}
```

### Rozwój funkcjonalności
1. **Faza 1** - Podstawowa funkcjonalność
2. **Faza 2** - System odznak i gamifikacja
3. **Faza 3** - Zaawansowana analityka
4. **Faza 4** - Integracje zewnętrzne

### Monitoring i utrzymanie
- Regularne aktualizacje zależności
- Monitoring błędów
- Optymalizacja wydajności
- Backup danych

---

