import jsPDF from 'jspdf';
import { convertPolishToAscii, formatDateForReport, getCurrentMonthName } from './textUtils';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  volunteerHours: number;
  totalProjects: number;
  ratings?: {
    averageRating: number;
    totalRatings: number;
  };
  status?: string;
  isActive?: boolean;
}

interface Organization {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  activeProjects: number;
  status: string;
}

interface Offer {
  id: string;
  title: string;
  organization: string;
  startDate: string;
  endDate: string;
  currentParticipants: number;
  maxParticipants: number;
  status: string;
}

interface Certificate {
  id: string;
  studentName: string;
  projectTitle: string;
  status: string;
  submittedDate: string;
}

// Generate Monthly Report
export const generateMonthlyReport = (
  students: Student[],
  offers: Offer[],
  organizations: Organization[],
  stats: any
): void => {
  const doc = new jsPDF();
  const currentMonth = getCurrentMonthName();
  const currentYear = new Date().getFullYear();
  
  // Header
  doc.setFontSize(20);
  doc.text(convertPolishToAscii(`Raport Miesieczny - ${currentMonth} ${currentYear}`), 20, 30);
  
  // Statistics section
  doc.setFontSize(16);
  doc.text(convertPolishToAscii('Statystyki Ogolne'), 20, 50);
  
  doc.setFontSize(12);
  let yPos = 60;
  doc.text(convertPolishToAscii(`Lacznie uczniow: ${stats.totalStudents}`), 20, yPos);
  yPos += 10;
  doc.text(convertPolishToAscii(`Aktywni uczniowie: ${stats.activeStudents}`), 20, yPos);
  yPos += 10;
  doc.text(convertPolishToAscii(`Laczne godziny wolontariatu: ${stats.totalHours}`), 20, yPos);
  yPos += 10;
  doc.text(convertPolishToAscii(`Aktywne oferty: ${stats.activeProjects}`), 20, yPos);
  yPos += 10;
  doc.text(convertPolishToAscii(`Organizacje partnerskie: ${stats.activeOrganizations}`), 20, yPos);
  
  // Top students section
  yPos += 20;
  doc.setFontSize(16);
  doc.text(convertPolishToAscii('Najaktywniejsi Uczniowie'), 20, yPos);
  
  const topStudents = students
    .sort((a, b) => (b.volunteerHours || 0) - (a.volunteerHours || 0))
    .slice(0, 10);
  
  yPos += 15;
  doc.setFontSize(10);
  topStudents.forEach((student, index) => {
    const studentName = convertPolishToAscii(`${student.firstName} ${student.lastName}`);
    const hours = student.volunteerHours || 0;
    doc.text(`${index + 1}. ${studentName} - ${hours} godzin`, 20, yPos);
    yPos += 8;
  });
  
  // Footer
  doc.setFontSize(8);
  doc.text(convertPolishToAscii(`Wygenerowano: ${formatDateForReport(new Date())}`), 20, 280);
  
  doc.save(convertPolishToAscii(`raport_miesieczny_${currentMonth}_${currentYear}.pdf`));
};

// Generate Student Activity Report
export const generateActivityReport = (students: Student[]): void => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text(convertPolishToAscii('Raport Aktywnosci Uczniow'), 20, 30);
  
  doc.setFontSize(12);
  doc.text(convertPolishToAscii(`Liczba uczniow: ${students.length}`), 20, 50);
  
  // Student table
  let yPos = 70;
  doc.setFontSize(10);
  
  // Table headers
  doc.text(convertPolishToAscii('Lp.'), 20, yPos);
  doc.text(convertPolishToAscii('Imie Nazwisko'), 30, yPos);
  doc.text(convertPolishToAscii('Email'), 80, yPos);
  doc.text(convertPolishToAscii('Godziny'), 130, yPos);
  doc.text(convertPolishToAscii('Projekty'), 150, yPos);
  doc.text(convertPolishToAscii('Ocena'), 170, yPos);
  doc.text(convertPolishToAscii('Status'), 190, yPos);
  
  yPos += 10;
  
  students.forEach((student, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    const studentName = convertPolishToAscii(`${student.firstName} ${student.lastName}`);
    const email = convertPolishToAscii(student.email);
    const hours = student.volunteerHours || 0;
    const projects = student.totalProjects || 0;
    const rating = student.ratings?.averageRating || 0;
    const status = convertPolishToAscii(student.status || 'aktywny');
    
    doc.text(`${index + 1}.`, 20, yPos);
    doc.text(studentName, 30, yPos);
    doc.text(email, 80, yPos);
    doc.text(hours.toString(), 130, yPos);
    doc.text(projects.toString(), 150, yPos);
    doc.text(rating.toFixed(1), 170, yPos);
    doc.text(status, 190, yPos);
    
    yPos += 8;
  });
  
  // Footer
  doc.setFontSize(8);
  doc.text(convertPolishToAscii(`Wygenerowano: ${formatDateForReport(new Date())}`), 20, 280);
  
  doc.save(convertPolishToAscii('raport_aktywnosci_uczniow.pdf'));
};

// Generate Partner Organizations Report
export const generateOrganizationsReport = (organizations: Organization[]): void => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text(convertPolishToAscii('Raport Organizacji Partnerskich'), 20, 30);
  
  doc.setFontSize(12);
  doc.text(convertPolishToAscii(`Liczba organizacji: ${organizations.length}`), 20, 50);
  
  // Organizations table
  let yPos = 70;
  doc.setFontSize(10);
  
  // Table headers
  doc.text(convertPolishToAscii('Lp.'), 20, yPos);
  doc.text(convertPolishToAscii('Nazwa'), 30, yPos);
  doc.text(convertPolishToAscii('Osoba Kontaktowa'), 80, yPos);
  doc.text(convertPolishToAscii('Email'), 130, yPos);
  doc.text(convertPolishToAscii('Projekty'), 170, yPos);
  doc.text(convertPolishToAscii('Status'), 190, yPos);
  
  yPos += 10;
  
  organizations.forEach((org, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    const orgName = convertPolishToAscii(org.name);
    const contactPerson = convertPolishToAscii(org.contactPerson);
    const email = convertPolishToAscii(org.email);
    const projects = org.activeProjects;
    const status = convertPolishToAscii(org.status);
    
    doc.text(`${index + 1}.`, 20, yPos);
    doc.text(orgName, 30, yPos);
    doc.text(contactPerson, 80, yPos);
    doc.text(email, 130, yPos);
    doc.text(projects.toString(), 170, yPos);
    doc.text(status, 190, yPos);
    
    yPos += 8;
  });
  
  // Footer
  doc.setFontSize(8);
  doc.text(convertPolishToAscii(`Wygenerowano: ${formatDateForReport(new Date())}`), 20, 280);
  
  doc.save(convertPolishToAscii('raport_organizacji_partnerskich.pdf'));
};

// Generate Certificates Report
export const generateCertificatesReport = (certificates: Certificate[]): void => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text(convertPolishToAscii('Raport Zaswiadczen'), 20, 30);
  
  const pendingCount = certificates.filter(c => c.status === 'pending').length;
  const approvedCount = certificates.filter(c => c.status === 'approved').length;
  const rejectedCount = certificates.filter(c => c.status === 'rejected').length;
  
  doc.setFontSize(12);
  doc.text(convertPolishToAscii(`Lacznie zaswiadczen: ${certificates.length}`), 20, 50);
  doc.text(convertPolishToAscii(`Oczekujace: ${pendingCount}`), 20, 60);
  doc.text(convertPolishToAscii(`Zatwierdzone: ${approvedCount}`), 20, 70);
  doc.text(convertPolishToAscii(`Odrzucone: ${rejectedCount}`), 20, 80);
  
  // Certificates table
  let yPos = 100;
  doc.setFontSize(10);
  
  // Table headers
  doc.text(convertPolishToAscii('Lp.'), 20, yPos);
  doc.text(convertPolishToAscii('Uczen'), 30, yPos);
  doc.text(convertPolishToAscii('Projekt'), 80, yPos);
  doc.text(convertPolishToAscii('Status'), 130, yPos);
  doc.text(convertPolishToAscii('Data'), 160, yPos);
  
  yPos += 10;
  
  certificates.forEach((cert, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    const studentName = convertPolishToAscii(cert.studentName);
    const projectTitle = convertPolishToAscii(cert.projectTitle);
    const status = convertPolishToAscii(
      cert.status === 'pending' ? 'Oczekuje' :
      cert.status === 'approved' ? 'Zatwierdzone' : 'Odrzucone'
    );
    const date = new Date(cert.submittedDate).toLocaleDateString('pl-PL');
    
    doc.text(`${index + 1}.`, 20, yPos);
    doc.text(studentName, 30, yPos);
    doc.text(projectTitle, 80, yPos);
    doc.text(status, 130, yPos);
    doc.text(date, 160, yPos);
    
    yPos += 8;
  });
  
  // Footer
  doc.setFontSize(8);
  doc.text(convertPolishToAscii(`Wygenerowano: ${formatDateForReport(new Date())}`), 20, 280);
  
  doc.save(convertPolishToAscii('raport_zaswiadczen.pdf'));
};
