export class MathUtils {
	static getRandomIndex(array: Array<unknown>, n: number) {
		const result = new Array(n);
		for (let i = 0; i < n; i++) {
			const length = array.length;
			const randomIndex = Math.floor(Math.random() * length);
			result[i] = array[randomIndex];
			array.splice(randomIndex, 1);
		}
		return result;
	}

	static formatDecimal(number: number) {
		const fractions: { [key: number]: string } = {
			0.8: '⅘',
			0.75: '¾',
			0.66: '⅔',
			0.6: '⅗',
			0.5: '½',
			0.4: '⅖',
			0.33: '⅓',
			0.25: '¼',
			0.2: '⅕',
		};
		return fractions[number] ?? String(number);
	}
}
