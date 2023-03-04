import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';

import { Recipe } from './recipe.model';
import { DataStorageService } from '../shared/data-storage.service';
import { RecipeService } from './recipe.service';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer'
import * as RecipeActions from '../recipes/store/recipe.action'
import { Actions, ofType } from '@ngrx/effects';
import { take, map } from 'rxjs/operators';
import { switchMap, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RecipesResolverService implements Resolve<Recipe[]> {
  constructor(
    private dataStorageService: DataStorageService,
    private recipesService: RecipeService,
    private store: Store<fromApp.AppState>,
    private actions$: Actions
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    /*const recipes = this.recipesService.getRecipes();

    if (recipes.length === 0) {
      return this.dataStorageService.fetchRecipes();
    } else {
      return recipes;
    }
  }*/
    return this.store.select('recipes').pipe(
      take(1), //to not make this multiple times
      map(recipesState => {
        return recipesState.recipes
      }),
      switchMap(recipes => {
        if (recipes.length === 0) {
          this.store.dispatch(new RecipeActions.FetchRecipes())
          //we wait for the effect to complete
          return this.actions$.pipe(ofType(RecipeActions.SET_RECIPES), take(1)) //WHEN THIS IS CALLED WE KNOW THAT THE RECIPES ARE THERE
        } else {
          return of(recipes)
        }
      })
    )
  }
}
