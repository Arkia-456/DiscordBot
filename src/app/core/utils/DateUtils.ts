import { ApplicationError } from './error/ApplicationError';

export class DateUtils {
	private static dayNumbers: { [key: string]: number } = {
		sunday: 0,
		monday: 1,
		tuesday: 2,
		wednesday: 3,
		thursday: 4,
		friday: 5,
		saturday: 6,
	};

	/**
	 * Find the next day based on the provided day name, i.e. find the next Monday
	 * @param dayName name of the next day to find, i.e. 'Monday'
	 * @param startDate start date from which to find next day
	 * @returns date of the next day
	 */
	static getNextNamedDay(dayName: string, startDate?: Date) {
		const date = startDate ? new Date(startDate) : new Date();
		return DateUtils.getPreviousOrNextNamedDay(dayName, date);
	}

	/**
	 * Find the previous day based on the provided day name, i.e. find the previous Monday
	 * @param dayName name of the previous day to find, i.e. 'Monday'
	 * @param startDate start date from which to find previous day
	 * @returns date of the previous day
	 */
	static getPreviousNamedDay(dayName: string, startDate?: Date) {
		const date = startDate ? new Date(startDate) : new Date();
		return DateUtils.getPreviousOrNextNamedDay(dayName, date, true);
	}

	/**
	 * Find the previous/next day based on the provided day name
	 * @param dayName name of the previous/next day to find, i.e. 'Monday'
	 * @param startDate start date from which to find previous/next day
	 * @param isPrevious `true` if want to get previous day, `false` otherwise
	 * @returns date of the previous/next day
	 */
	private static getPreviousOrNextNamedDay(
		dayName: string,
		startDate: Date,
		isPrevious: boolean = false,
	) {
		const date = new Date(startDate);
		const dayNumber = DateUtils.dayNumbers[dayName.toLowerCase()];
		if (!dayNumber) {
			throw new ApplicationError({
				message: `Incorrect prodived day name ${dayName}`,
			});
		}
		const previous = isPrevious ? -1 : 1;
		return new Date(
			date.setDate(
				date.getDate() +
					(((7 + dayNumber * previous - date.getDay() * previous) * previous) %
						7),
			),
		);
	}

	/**
	 * Format a date to YYYY-MM-DD format
	 * @param date the date to format, defaults to current date
	 * @returns formatted date string (e.g. '2026-04-09')
	 */
	static formatToIsoDateOnly(date: Date = new Date()): string {
		return date.toISOString().split('T')[0];
	}
}
