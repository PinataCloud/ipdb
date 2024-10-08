export async function checkDatabaseExists(dbName: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(dbName);

		request.onsuccess = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			db.close();
			resolve(true);
		};

		request.onerror = (event) => {
			reject(new Error("Error opening database"));
		};

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			db.close();
			resolve(false);
		};
	});
}
