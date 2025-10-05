// Convert Polish characters to ASCII equivalents for PDF generation
export const convertPolishToAscii = (text: string): string => {
  const polishChars: { [key: string]: string } = {
    'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
    'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
  };
  
  return text.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, (char) => polishChars[char] || char);
};

// Format date for reports
export const formatDateForReport = (date: Date): string => {
  return date.toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Get current month name in Polish
export const getCurrentMonthName = (): string => {
  const now = new Date();
  const months = [
    'styczen', 'luty', 'marzec', 'kwiecien', 'maj', 'czerwiec',
    'lipiec', 'sierpien', 'wrzesien', 'pazdziernik', 'listopad', 'grudzien'
  ];
  return months[now.getMonth()];
};
