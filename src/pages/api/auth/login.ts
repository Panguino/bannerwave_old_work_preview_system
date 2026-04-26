import type { APIRoute } from 'astro';
import bcrypt from 'bcryptjs';
import { getAdminUser, getPasswordHash } from '../../../lib/auth/env';
import { signSession, COOKIE } from '../../../lib/auth/session';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, url }) => {
	let username = '';
	let password = '';
	const ct = request.headers.get('content-type') || '';
	if (ct.includes('application/json')) {
		const j = (await request.json()) as { username?: string; password?: string };
		username = j.username ?? '';
		password = j.password ?? '';
	} else {
		const fd = await request.formData();
		username = String(fd.get('username') ?? '');
		password = String(fd.get('password') ?? '');
	}

	const failRedirect = () => {
		const r = url.searchParams.get('redirect') || '/admin';
		const loc = `/admin/login?error=1&redirect=${encodeURIComponent(r)}`;
		return new Response(null, { status: 303, headers: { Location: loc } });
	};

	try {
		if (username !== getAdminUser()) {
			return failRedirect();
		}
		const ok = bcrypt.compareSync(password, getPasswordHash());
		if (!ok) {
			return failRedirect();
		}

		const token = await signSession(username);
		cookies.set(COOKIE, token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: import.meta.env.PROD,
			maxAge: 60 * 60 * 24 * 7,
		});

		const redirect = url.searchParams.get('redirect') || '/admin';
		return new Response(null, {
			status: 303,
			headers: { Location: redirect },
		});
	} catch (e) {
		console.error(e);
		return new Response('Server misconfigured', { status: 500 });
	}
};
