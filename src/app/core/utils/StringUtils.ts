export class StringUtils {
	static truncate(str: string, maxLength: number, ellipsis: boolean = false) {
		return str.length > maxLength
			? `${str.substring(0, maxLength)}${ellipsis ? '...' : ''}`
			: str;
	}

	static lowerCaseFirst(str: string) {
		return str.charAt(0).toLowerCase() + str.slice(1);
	}

	static formatUnit(unit: string, quantity?: number) {
		if (unit.toLowerCase() === 'selon le goût') return '';
		if (quantity && unit.includes('(s)')) {
			return unit.replace('(s)', quantity >= 2 ? 's' : '');
		}
		return unit;
	}
}
