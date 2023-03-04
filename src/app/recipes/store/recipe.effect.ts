import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as RecipeActions from './recipe.action'
import { switchMap } from 'rxjs';
import { Recipe } from '../recipe.model';
import { HttpClient } from '@angular/common/http';
import { map, withLatestFrom } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from '../../store/app.reducer'

@Injectable()
export class RecipeEffects {
    constructor(private actions$: Actions, private http: HttpClient, private store: Store<fromApp.AppState>) { }

    fetchRecipes = createEffect(() => this.actions$.pipe(
        ofType(RecipeActions.FETCH_RECIPES),
        //now the request
        switchMap(() => {
            return this.http
                .get<Recipe[]>(
                    "https://ingredient-project-d3cd0-default-rtdb.firebaseio.com/recipes.json"
                )
        }), map(recipes => {
            return recipes.map(recipe => {
                return {
                    ...recipe,
                    ingredients: recipe.ingredients ? recipe.ingredients : []
                };
            });
        }), map(recipes => {
            return new RecipeActions.SetRecipes(recipes)
        })
    ))

    storeRecipes = createEffect(() => this.actions$.pipe(
        ofType(RecipeActions.STORE_RECIPES),
        //we use this operator that allows us to merge a value from another observable to this observable
        //in order to get the recipes from the store
        withLatestFrom(this.store.select('recipes')),
        switchMap(([actionData, recipesState]) => {
            return this.http
                .put(
                    "https://ingredient-project-d3cd0-default-rtdb.firebaseio.com/recipes.json",
                    recipesState.recipes
                )
        })
    ), { dispatch: false })
}