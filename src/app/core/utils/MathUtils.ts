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

}