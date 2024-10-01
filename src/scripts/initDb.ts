import { pinata } from "../utils/pinata";
import { PGlite } from "@electric-sql/pglite";

(async () => {
	const db = new PGlite();
	await db.exec(`
    CREATE TABLE IF NOT EXISTS todo (
      id SERIAL PRIMARY KEY,
      task TEXT,
      done BOOLEAN DEFAULT false
    );
  `);
	const file = (await db.dumpDataDir("auto")) as File;
	const upload = await pinata.upload.file(file);
	console.log(upload);
})();
