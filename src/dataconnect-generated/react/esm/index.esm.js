import { createUserRef, getMoviesRef, addMovieToListRef, getUserReviewsRef, connectorConfig } from '../../esm/index.esm.js';
import { validateArgs, CallerSdkTypeEnum } from 'firebase/data-connect';
import { useDataConnectQuery, useDataConnectMutation, validateReactArgs } from '@tanstack-query-firebase/react/data-connect';

export function useCreateUser(dcOrOptions, options) {
  const { dc: dcInstance, vars: inputOpts } = validateArgs(connectorConfig, dcOrOptions, options);
  function refFactory() {
    return createUserRef(dcInstance);
  }
  return useDataConnectMutation(refFactory, inputOpts, CallerSdkTypeEnum.GeneratedReact);
}


export function useGetMovies(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts } = validateReactArgs(connectorConfig, dcOrOptions, options);
  const ref = getMoviesRef(dcInstance);
  return useDataConnectQuery(ref, inputOpts, CallerSdkTypeEnum.GeneratedReact);
}
export function useAddMovieToList(dcOrOptions, options) {
  const { dc: dcInstance, vars: inputOpts } = validateArgs(connectorConfig, dcOrOptions, options);
  function refFactory() {
    return addMovieToListRef(dcInstance);
  }
  return useDataConnectMutation(refFactory, inputOpts, CallerSdkTypeEnum.GeneratedReact);
}


export function useGetUserReviews(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts } = validateReactArgs(connectorConfig, dcOrOptions, options);
  const ref = getUserReviewsRef(dcInstance);
  return useDataConnectQuery(ref, inputOpts, CallerSdkTypeEnum.GeneratedReact);
}