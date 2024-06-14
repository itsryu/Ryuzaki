declare global {
	namespace NodeJS {
		interface ProcessEnv {
			CLIENT_TOKEN: string;
			CLIENT_ID: string;
			OWNER_ID: string;
			EMBED_COLOR: string;
			PREFIX: string;
			TOPGG_TOKEN: string;
			TOPGG_WH_AUTH: string;
			STATE: string;
			LANG_PATH: string;
			WS_PW: string;
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