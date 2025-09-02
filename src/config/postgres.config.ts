import postgres from "postgres";
import env from "./env.config";

const sql = postgres(env.DATABASE_URL);

export default sql;
