import { HttpClient } from "@angular/common/http";
import { Actions, ofType, createEffect } from "@ngrx/effects";
import { switchMap, of } from "rxjs";
import { environment } from "src/environments/environment";

import * as AuthActions from "./auth.actions";
import { catchError, map, mergeMap, tap } from "rxjs/operators";
import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { SignupStart } from './auth.actions';
import { User } from "../user.model";
import { AuthService } from "../auth.service";

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

const handleAuthentication = (expiresIn: number, email: string, userId: string, token: string) => {
  const expirationDate = new Date(new Date().getTime() + +expiresIn * 1000);

  //saving the user in the local storage
  const user = new User(email, userId, token, expirationDate)
  localStorage.setItem('userData', JSON.stringify(user));

  //we don't use disatch because for the effect this is an action without using the dispatch
  return new AuthActions.AuthenticateSuccess({
    email: email,
    userId: userId,
    token: token,
    expirationDate: expirationDate,
    redirect: true
  });
}
const handleError = (errorRes: any) => {
  let errorMessage = 'An unknown error occurred!';
  if (!errorRes.error || !errorRes.error.error) {
    return of(new AuthActions.AuthenticateFail(errorMessage));
  }
  switch (errorRes.error.error.message) {
    case 'EMAIL_EXISTS':
      errorMessage = 'This email exists already';
      break;
    case 'EMAIL_NOT_FOUND':
      errorMessage = 'This email does not exist.';
      break;
    case 'INVALID_PASSWORD':
      errorMessage = 'This password is not correct.';
      break;
  }
  return of(new AuthActions.AuthenticateFail(errorMessage));
}

//injectable is required because we need to inject things, like the actions$ and the httpClient
@Injectable()
export class AuthEffect {
  //Actions is a big observable and we can dispatch actions that not change the state if we don't tell them where to change
  constructor(private actions$: Actions, private http: HttpClient, private router: Router, private authService: AuthService) { }

  //first action handler, ofType allows to define a filter of effects for the property

  authLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.LOGIN_START),
      //we create anoher observable using other observable data
      switchMap((authData: AuthActions.LoginStart) => {
        return this.http
          .post<AuthResponseData>(
            "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" +
            environment.firebaseKey,
            {
              email: authData.payload.email,
              password: authData.payload.password,
              returnSecureToken: true,
            }
          )
          .pipe(
            tap(resData => {
              this.authService.setLogoutTimer(+resData.expiresIn * 1000)
            }),
            //mergeMap works like flatMap in order to return the correct data, because we were returning Observable<Observable<Login>>
            //insted of Observable<Action>
            //we can use just map but in the return not use the of operator
            map((resData: AuthResponseData) => {
              return handleAuthentication(+resData.expiresIn, resData.email, resData.localId, resData.idToken)
            }),
            catchError(errorRes => {
              return handleError(errorRes)
            })
          );
      })
    )
  );

  //we use the dispatch setted as false because we don't want in this case to return a new observable
  authRedirect$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.AUTHENTICATE_SUCCESS),
    tap((authSuccessAction: AuthActions.AuthenticateSuccess) => {
      if(authSuccessAction.payload.redirect){
        this.router.navigate(['/'])
      }      
    })),
    { dispatch: false }
  )

  authSignup$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.SIGNUP_START),
    switchMap((signupAction: AuthActions.SignupStart) => {
      return this.http
        .post<AuthResponseData>(
          "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" + environment.firebaseKey,
          {
            email: signupAction.payload.email,
            password: signupAction.payload.password,
            returnSecureToken: true
          }
        ).pipe(
          tap(resData => {
            this.authService.setLogoutTimer(+resData.expiresIn * 1000)
          }),
          map((resData: AuthResponseData) => {
            return handleAuthentication(+resData.expiresIn, resData.email, resData.localId, resData.idToken)
          }),
          catchError(errorRes => {
            return handleError(errorRes)
          })
        );
    })
  ))

  authLogout$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.LOGOUT), tap(() => {
      this.authService.clearLogoutTime()
      localStorage.removeItem('userData')
      this.router.navigate(['/auth'])
    })
  ), { dispatch: false })

  autoLogin$ = createEffect(() => this.actions$.pipe(
    ofType(AuthActions.AUTO_LOG_IN),
    map(() => {
      const userData: {
        email: string;
        id: string;
        _token: string;
        _tokenExpirationDate: string;
      } = JSON.parse(localStorage.getItem('userData'));
      if (!userData) {
        return{
          type: 'DUMMY'
        }
      }

      const loadedUser = new User(
        userData.email,
        userData.id,
        userData._token,
        new Date(userData._tokenExpirationDate)
      );

      if (loadedUser.token) {
        // this.user.next(loadedUser);
        const expirationDuration =  new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
        this.authService.setLogoutTimer(expirationDuration)
        return new AuthActions.AuthenticateSuccess(
          {
            email: loadedUser.email,
            userId: loadedUser.id,
            token: loadedUser.token,
            expirationDate: new Date(userData._tokenExpirationDate),
            redirect: false
          }
        )
        // const expirationDuration =
        //   new Date(userData._tokenExpirationDate).getTime() -
        //   new Date().getTime();
        // this.autoLogout(expirationDuration);
      }
      return {
        type: 'DUMMY'
      }
    })
  ))
}
