export function isUTCDateString(dateStr: string): boolean {
	const isoUtcRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
	return isoUtcRegex.test(dateStr);
}
