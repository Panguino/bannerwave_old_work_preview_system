import type { APIRoute } from 'astro';
import { COOKIE } from '../../../lib/auth/session';

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
	cookies.delete(COOKIE, { path: '/' });
	return new Response(null, {
		status: 303,
		headers: { Location: '/admin/login' },
	});
};
