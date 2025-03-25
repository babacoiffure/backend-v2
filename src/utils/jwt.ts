import jwt from "jsonwebtoken";
import { serverENV } from "../env-config";
import { server } from "../server";

// Token schema
type TokenSchema = {
	userId: string;
	userType: string;
};

export function signJwt(
	object: Object,
	privateKey: string,
	options?: jwt.SignOptions | undefined
) {
	return jwt.sign(object, privateKey, {
		...(options && options),
		algorithm: "RS256",
	});
}

export function verifyJwt<TokenSchema>(token: string, publicKey: string) {
	try {
		const decoded: any = jwt.verify(token, publicKey);
		return {
			valid: true,
			expired: decoded?.exp < Date.now(),
			decoded: decoded as TokenSchema & {
				iat: number;
				exp: number;
			},
		};
	} catch (e: any) {
		return {
			valid: false,
			expired: e.message === "jwt expired",
			decoded: null,
		};
	}
}

// Access Token
export const generateAccessToken = ({
	userId,
	userType,
}: {
	userId: string;
	userType: "Client" | "Provider";
}) => {
	return signJwt(
		{
			userId,
			userType,
		},
		serverENV.ACCESS_TOKEN_PRIVATE_KEY,
		{
			expiresIn: serverENV.ACCESS_TOKEN_EXPIRE_IN as any,
		}
	);
};
export const verifyAccessToken = (token: string) =>
	verifyJwt<TokenSchema>(token, serverENV.ACCESS_TOKEN_PUBLIC_KEY);

// Refresh token
export const generateRefreshToken = ({ userId, userType }: TokenSchema) => {
	if (serverENV.REFRESH_TOKEN_PRIVATE_KEY === "") {
		console.error("serverENV.REFRESH_TOKEN_PRIVATE_KEY: ", serverENV.REFRESH_TOKEN_PRIVATE_KEY)
		return ""
	}

	return signJwt(
		{
			userId,
			userType,
		},
		serverENV.REFRESH_TOKEN_PRIVATE_KEY,
		{
			expiresIn: serverENV.REFRESH_TOKEN_EXPIRE_IN as any,
		}
	);
};
export const verifyRefreshToken = (token: string) =>
	verifyJwt<TokenSchema>(token, serverENV.REFRESH_TOKEN_PUBLIC_KEY);
