export default abstract class DatabaseConfig {
	/**
	 * Get database config from environment.
	 */
	static get config() {
		const optionsDictionary = {
			host: 'HOST',
			port: 'PORT',
			name: 'NAME',
			user: 'USER',
			password: 'PASSWORD',
		};
		return Object.entries(optionsDictionary).reduce((options: { [key: string]: string }, [key, value]) => {
			options[key] = process.env[`DB_${value}`] || '';
			return options;
		}, {});
	}
}