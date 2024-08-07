import { ICommandOption } from './ICommandOption';

export interface ICommandParam {
	commandPath?: string;
	options?: Array<ICommandOption>;
	isPrivateGuildCommand?: boolean;
}