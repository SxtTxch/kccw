import { db } from '../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { UserOpinion, UserProfile } from '../firebase/firestore';

// Function to add dummy comments to a user
export const addDummyCommentsToUser = async (userId: string): Promise<boolean> => {
  try {
    console.log('Adding dummy comments to user:', userId);

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.error('User not found');
      return false;
    }

    const userData = userSnap.data() as UserProfile;
    const currentGivenOpinions = userData.givenOpinions || {
      totalOpinions: 0,
      opinions: []
    };

    // Create 3 dummy opinions
    const now = new Date();
    const dummyOpinions: UserOpinion[] = [
      {
        id: 'dummy1_' + Date.now(),
        targetUserId: 'dummy_volunteer_1',
        targetUserName: 'Anna Kowalska',
        comment: 'Świetny wolontariusz! Bardzo zaangażowany i pomocny. Polecam współpracę z Anną.',
        rating: 5,
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        id: 'dummy2_' + Date.now(),
        targetUserId: 'dummy_volunteer_2',
        targetUserName: 'Piotr Nowak',
        comment: 'Dobra współpraca, punktualny i rzetelny. Mały problem z komunikacją, ale ogólnie OK.',
        rating: 4,
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        id: 'dummy3_' + Date.now(),
        targetUserId: 'dummy_volunteer_3',
        targetUserName: 'Maria Wiśniewska',
        comment: 'Fantastyczna osoba! Bardzo kreatywna i ma świetne pomysły. Zawsze można na nią liczyć.',
        rating: 5,
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];

    // Add dummy opinions to existing ones
    const updatedOpinions = [...currentGivenOpinions.opinions, ...dummyOpinions];

    // Update user profile
    await updateDoc(userRef, {
      givenOpinions: {
        totalOpinions: updatedOpinions.length,
        opinions: updatedOpinions
      },
      updatedAt: serverTimestamp()
    });

    console.log('Dummy comments added successfully');
    return true;
  } catch (error) {
    console.error('Error adding dummy comments:', error);
    console.error('Error details:', error);
    return false;
  }
};

// Function to get user by email and add dummy comments
export const addDummyCommentsByEmail = async (email: string): Promise<boolean> => {
  try {
    console.log('Looking for user with email:', email);

    // Get all users and find by email
    const { collection, getDocs, query, where } = await import('firebase/firestore');
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error('No user found with email:', email);
      return false;
    }

    const userDoc = querySnapshot.docs[0];
    const userId = userDoc.id;
    
    console.log('Found user with ID:', userId);
    return await addDummyCommentsToUser(userId);
  } catch (error) {
    console.error('Error finding user by email:', error);
    return false;
  }
};
