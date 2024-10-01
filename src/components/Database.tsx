import { PGlite } from "@electric-sql/pglite";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { pinata } from "@/utils/pinata";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";

let db: PGlite | undefined;

interface ToDo {
	id: number;
	task: string;
	done: boolean;
}

export default function Database() {
	const [todos, setTodos]: any = useState([]);
	const [taskName, setTaskName] = useState("");

	async function importDb() {
		try {
			const dbFile = await pinata.gateways.get(import.meta.env.PUBLIC_DB_CID);
			//const dbFile = await fetch(import.meta.env.PUBLIC_DB_URL);
			//const file = (await dbFile.blob()) as Blob;
			const file = dbFile.data as Blob;
			db = new PGlite({ loadDataDir: file });
			const ret = await db?.query(`
        SELECT * from todo;
      `);
			setTodos(ret?.rows);
			console.log("database restored");
		} catch (error) {
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
			const ret = await db?.query("SELECT * from todo;");
			setTodos(ret?.rows as ToDo[]);
		} catch (error) {
			console.log(error);
		}
	}

	async function saveDb() {
		try {
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
		} catch (error) {
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
			<div className="flex flex-row items-center gap-4">
				<Input value={taskName} onChange={taskNameHandle} type="text" />
				<Button onClick={addTodo}>Add Todo</Button>
			</div>
			<div className="flex flex-col gap-2 items-start">
				{todos ? (
					todos.map((item: ToDo) => (
						<div className="w-full flex items-center gap-2" key={item.id}>
							<Checkbox
								onCheckedChange={(checked) =>
									updateTodo(item.id, checked as boolean)
								}
								checked={item.done}
							/>
							<p className={item.done ? "line-through" : ""}>{item.task}</p>
						</div>
					))
				) : (
					<p>No todos yet</p>
				)}
			</div>
			<div className="w-full">
				<Button className="w-full" onClick={saveDb}>
					Save
				</Button>
			</div>
		</div>
	);
}
