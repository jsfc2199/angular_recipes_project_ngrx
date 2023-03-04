import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

const appRoutes: Routes = [
  // { path: 'recipes', loadChildren: './recipes/recipes.module#RecipesModule' }, //this works for old angular versions    
  //{ path: 'shopping-list', loadChildren: './shopping-list/shopping-list.module#ShoppingListModule' },
  // { path: 'auth', loadChildren: './auth/auth/auth.module#AuthModule' }, //this works for old angular versions    
  { path: '', redirectTo: '/recipes', pathMatch: 'full' },
  {
      path: 'recipes',
      loadChildren: () => import('./recipes/recipes.module')
          .then(module => module.RecipesModule)
  }, //this works for the new versions

  {
      path: 'shopping-list',
      loadChildren: () => import('./shopping-list/shopping-list.module')
          .then(module => module.ShoppingListModule)
  },
  {
      path: 'auth',
      loadChildren: () => import('./auth/auth.module')
          .then(module => module.AuthModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
