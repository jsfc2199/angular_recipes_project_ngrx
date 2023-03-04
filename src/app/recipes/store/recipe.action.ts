import { Action } from '@ngrx/store';
import { Recipe } from '../recipe.model';
export const SET_RECIPES = '[Recipes] Set Recipes'
export const FETCH_RECIPES = '[Recipes] fetch recipes'
export const ADD_RECIPES = '[Recipes] Add recipes'
export const UPDATE_RECIPES = '[Recipes] update recipes'
export const DELETE_RECIPES = '[Recipes] delete recipes'
export const STORE_RECIPES = '[Recipes] store recipes'

export class SetRecipes implements Action {
    readonly type = SET_RECIPES;
    constructor(public payload: Recipe[]) { }
}

export class FetchRecipes implements Action {
    readonly type = FETCH_RECIPES;    
}

export class AddRecipe implements Action {
    readonly type = ADD_RECIPES;    
    constructor(public payload: Recipe) { }
}

export class UpdateRecipe implements Action {
    readonly type = UPDATE_RECIPES;    
    constructor(public payload: {index: number, newRecipe: Recipe}) { }
}

export class DeleteRecipe implements Action {
    readonly type = DELETE_RECIPES;    
    constructor(public payload: number) { }
}

export class StoreRecipes implements Action {
    readonly type = STORE_RECIPES;      
}

export type RecipesActions =  SetRecipes | FetchRecipes | AddRecipe | UpdateRecipe | DeleteRecipe | StoreRecipes;