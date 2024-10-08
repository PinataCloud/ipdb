import { pinata, publicClient, walletClient } from "@/utils/config";
import { account } from "@/utils/account";
import { abi } from "@/utils/contract.json";
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
	const { request: contractRequest } = await publicClient.simulateContract({
		account,
		address: import.meta.env.PUBLIC_CONTRACT_ADDRESS,
		abi: abi,
		functionName: "update",
		args: [`${upload.IpfsHash}`],
	});
	const tx = await walletClient.writeContract(contractRequest);
	console.log(tx);
})();
