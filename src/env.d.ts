/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly PREVIEW_ADMIN_USER: string;
	readonly PREVIEW_ADMIN_PASSWORD_HASH: string;
	readonly PREVIEW_SESSION_SECRET: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
