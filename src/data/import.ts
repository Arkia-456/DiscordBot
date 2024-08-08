import { readFileSync } from 'fs';
import { Recipe } from '../app/core/database/cooking/models/Recipe';
import Ingredient from '../app/core/database/cooking/models/Ingredient';
import { Yield } from '../app/core/database/cooking/models/Yield';
import { YieldIngredient } from '../app/core/database/cooking/models/YieldIngredient';
import { Step } from '../app/core/database/cooking/models/Step';
import { ApplicationError } from '../app/core/utils/error/ApplicationError';
import { Logger } from '../app/core/utils/logger/Logger';
import { Tag } from '../app/core/database/cooking/models/Tag';

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
	tags: Array<ITag>,
	cuisines: Array<ITag>,
	yields: Array<IYield>
}

interface ITag {
	name: string,
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
	Logger.write('Importing recipes...');
	const raw = JSON.parse(readFileSync('src/data/recipes-1.json', 'utf-8')) as IRaw;
	const rawRecipes = raw.items.sort((a, b) => {
		if (a.updatedAt > b.updatedAt) return -1;
		if (a.updatedAt < b.updatedAt) return 1;
		return 0;
	});
	let index = 0;
	Logger.write(`Importing recipes: ${index}/${rawRecipes.length}`);
	for (const recipeRawData of rawRecipes) {
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

		const [recipe] = await Recipe.findOrCreate({
			where: { slug: recipeData.slug },
			defaults: recipeData,
		});

		await createIngredients(recipeRawData.ingredients);
		await Promise.all([
			createYields(recipe, recipeRawData),
			createSteps(recipe, recipeRawData.steps),
			createTags(recipe, [...recipeRawData.cuisines, ...recipeRawData.tags]),
		]);

		// progress
		index++;
		Logger.write(`Importing recipes: ${index}/${rawRecipes.length}`, true);
	}

}

async function createIngredients(ingredients: Array<IIngredientRaw>) {
	const promises = [];
	for (const ingredientData of ingredients) {
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
		yields: yieldData.yields,
		recipeId: recipe.id,
	};
	const [yieldRecord] = await Yield.findOrCreate({
		where: {
			recipeId: recipe.id,
			yields: yieldData.yields,
		},
		defaults: defaultYieldData,
	});

	await createYieldIngredients(yieldRecord, yieldData.ingredients);
}

async function createYieldIngredients(yieldRecord: Yield, ingredients: Array<IYieldIngredient>) {
	const promises = [];
	for (const yieldIngredient of ingredients) {
		promises.push(createYieldIngredient(yieldRecord, yieldIngredient));
	}
	await Promise.all(promises);
}

async function createYieldIngredient(yieldRecord: Yield, yieldIngredient: IYieldIngredient) {
	const ingredient = await Ingredient.findOne({
		where: { slug: yieldIngredient.slug },
	});
	if (!ingredient) throw new ApplicationError({ message: `Ingredient ${yieldIngredient.slug} not found` });
	const defaultYieldIngredientData = {
		amount: yieldIngredient.amount,
		unit: yieldIngredient.unit,
		yieldId: yieldRecord.id,
		ingredientId: ingredient.id,
	};
	return YieldIngredient.findOrCreate({
		where: {
			yieldId: yieldRecord.id,
			ingredientId: ingredient.id,
		},
		defaults: defaultYieldIngredientData,
	});
}

async function createSteps(recipe: Recipe, steps: Array<IStep>) {
	const promises = [];
	for (const stepData of steps) {
		promises.push(createStep(recipe, stepData));
	}
	await Promise.all(promises);
}

function createStep(recipe: Recipe, stepData: IStep) {
	const defaultStepData = {
		index: stepData.index,
		instructions: stepData.instructions,
		recipeId: recipe.id,
	};
	return Step.findOrCreate({
		where: {
			recipeId: recipe.id,
			index: stepData.index,
		},
		defaults: defaultStepData,
	});
}

async function createTags(recipe: Recipe, tags: Array<ITag>) {
	const promises = [];
	for (const tag of tags) {
		promises.push(createTag(recipe, tag));
	}
	await Promise.all(promises);
}

async function createTag(recipe: Recipe, tagData: ITag) {
	const defaultTagData = {
		name: tagData.name,
	};
	const [tag] = await Tag.findOrCreate({
		where: {
			name: tagData.name,
		},
		defaults: defaultTagData,
	});
	recipe.addTag(tag.id, {
		ignoreDuplicates: true,
	});
}

function parseDuration(duration: string) {
	const hoursMatch = duration.match(/(\d+)H/);
	const minutesMatch = duration.match(/(\d+)M/);

	const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
	const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

	return (hours * 60) + minutes;
}