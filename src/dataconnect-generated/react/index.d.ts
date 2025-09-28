import { CreateUserData, GetMoviesData, AddMovieToListData, GetUserReviewsData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;

export function useGetMovies(options?: useDataConnectQueryOptions<GetMoviesData>): UseDataConnectQueryResult<GetMoviesData, undefined>;
export function useGetMovies(dc: DataConnect, options?: useDataConnectQueryOptions<GetMoviesData>): UseDataConnectQueryResult<GetMoviesData, undefined>;

export function useAddMovieToList(options?: useDataConnectMutationOptions<AddMovieToListData, FirebaseError, void>): UseDataConnectMutationResult<AddMovieToListData, undefined>;
export function useAddMovieToList(dc: DataConnect, options?: useDataConnectMutationOptions<AddMovieToListData, FirebaseError, void>): UseDataConnectMutationResult<AddMovieToListData, undefined>;

export function useGetUserReviews(options?: useDataConnectQueryOptions<GetUserReviewsData>): UseDataConnectQueryResult<GetUserReviewsData, undefined>;
export function useGetUserReviews(dc: DataConnect, options?: useDataConnectQueryOptions<GetUserReviewsData>): UseDataConnectQueryResult<GetUserReviewsData, undefined>;
