import { readFileSync } from 'fs';
import { Recipe } from '../app/core/database/cooking/models/Recipe';
import Ingredient from '../app/core/database/cooking/models/Ingredient';
import { Yield } from '../app/core/database/cooking/models/Yield';
import { YieldIngredient } from '../app/core/database/cooking/models/YieldIngredient';
import { Step } from '../app/core/database/cooking/models/Step';

interface IRaw {
	items: Array<IRecipeRaw>
}

interface IRecipeRaw {
	active: boolean,
	slug: string,
	name: string,
	headline: string,
	description: string,
	prepTime: string,
	totalTime: string,
	ingredients: Array<IIngredientRaw>,
	createdAt: Date,
	// allergens: recipeRawData.allergens,
	// tags: [...recipeRawData.cuisines, ...recipeRawData.tags],
	// steps: recipeRawData.steps,
	steps: Array<IStep>,
	updatedAt: Date,
	yields: Array<IYield>
}

interface IIngredientRaw {
	id: string,
	name: string,
	slug: string,
}

interface IIngredient {
	name: string,
	slug: string,
}

interface IStep {
	index: number,
	instructions: string
}

interface IYield {
	yields: number,
	ingredients: Array<IYieldIngredient>
}

interface IYieldIngredient {
	id: string,
	amount: number,
	unit: string,
	slug?: string,
}

export async function importRecipes() {
	console.log('import recipes');
	const raw = JSON.parse(readFileSync('src/data/recipes-1.json', 'utf-8')) as IRaw;
	const recipes = raw.items.sort((a, b) => {
		if (a.updatedAt > b.updatedAt) return -1;
		if (a.updatedAt < b.updatedAt) return 1;
		return 0;
	});
	const slugs = [];
	let index = 0;
	process.stdout.write(`current progress: ${index}/${recipes.length}`);
	for (const recipeRawData of recipes) {
		if (!recipeRawData.active) continue;
		// if (index > 5) continue;
		const recipeData = {
			slug: recipeRawData.slug,
			name: recipeRawData.name,
			headline: recipeRawData.headline,
			description: recipeRawData.description,
			preparationTime: parseDuration(recipeRawData.totalTime),
			totalTime: parseDuration(recipeRawData.prepTime),
			createdAt: recipeRawData.createdAt,
			// allergens: recipeRawData.allergens,
			// tags: [...recipeRawData.cuisines, ...recipeRawData.tags],
			updatedAt: recipeRawData.updatedAt,
		};

		const r = await Recipe.findOne({
			where: { slug: recipeData.slug },
		});
		if (r) {
			index++;
			process.stdout.clearLine(0);
			process.stdout.cursorTo(0);
			process.stdout.write(`current progress: ${index}/${recipes.length}`);
			continue;
		}
		const recipe = await Recipe.create(recipeData);
		slugs.push(recipeData.slug);

		await createIngredients(recipeRawData);
		await Promise.all([createYields(recipe, recipeRawData), createSteps(recipe, recipeRawData)]);

		// progress
		index++;
		process.stdout.clearLine(0);
		process.stdout.cursorTo(0);
		process.stdout.write(`current progress: ${index}/${recipes.length}`);
	}
	process.stdout.write('\n');

}

async function createIngredients(recipeRawData: IRecipeRaw) {
	const promises = [];
	for (const ingredientData of recipeRawData.ingredients) {
		promises.push(createIngredient(ingredientData));
	}
	await Promise.all(promises);
}

function createIngredient(ingredientData: IIngredient) {
	const defaultIngredientData = {
		name: ingredientData.name,
		slug: ingredientData.slug,
	};
	return Ingredient.findOrCreate({
		where: { slug: ingredientData.slug },
		defaults: defaultIngredientData,
	});
}

async function createYields(recipe: Recipe, recipeRawData: IRecipeRaw) {
	const promises = [];
	const yields: Array<IYield> = recipeRawData.yields;
	yields.forEach(y => y.ingredients.forEach(i => {
		const ingredient = recipeRawData.ingredients.find(ing => ing.id === i.id);
		if (ingredient) i.slug = ingredient?.slug;
	}));

	for (const yieldData of yields) {
		promises.push(createYield(recipe, yieldData));
	}
	await Promise.all(promises);
}

async function createYield(recipe: Recipe, yieldData: IYield) {
	const defaultYieldData = {
		id: `${recipe.slug}-${yieldData.yields}`,
		yields: yieldData.yields,
		recipeSlug: recipe.slug,
	};
	const [yieldRecord] = await Yield.findOrCreate({
		where: { id: `${recipe.slug}-${yieldData.yields}` },
		defaults: defaultYieldData,
	});

	await createYieldIngredients(yieldRecord, yieldData);
}

async function createYieldIngredients(yieldRecord: Yield, yieldData: IYield) {
	const promises = [];
	for (const yieldIngredient of yieldData.ingredients) {
		promises.push(createYieldIngredient(yieldRecord, yieldIngredient));
	}
	await Promise.all(promises);
}

function createYieldIngredient(yieldRecord: Yield, yieldIngredient: IYieldIngredient) {
	const defaultYieldIngredientData = {
		id: `${yieldRecord.id}-${yieldIngredient.slug}`,
		amount: yieldIngredient.amount,
		unit: yieldIngredient.unit,
		yieldId: yieldRecord.id,
		ingredientSlug: yieldIngredient.slug,
	};
	return YieldIngredient.findOrCreate({
		where: { id: `${yieldRecord.id}-${yieldIngredient.slug}` },
		defaults: defaultYieldIngredientData,
	});
}

async function createSteps(recipe: Recipe, recipeRawData: IRecipeRaw) {
	const promises = [];
	const steps = recipeRawData.steps;
	for (const stepData of steps) {
		promises.push(createStep(recipe, stepData));
	}
	await Promise.all(promises);
}

function createStep(recipe: Recipe, stepData: IStep) {
	const defaultStepData = {
		id: `${recipe.slug}-${stepData.index}`,
		instructions: stepData.instructions,
		recipeSlug: recipe.slug,
	};
	return Step.findOrCreate({
		where: { id: `${recipe.slug}-${stepData.index}` },
		defaults: defaultStepData,
	});
}

function parseDuration(duration: string) {
	const hoursMatch = duration.match(/(\d+)H/);
	const minutesMatch = duration.match(/(\d+)M/);

	const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
	const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

	return (hours * 60) + minutes;
}