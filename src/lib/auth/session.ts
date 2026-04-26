import * as jose from 'jose';
import { getSessionSecret } from './env';

const COOKIE = 'preview_session';

export { COOKIE };

export async function signSession(username: string): Promise<string> {
	const secret = getSessionSecret();
	return new jose.SignJWT({ sub: username })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('7d')
		.sign(secret);
}

export async function verifySession(token: string): Promise<boolean> {
	try {
		const secret = getSessionSecret();
		await jose.jwtVerify(token, secret);
		return true;
	} catch {
		return false;
	}
}
