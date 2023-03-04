import { Recipe } from "../recipe.model"
import * as RecipesActions from './recipe.action'

export interface State {
    recipes: Recipe[]
}

const initialState: State = {
    recipes: []
}

export function recipeReducer(state= initialState, action: RecipesActions.RecipesActions){
    switch(action.type){
        case RecipesActions.SET_RECIPES:
            return {
                ...state,
                recipes: [...action.payload] //we add the recipes to be the new state
            }
        case RecipesActions.ADD_RECIPES:
            return {
                ...state,
                recipes: [...state.recipes, action.payload] //the old state + the new element
            }
        case RecipesActions.UPDATE_RECIPES:
            //fetch the updatedRecipe state
            const updatedRecipe = {
                ...state.recipes[action.payload.index], //we copy the original state of that recipe
            ...action.payload.newRecipe //we override the old state
            }//getting the recipe we want to change

            //updatedRecipes which mens the whole list
            const updatedRecipes = [...state.recipes];
            updatedRecipes[action.payload.index] = updatedRecipe
            return {
                ...state,
                recipes: updatedRecipes
            }        
        case RecipesActions.DELETE_RECIPES:

            return{
                ...state,
                recipes: state.recipes.filter((recipe, index)=> {
                    return index !== action.payload
                })
            }
        default:
            return state;
    }  
}