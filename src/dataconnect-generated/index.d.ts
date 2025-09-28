import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AddMovieToListData {
  movieListEntry_insert: MovieListEntry_Key;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface GetMoviesData {
  movies: ({
    id: UUIDString;
    title: string;
    year: number;
  } & Movie_Key)[];
}

export interface GetUserReviewsData {
  reviews: ({
    id: UUIDString;
    rating: number;
    text?: string | null;
    movie: {
      title: string;
    };
  } & Review_Key)[];
}

export interface MovieListEntry_Key {
  movieListId: UUIDString;
  movieId: UUIDString;
  __typename?: 'MovieListEntry_Key';
}

export interface MovieList_Key {
  id: UUIDString;
  __typename?: 'MovieList_Key';
}

export interface Movie_Key {
  id: UUIDString;
  __typename?: 'Movie_Key';
}

export interface Review_Key {
  id: UUIDString;
  __typename?: 'Review_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

export interface Watch_Key {
  id: UUIDString;
  __typename?: 'Watch_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateUserData, undefined>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(): MutationPromise<CreateUserData, undefined>;
export function createUser(dc: DataConnect): MutationPromise<CreateUserData, undefined>;

interface GetMoviesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMoviesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMoviesData, undefined>;
  operationName: string;
}
export const getMoviesRef: GetMoviesRef;

export function getMovies(): QueryPromise<GetMoviesData, undefined>;
export function getMovies(dc: DataConnect): QueryPromise<GetMoviesData, undefined>;

interface AddMovieToListRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<AddMovieToListData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<AddMovieToListData, undefined>;
  operationName: string;
}
export const addMovieToListRef: AddMovieToListRef;

export function addMovieToList(): MutationPromise<AddMovieToListData, undefined>;
export function addMovieToList(dc: DataConnect): MutationPromise<AddMovieToListData, undefined>;

interface GetUserReviewsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserReviewsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetUserReviewsData, undefined>;
  operationName: string;
}
export const getUserReviewsRef: GetUserReviewsRef;

export function getUserReviews(): QueryPromise<GetUserReviewsData, undefined>;
export function getUserReviews(dc: DataConnect): QueryPromise<GetUserReviewsData, undefined>;

