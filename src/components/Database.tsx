import { PGlite } from "@electric-sql/pglite";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { publicClient, pinata } from "@/utils/config";
import { abi } from "@/utils/contract.json";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useToast } from "@/hooks/use-toast";

let db: PGlite | undefined;

interface ToDo {
	id: number;
	task: string;
	done: boolean;
}

export default function Database() {
	const [todos, setTodos]: any = useState([]);
	const [taskName, setTaskName] = useState("");
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const { toast } = useToast();

	async function checkDatabaseExists(dbName: string): Promise<boolean> {
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

	async function importDb() {
		try {
			setLoading(true);
			const dbCid = await publicClient.readContract({
				address: import.meta.env.PUBLIC_CONTRACT_ADDRESS,
				abi: abi,
				functionName: "getState",
			});
			console.log(dbCid);
			const dbExists = await checkDatabaseExists("todo-db");
			if (!dbExists) {
				const dbFile = await pinata.gateways.get(dbCid as unknown as string);
				const file = dbFile.data as Blob;
				db = new PGlite({
					loadDataDir: file,
					dataDir: "idb://todo-db",
				});
				console.log("used remote db");
			} else {
				db = new PGlite({
					dataDir: "idb://todo-db",
				});
				console.log("used local db");
			}
			const ret = await db?.query(`
				SELECT * from todo ORDER BY id ASC;
			`);
			setTodos(ret?.rows);
			toast({
				title: "Database Restored",
			});
			setLoading(false);
		} catch (error) {
			setLoading(false);
			console.log(error);
		}
	}

	async function addTodo() {
		try {
			await db?.query("INSERT INTO todo (task, done) VALUES ($1, false)", [
				taskName,
			]);
			const ret = await db?.query(`
        SELECT * from todo;
      `);
			setTodos(ret?.rows as ToDo[]);
			setTaskName("");
			console.log(ret?.rows);
		} catch (error) {
			console.log(error);
		}
	}

	async function updateTodo(id: number, done: boolean) {
		try {
			await db?.query("UPDATE todo SET done = $1 WHERE id = $2", [done, id]);
			const ret = await db?.query("SELECT * from todo ORDER BY ID ASC;");
			setTodos(ret?.rows as ToDo[]);
		} catch (error) {
			console.log(error);
		}
	}
	async function deleteTodo(id: number) {
		try {
			await db?.query("DELETE FROM todo WHERE id = $1", [id]);
			const ret = await db?.query("SELECT * from todo ORDER BY ID ASC;");
			setTodos(ret?.rows as ToDo[]);
		} catch (error) {
			console.log(error);
		}
	}

	async function saveDb() {
		try {
			setSaving(true);
			const dbFile = await db?.dumpDataDir("auto");
			if (!dbFile) {
				throw new Error("Failed to dump database");
			}
			const data = new FormData();
			data.append("file", dbFile);
			const req = await fetch("/api/upload", {
				method: "POST",
				body: data,
			});
			const res = await req.json();
			console.log(res);
			toast({
				title: "Database Saved",
			});
			setSaving(false);
		} catch (error) {
			setSaving(false);
			console.log(error);
		}
	}

	function taskNameHandle(e: any) {
		setTaskName(e.target.value);
	}

	useEffect(() => {
		importDb();
	}, []);

	return (
		<div className="flex flex-col gap-2">
			{loading ? (
				<ReloadIcon className="h-12 w-12 animate-spin" />
			) : (
				<>
					<div className="flex flex-row items-center gap-4">
						<Input value={taskName} onChange={taskNameHandle} type="text" />
						<Button onClick={addTodo}>Add Todo</Button>
					</div>
					<div className="flex flex-col gap-2 items-start">
						{todos ? (
							todos.map((item: ToDo) => (
								<div
									className="w-full flex items-center justify-between gap-2"
									key={item.id}
								>
									<div className="flex items-center gap-2">
										<Checkbox
											onCheckedChange={(checked) =>
												updateTodo(item.id, checked as boolean)
											}
											checked={item.done}
										/>
										<p className={item.done ? "line-through" : ""}>
											{item.task}
										</p>
									</div>
									<Button
										size="icon"
										variant="destructive"
										onClick={() => deleteTodo(item.id)}
									>
										X
									</Button>
								</div>
							))
						) : (
							<p>No todos yet</p>
						)}
					</div>
					<div className="w-full">
						{saving ? (
							<Button className="w-full" disabled>
								<ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
								Saving...
							</Button>
						) : (
							<Button className="w-full" onClick={saveDb}>
								Save
							</Button>
						)}
					</div>
				</>
			)}
		</div>
	);
}
