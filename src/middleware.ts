import { defineMiddleware } from 'astro:middleware';
import { verifySession, COOKIE } from './lib/auth/session';

export const onRequest = defineMiddleware(async (context, next) => {
	const path = context.url.pathname;

	if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
		const token = context.cookies.get(COOKIE)?.value;
		let authed = false;
		if (token) {
			try {
				authed = await verifySession(token);
			} catch {
				authed = false;
			}
		}
		if (!authed) {
			const nextUrl = path + context.url.search;
			const q = new URLSearchParams({ redirect: nextUrl });
			return context.redirect(`/admin/login?${q.toString()}`);
		}
	}

	return next();
});
