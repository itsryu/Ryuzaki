import { ColorResolvable } from "discord.js";

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			CLIENT_TOKEN: string;
			USER_TOKEN: string;
			DISCORD_API: string;
			DBL_TOKEN: string;
			DBL_WH_AUTH: string;
			CLIENT_ID: string;
			OWNER_ID: string;
			EMBED_COLOR: ColorResolvable;
			PREFIX: string;
			STATE: string;
			LANG_PATH: string;
			PORT: number;
			LOCAL_URL: string;
			DOMAIN_URL: string;
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