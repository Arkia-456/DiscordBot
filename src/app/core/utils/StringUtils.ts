export class StringUtils {
	static truncate(str: string, maxLength: number, ellipsis: boolean = false) {
		return str.length > maxLength
			? `${str.substring(0, maxLength)}${ellipsis ? '...' : ''}`
			: str;
	}
}
