import jsPDF from 'jspdf';

// Function to convert Polish characters to ASCII equivalents
const convertPolishToAscii = (text: string): string => {
  const polishChars: { [key: string]: string } = {
    'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
    'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
  };
  
  return text.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (char) => polishChars[char] || char);
};

// Function to convert all Polish text to ASCII
const convertAllPolishToAscii = (text: string): string => {
  if (!text) return text;
  return convertPolishToAscii(String(text));
};

export interface UserDataForPDF {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    birthDate?: string;
    phoneNumber?: string;
  };
  address: {
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
  };
  userType: string;
  privacySettings: any;
  cookieSettings: any;
  volunteerInfo?: any;
  coordinatorInfo?: any;
  organizationInfo?: any;
  createdAt: string;
  lastLoginAt: string;
}

export const generateUserDataPDF = (userData: UserDataForPDF): void => {
  console.log('PDF Generator: Starting PDF generation with data:', userData);
  
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;
    
    console.log('PDF Generator: jsPDF initialized successfully');

  // Helper function to add text with word wrap
  const addText = (text: string, x: number, y: number, maxWidth?: number) => {
    const convertedText = convertAllPolishToAscii(text);
    if (maxWidth) {
      const lines = doc.splitTextToSize(convertedText, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * 7);
    } else {
      doc.text(convertedText, x, y);
      return y + 7;
    }
  };

  // Helper function to add section header
  const addSectionHeader = (title: string, y: number) => {
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    yPosition = addText(convertAllPolishToAscii(title), 20, y, pageWidth - 40);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    return yPosition + 5;
  };

  // Helper function to add key-value pair
  const addKeyValue = (key: string, value: any, y: number) => {
    doc.setFont(undefined, 'bold');
    yPosition = addText(`${convertAllPolishToAscii(key)}:`, 20, y, pageWidth - 40);
    doc.setFont(undefined, 'normal');
    const valueStr = value !== null && value !== undefined ? convertAllPolishToAscii(String(value)) : 'Not provided';
    yPosition = addText(valueStr, 30, yPosition + 2, pageWidth - 50);
    return yPosition + 3;
  };

  // Title
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  yPosition = addText('Personal Data - GDPR', 20, yPosition, pageWidth - 40);
  yPosition += 10;

  // Date
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  yPosition = addText(`Generated: ${new Date().toLocaleString('en-US')}`, 20, yPosition, pageWidth - 40);
  yPosition += 15;

  // Personal Information
  yPosition = addSectionHeader('1. Dane Osobowe', yPosition);
  yPosition = addKeyValue('Imie', userData.personalInfo.firstName, yPosition);
  yPosition = addKeyValue('Nazwisko', userData.personalInfo.lastName, yPosition);
  yPosition = addKeyValue('Email', userData.personalInfo.email, yPosition);
  yPosition = addKeyValue('Data urodzenia', userData.personalInfo.birthDate, yPosition);
  yPosition = addKeyValue('Numer telefonu', userData.personalInfo.phoneNumber, yPosition);
  yPosition = addKeyValue('Typ uzytkownika', userData.userType, yPosition);
  yPosition += 10;

  // Address
  yPosition = addSectionHeader('2. Adres', yPosition);
  yPosition = addKeyValue('Ulica', userData.address.street, yPosition);
  yPosition = addKeyValue('Numer domu', userData.address.houseNumber, yPosition);
  yPosition = addKeyValue('Kod pocztowy', userData.address.postalCode, yPosition);
  yPosition = addKeyValue('Miasto', userData.address.city, yPosition);
  yPosition += 10;

  // User Type Specific Information
  if (userData.userType === 'wolontariusz' && userData.volunteerInfo) {
    yPosition = addSectionHeader('3. Informacje Wolontariusza', yPosition);
    yPosition = addKeyValue('Umiejetnosci', userData.volunteerInfo.skills?.join(', ') || 'Nie podano', yPosition);
    yPosition = addKeyValue('Zainteresowania', userData.volunteerInfo.interests?.join(', ') || 'Nie podano', yPosition);
    yPosition = addKeyValue('Dostepnosc', userData.volunteerInfo.availability?.join(', ') || 'Nie podano', yPosition);
    yPosition = addKeyValue('Doswiadczenie', userData.volunteerInfo.experience || 'Nie podano', yPosition);
    yPosition += 10;
  }

  if (userData.userType === 'koordynator' && userData.coordinatorInfo) {
    yPosition = addSectionHeader('3. Informacje Koordynatora', yPosition);
    yPosition = addKeyValue('Szkola', userData.coordinatorInfo.schoolInfo?.name || 'Nie podano', yPosition);
    yPosition = addKeyValue('Departament', userData.coordinatorInfo.department || 'Nie podano', yPosition);
    yPosition = addKeyValue('Stanowisko', userData.coordinatorInfo.position || 'Nie podano', yPosition);
    yPosition += 10;
  }

  if (userData.userType === 'organizacja' && userData.organizationInfo) {
    yPosition = addSectionHeader('3. Informacje Organizacji', yPosition);
    yPosition = addKeyValue('Nazwa organizacji', userData.organizationInfo.organizationName || 'Nie podano', yPosition);
    yPosition = addKeyValue('Typ organizacji', userData.organizationInfo.organizationType || 'Nie podano', yPosition);
    yPosition = addKeyValue('Numer KRS', userData.organizationInfo.krsNumber || 'Nie podano', yPosition);
    yPosition = addKeyValue('Opis', userData.organizationInfo.description || 'Nie podano', yPosition);
    yPosition += 10;
  }

  // Privacy Settings
  yPosition = addSectionHeader('4. Ustawienia Prywatności', yPosition);
  yPosition = addKeyValue('Widocznosc profilu', userData.privacySettings?.profileVisibility ? 'Tak' : 'Nie', yPosition);
  yPosition = addKeyValue('Sledzenie lokalizacji', userData.privacySettings?.locationTracking ? 'Tak' : 'Nie', yPosition);
  yPosition = addKeyValue('Analityka danych', userData.privacySettings?.dataAnalytics ? 'Tak' : 'Nie', yPosition);
  yPosition = addKeyValue('E-maile marketingowe', userData.privacySettings?.marketingEmails ? 'Tak' : 'Nie', yPosition);
  yPosition = addKeyValue('Powiadomienia push', userData.privacySettings?.notificationsPush ? 'Tak' : 'Nie', yPosition);
  yPosition = addKeyValue('Udostepnianie danych', userData.privacySettings?.dataSharing ? 'Tak' : 'Nie', yPosition);
  yPosition += 10;

  // Cookie Settings
  yPosition = addSectionHeader('5. Ustawienia Cookies', yPosition);
  yPosition = addKeyValue('Cookies niezbedne', userData.cookieSettings?.essential ? 'Tak' : 'Nie', yPosition);
  yPosition = addKeyValue('Cookies analityczne', userData.cookieSettings?.analytical ? 'Tak' : 'Nie', yPosition);
  yPosition = addKeyValue('Cookies marketingowe', userData.cookieSettings?.marketing ? 'Tak' : 'Nie', yPosition);
  yPosition += 10;

  // System Information
  yPosition = addSectionHeader('6. Informacje Systemowe', yPosition);
  yPosition = addKeyValue('Data utworzenia konta', userData.createdAt, yPosition);
  yPosition = addKeyValue('Ostatnie logowanie', userData.lastLoginAt, yPosition);
  yPosition = addKeyValue('ID uzytkownika', userData.personalInfo.email, yPosition);
  yPosition = addKeyValue('Status konta', 'Aktywne', yPosition);
  yPosition += 10;

  // Additional Sensitive Data
  yPosition = addSectionHeader('7. Dodatkowe Dane Wrażliwe', yPosition);
  yPosition = addKeyValue('Historia aktywnosci', 'Dostepna w systemie', yPosition);
  yPosition = addKeyValue('Preferencje komunikacji', userData.privacySettings?.marketingEmails ? 'E-maile marketingowe wlaczone' : 'E-maile marketingowe wylaczone', yPosition);
  yPosition = addKeyValue('Ustawienia powiadomien', userData.privacySettings?.notificationsPush ? 'Powiadomienia push wlaczone' : 'Powiadomienia push wylaczone', yPosition);
  yPosition = addKeyValue('Sledzenie lokalizacji', userData.privacySettings?.locationTracking ? 'Wlaczone' : 'Wylaczone', yPosition);
  yPosition += 10;

  // RODO Rights
  yPosition = addSectionHeader('8. Twoje Prawa Zgodnie z RODO', yPosition);
  const rodoRights = [
    'Prawo dostepu - mozesz zadac informacji o przetwarzaniu Twoich danych',
    'Prawo do sprostowania - mozesz zadac poprawienia nieprawidlowych danych',
    'Prawo do usuniecia - mozesz zadac usuniecia swoich danych',
    'Prawo do ograniczenia przetwarzania - mozesz zadac ograniczenia przetwarzania',
    'Prawo do przenoszenia danych - mozesz otrzymac swoje dane w formacie przenosnym',
    'Prawo sprzeciwu - mozesz sprzeciwic sie przetwarzaniu danych',
    'Prawo do cofniecia zgody - mozesz w kazdej chwili cofnac zgode'
  ];

  rodoRights.forEach(right => {
    yPosition = addText(`• ${right}`, 20, yPosition, pageWidth - 40);
  });

  // Security Notice
  yPosition += 10;
  yPosition = addSectionHeader('9. Informacja o Bezpieczeństwie', yPosition);
  const securityNotice = [
    'UWAGA: Ten dokument zawiera dane osobowe i wrazliwe.',
    'Przechowuj go w bezpiecznym miejscu i nie udostepniaj osobom nieupowaznionym.',
    'W przypadku utraty dokumentu, skontaktuj sie z administratorem systemu.',
    'Dokument wygenerowany automatycznie zgodnie z RODO.'
  ];

  securityNotice.forEach(notice => {
    yPosition = addText(`• ${notice}`, 20, yPosition, pageWidth - 40);
  });

  // Footer
  const footerY = pageHeight - 20;
  doc.setFontSize(8);
  doc.setFont(undefined, 'italic');
  doc.text('Ten dokument zostal wygenerowany automatycznie zgodnie z RODO.', 20, footerY);

  // Save the PDF
  const firstName = convertPolishToAscii(userData.personalInfo.firstName);
  const lastName = convertPolishToAscii(userData.personalInfo.lastName);
  const fileName = `personal-data-${firstName}-${lastName}-${new Date().toISOString().split('T')[0]}.pdf`;
  console.log('PDF Generator: Saving PDF with filename:', fileName);
  
  doc.save(fileName);
  console.log('PDF Generator: PDF saved successfully');
  
  } catch (error) {
    console.error('PDF Generator: Error generating PDF:', error);
    throw error;
  }
};

export const generateDataCollectionInfo = (): string => {
  return `
INFORMACJA O ZBIERANYCH DANYCH OSOBOWYCH

1. DANE PODSTAWOWE:
   - Imię i nazwisko
   - Adres e-mail
   - Data urodzenia (dla wolontariuszy)
   - Numer telefonu (opcjonalnie)
   - Adres zamieszkania

2. DANE KONTAKTOWE:
   - Adres e-mail (wymagany)
   - Numer telefonu (opcjonalnie)
   - Adres zamieszkania

3. DANE ZAWODOWE/EDUKACYJNE:
   - Nazwa szkoły (dla koordynatorów)
   - Nazwa organizacji (dla organizacji)
   - Numer KRS (dla organizacji)
   - Umiejętności i zainteresowania (dla wolontariuszy)

4. DANE TECHNICZNE:
   - Adres IP
   - Typ przeglądarki
   - System operacyjny
   - Cookies (zgodnie z preferencjami)

5. DANE UŻYTKOWANIA:
   - Historia logowań
   - Aktywność w aplikacji
   - Preferencje użytkownika
   - Ustawienia prywatności

6. CEL PRZETWARZANIA:
   - Świadczenie usług wolontariackich
   - Komunikacja z użytkownikami
   - Analiza i poprawa aplikacji
   - Marketing (za zgodą)

7. PODSTAWA PRAWNA:
   - Zgoda użytkownika (art. 6 ust. 1 lit. a RODO)
   - Wykonanie umowy (art. 6 ust. 1 lit. b RODO)
   - Prawnie uzasadniony interes (art. 6 ust. 1 lit. f RODO)

8. OKRES PRZECHOWYWANIA:
   - Dane osobowe: do momentu cofnięcia zgody lub usunięcia konta
   - Dane techniczne: maksymalnie 2 lata
   - Dane analityczne: zgodnie z ustawieniami cookies

9. ODBIORCY DANYCH:
   - Organizacje wolontariackie (za zgodą)
   - Koordynatorzy szkolni (za zgodą)
   - Dostawcy usług technicznych
   - Organy publiczne (w przypadkach przewidzianych prawem)

10. PRAWA UŻYTKOWNIKA:
    - Dostęp do danych
    - Sprostowanie danych
    - Usunięcie danych
    - Ograniczenie przetwarzania
    - Przenoszenie danych
    - Sprzeciw wobec przetwarzania
    - Cofnięcie zgody
  `;
};
