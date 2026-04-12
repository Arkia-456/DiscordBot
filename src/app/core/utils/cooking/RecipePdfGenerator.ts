import { RecipeGql } from '../../../api/graphql/cooking/types/RecipeGql';
import PDFDocument from 'pdfkit';
import { RecipeIngredientGql } from '../../../api/graphql/cooking/types/RecipeIngredientGql';
import { RecipeInstructionGql } from '../../../api/graphql/cooking/types/RecipeInstructionGql';
import { BotConstants } from '../../bot/BotConstants';
import { MathUtils } from '../MathUtils';
import { StringUtils } from '../StringUtils';

export class RecipePdfGenerator {
	static MARGIN = '1cm' as PDFKit.Mixins.Size;
	static SIDE_MARGIN = '2cm' as PDFKit.Mixins.Size;

	static DEFAULT_COLOR = '#000000';
	static PRIMARY_COLOR = BotConstants.EMBEDS.COLORS.COOKING;

	static DEFAULT_FONT_SIZE = 12;
	static TITLE_FONT_SIZE = 20;
	static SUBTITLE_FONT_SIZE = 16;
	static SECTION_TITLE_FONT_SIZE = 14;
	static FOOTER_FONT_SIZE = 8;

	static generate(recipe: RecipeGql) {
		return new Promise<Buffer>((resolve, reject) => {
			const doc = new PDFDocument({
				margins: {
					top: RecipePdfGenerator.MARGIN,
					bottom: RecipePdfGenerator.MARGIN,
					left: RecipePdfGenerator.SIDE_MARGIN,
					right: RecipePdfGenerator.SIDE_MARGIN,
				},
				bufferPages: true,
			});
			const chunks: Array<Buffer> = [];

			doc.on('data', (data: Buffer) => {
				chunks.push(data);
			});
			doc.on('end', () => resolve(Buffer.concat(chunks as Uint8Array[])));
			doc.on('error', reject);

			doc.registerFont(
				'DefaultFont',
				'src/app/core/utils/fonts/Jost-Regular.ttf',
			);
			doc.registerFont('TitleFont', 'src/app/core/utils/fonts/Jost-Medium.ttf');

			RecipePdfGenerator.writeTitle(doc, recipe.title);
			if (recipe.subtitle) {
				RecipePdfGenerator.writeSubtitle(doc, recipe.subtitle);
			}
			RecipePdfGenerator.writeIngredients(doc, recipe.recipeIngredients);
			RecipePdfGenerator.writeInstructions(doc, recipe.recipeInstructions);

			const pages = doc.bufferedPageRange();
			if (pages.count > 1) {
				for (let i = 0; i < pages.count; i++) {
					doc.switchToPage(i);
					const oldBottomMargin = doc.page.margins.bottom;
					doc.page.margins.bottom = 0;
					const oldRightMargin = doc.page.margins.right;
					doc.page.margins.right = 0;
					doc
						.font('DefaultFont')
						.fontSize(RecipePdfGenerator.FOOTER_FONT_SIZE)
						.fillColor(RecipePdfGenerator.DEFAULT_COLOR)
						.text(
							`Page ${i + 1} / ${pages.count}`,
							doc.page.width - oldRightMargin,
							doc.page.height - oldBottomMargin,
							{ align: 'left' },
						);
					doc.page.margins.bottom = oldBottomMargin;
					doc.page.margins.right = oldRightMargin;
				}
			}

			doc.end();
		});
	}

	private static writeTitle(doc: PDFKit.PDFDocument, title: string) {
		doc
			.fontSize(RecipePdfGenerator.TITLE_FONT_SIZE)
			.font('TitleFont')
			.fillColor(RecipePdfGenerator.PRIMARY_COLOR)
			.text(title, { align: 'right' });
	}

	private static writeSubtitle(doc: PDFKit.PDFDocument, subtitle: string) {
		doc
			.fontSize(RecipePdfGenerator.SUBTITLE_FONT_SIZE)
			.font('TitleFont')
			.fillColor(RecipePdfGenerator.PRIMARY_COLOR)
			.text(subtitle, { align: 'right' });
		doc.moveDown(1);
	}

	private static writeIngredients(
		doc: PDFKit.PDFDocument,
		ingredients: Array<RecipeIngredientGql>,
	) {
		RecipePdfGenerator.writeSectionTitle(doc, 'Ingrédients');
		doc.moveDown(0.5);
		RecipePdfGenerator.writeIngredientsDetails(doc, ingredients);
		doc.moveDown(0.5);
	}

	private static writeInstructions(
		doc: PDFKit.PDFDocument,
		instructions: Array<RecipeInstructionGql>,
	) {
		RecipePdfGenerator.writeSectionTitle(doc, 'Préparation');
		doc.moveDown(0.5);
		RecipePdfGenerator.writeInstructionsDetails(doc, instructions);
		doc.moveDown(0.5);
	}

	private static writeSectionTitle(doc: PDFKit.PDFDocument, title: string) {
		doc.table({
			data: [
				[
					{
						text: title,
						textColor: RecipePdfGenerator.PRIMARY_COLOR,
						font: {
							src: 'TitleFont',
							size: RecipePdfGenerator.SECTION_TITLE_FONT_SIZE,
						},
					},
				],
			],
			rowStyles: (i) =>
				i < 1
					? {
							border: [0, 0, 3, 0],
							borderColor: RecipePdfGenerator.PRIMARY_COLOR,
						}
					: { border: false },
		});
	}

	private static writeIngredientsDetails(
		doc: PDFKit.PDFDocument,
		ingredients: Array<RecipeIngredientGql>,
	) {
		const half = Math.ceil(ingredients.length / 2);
		const left = ingredients.slice(0, half);
		const right = ingredients.slice(half);

		const toText = (ingredient: RecipeIngredientGql) => {
			const quantity = ingredient.quantity
				? MathUtils.formatDecimal(ingredient.quantity)
				: '';
			const unit = StringUtils.formatUnit(
				ingredient.unit ?? '',
				ingredient.quantity,
			);
			const name = StringUtils.lowerCaseFirst(ingredient.ingredient.name);
			const joinWord = /^[aeéèêëiîïoôuùûüœy]/i.test(name) ? "d'" : 'de ';
			return [quantity, unit, joinWord + name].filter(Boolean).join(' ');
		};

		doc.table({
			data: left.map((ingredient, index) => [
				{
					text: toText(ingredient),
					font: {
						src: 'DefaultFont',
						size: RecipePdfGenerator.DEFAULT_FONT_SIZE,
					},
					textColor: RecipePdfGenerator.DEFAULT_COLOR,
					padding: 0,
				},
				{
					text: right[index] ? toText(right[index]) : '',
					font: {
						src: 'DefaultFont',
						size: RecipePdfGenerator.DEFAULT_FONT_SIZE,
					},
					textColor: RecipePdfGenerator.DEFAULT_COLOR,
					padding: 0,
				},
			]),
			rowStyles: { border: false },
		});
	}

	private static writeInstructionsDetails(
		doc: PDFKit.PDFDocument,
		instructions: Array<RecipeInstructionGql>,
	) {
		doc.table({
			data: instructions.map((instruction, index) => [
				{
					text: `${index + 1}.`,
					font: {
						src: 'DefaultFont',
						size: RecipePdfGenerator.DEFAULT_FONT_SIZE,
					},
					textColor: RecipePdfGenerator.DEFAULT_COLOR,
				},
				{
					text: instruction.instruction,
					font: {
						src: 'DefaultFont',
						size: RecipePdfGenerator.DEFAULT_FONT_SIZE,
					},
					textColor: RecipePdfGenerator.DEFAULT_COLOR,
				},
			]),
			rowStyles: { border: false },
			columnStyles: [24, '*'],
		});
	}
}
