import { db } from '../firebase/config';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const removeDummyCalendarEvent = async () => {
  try {
    console.log('Removing dummy calendar events...');
    
    const eventsRef = collection(db, 'calendarEvents');
    const querySnapshot = await getDocs(eventsRef);
    
    let deletedCount = 0;
    
    querySnapshot.forEach(async (docSnapshot) => {
      const data = docSnapshot.data();
      // Remove events created by system or with "Caritas" in title
      if (data.createdBy === 'system' || data.title.includes('Caritas')) {
        await deleteDoc(doc(db, 'calendarEvents', docSnapshot.id));
        console.log('Deleted event:', data.title);
        deletedCount++;
      }
    });
    
    console.log(`Removed ${deletedCount} dummy calendar events`);
    
  } catch (error) {
    console.error('Error removing dummy calendar events:', error);
  }
};

// Run the function
removeDummyCalendarEvent();
