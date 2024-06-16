import { ColorResolvable } from "discord.js";

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			CLIENT_TOKEN: string;
			TOPGG_TOKEN: string;
			TOPGG_WH_AUTH: string;
			CLIENT_ID: string;
			OWNER_ID: string;
			EMBED_COLOR: ColorResolvable;
			PREFIX: string;
			STATE: string;
			LANG_PATH: string;
			SERVER_SECRET: string;
			PORT: number;
			MONGO_CONNECTION_URI: string;
			WEBHOOK_LOG_COMMAND_URL: string;
			WEBHOOK_LOG_ERROR_URL: string;
			WEBHOOK_LOG_ADDED_URL: string;
			WEBHOOK_LOG_REMOVED_URL: string;
			WEBHOOK_LOG_INIT_URL: string;
		}
	}
}

export { };