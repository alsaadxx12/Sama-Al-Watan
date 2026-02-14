
import { db } from './src/lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

async function inspectData() {
    console.log("Checking courses collection...");
    const q1 = query(collection(db, 'courses'), limit(5));
    const s1 = await getDocs(q1);
    console.log(`Found ${s1.size} courses`);
    s1.docs.forEach(doc => {
        console.log("Course:", doc.id, JSON.stringify(doc.data(), null, 2));
    });

    console.log("\nChecking companies collection...");
    const q2 = query(collection(db, 'companies'), limit(5));
    const s2 = await getDocs(q2);
    console.log(`Found ${s2.size} companies`);
    s2.docs.forEach(doc => {
        console.log("Company:", doc.id, JSON.stringify(doc.data(), null, 2));
    });
}

inspectData();
