let db;
// Creates a new db request
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = (e) => {
   const db = e.target.result;
   const pendingStore = db.createObjectStore("pending", {
      autoIncrement: true,
   });
};

request.onsuccess = (e) => {
   db = e.target.result;
   if (navigator.onLine) checkDatabase();
};

request.onerror = (e) => {
   console.log(e.target.errorCode);
};

const saveRecord = (record) => {
   const transaction = db.transaction(["pending"], "readwrite");
   const pendingStore = transaction.objectStore("pending");
   pendingStore.add(record);
};

const checkDatabase = () => {
   const transaction = db.transaction(["pending"], "readwrite");
   const pendingStore = transaction.objectStore("pending");
   const getAll = pendingStore.getAll();

   getAll.onsuccess = async () => {
      if (getAll.result.length > 0) {
         const res = await fetch("/api/transaction/bulk", {
            method: "POST",
            body: JSON.stringify(getAll.result),
            headers: {
               Accept: "application/json, text/plain, */*",
               "Content-Type": "application/json"
            }
         });

         await res.json();
         const transaction = db.transaction(["pending"], "readwrite");
         const pendingStore = transaction.objectStore("pending");
         pendingStore.clear()
      };
   };
};

window.addEventListener("online", checkDatabase);
