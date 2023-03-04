import { Ingredient } from '../../shared/ingredient.model';
import * as ShoppingListActions from './shopping-list.actions';

export interface State {
  ingredients: Ingredient[];
  editedIngredient: Ingredient;
  editedIngredientIndex: number;
}

const initialState: State = {
  ingredients: [new Ingredient('Apples', 5), new Ingredient('Tomatoes', 10)],
  editedIngredient: null,
  editedIngredientIndex: -1
};

export function shoppingListReducer(
  state: State = initialState,
  action: ShoppingListActions.ShoppingListActions
) {
  switch (action.type) {
    case ShoppingListActions.ADD_INGREDIENT:
      return {
        ...state,
        ingredients: [...state.ingredients, action.payload]
      };
    case ShoppingListActions.ADD_INGREDIENTS:
      return {
        ...state,
        ingredients: [...state.ingredients, ...action.payload]
      };
    case ShoppingListActions.UPDATE_INGREDIENT:
      const ingredient = state.ingredients[state.editedIngredientIndex]; //we access to the index not using actiong.payload.index
      const updatedIngredient = {
        ...ingredient,
        ...action.payload //we don't acces .ingredient, just to payload itself
      };
      const updatedIngredients = [...state.ingredients];
      updatedIngredients[state.editedIngredientIndex] = updatedIngredient;

      return {
        ...state,
        ingredients: updatedIngredients,
        editedIngredientIndex: -1, //we stop the editing process
        editedIngredient: null //we stop the editing process
      };
    case ShoppingListActions.DELETE_INGREDIENT:
      return {
        ...state,
        ingredients: state.ingredients.filter((ig, igIndex) => {
          return igIndex !== state.editedIngredientIndex; //we dont compare using  actiong.payload.index
        }),
        editedIngredientIndex: -1, //we stop the editing process
        editedIngredient: null //we stop the editing process
      };
    case ShoppingListActions.START_EDIT:
      return {
        ...state,
        editedIngredientIndex: action.payload, //we set the index from the one that we are getting to have it in the payload
        editedIngredient: { ...state.ingredients[action.payload] } //the ingredient edited itself
      };
    case ShoppingListActions.STOP_EDIT:
      return {
        ...state,
        editedIngredient: null, //we return everything like it was
        editedIngredientIndex: -1 //we return everything like it was
      };
    default:
      return state;
  }
}
