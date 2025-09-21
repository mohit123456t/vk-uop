import { firestore } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

// Firestore me data save karne ka function
export async function saveDataToFirestore(collectionName, data) {
  try {
    const docRef = await addDoc(collection(firestore, collectionName), data);
    console.log('Document written with ID: ', docRef.id);
    return docRef.id;
  } catch (e) {
    console.error('Firestore error adding document:', e);
    if (e.code) {
      console.error('Firestore error code:', e.code);
    }
    if (e.message) {
      console.error('Firestore error message:', e.message);
    }
    throw e;
  }
}
