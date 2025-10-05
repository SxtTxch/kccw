import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';

const addDummyCalendarEvent = async () => {
  try {
    // Get current date and add 2 days for this week
    const today = new Date();
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() + 2); // 2 days from now
    
    const dummyEvent = {
      title: "Spotkanie z Caritas Kraków",
      description: "Omówienie nowych projektów wolontariackich dla młodzieży",
      date: eventDate.toISOString().split('T')[0], // YYYY-MM-DD format
      time: "14:00",
      type: "meeting",
      location: "Sala konferencyjna, ul. Karmelicka 1",
      attendees: ["Ks. Jan Kowalski", "Mgr Anna Kowal"],
      status: "scheduled",
      createdBy: "system",
      createdAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'calendarEvents'), dummyEvent);
    console.log('Dummy calendar event added with ID:', docRef.id);
    console.log('Event details:', dummyEvent);
    
  } catch (error) {
    console.error('Error adding dummy calendar event:', error);
  }
};

// Run the function
addDummyCalendarEvent();
