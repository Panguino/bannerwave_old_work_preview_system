export function getAdminUser(): string {
	const v = import.meta.env.PREVIEW_ADMIN_USER;
	if (!v) throw new Error('PREVIEW_ADMIN_USER is not set');
	return v;
}

export function getPasswordHash(): string {
	const v = import.meta.env.PREVIEW_ADMIN_PASSWORD_HASH;
	if (!v) throw new Error('PREVIEW_ADMIN_PASSWORD_HASH is not set');
	return v;
}

export function getSessionSecret(): Uint8Array {
	const v = import.meta.env.PREVIEW_SESSION_SECRET;
	if (!v || v.length < 32) {
		throw new Error('PREVIEW_SESSION_SECRET must be set (min 32 chars)');
	}
	return new TextEncoder().encode(v);
}
