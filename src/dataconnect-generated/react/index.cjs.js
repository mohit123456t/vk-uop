const { createUserRef, getMoviesRef, addMovieToListRef, getUserReviewsRef, connectorConfig } = require('../index.cjs.js');
const { validateArgs, CallerSdkTypeEnum } = require('firebase/data-connect');
const { useDataConnectQuery, useDataConnectMutation, validateReactArgs } = require('@tanstack-query-firebase/react/data-connect');

exports.useCreateUser = function useCreateUser(dcOrOptions, options) {
  const { dc: dcInstance, vars: inputOpts } = validateArgs(connectorConfig, dcOrOptions, options);
  function refFactory() {
    return createUserRef(dcInstance);
  }
  return useDataConnectMutation(refFactory, inputOpts, CallerSdkTypeEnum.GeneratedReact);
}


exports.useGetMovies = function useGetMovies(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts } = validateReactArgs(connectorConfig, dcOrOptions, options);
  const ref = getMoviesRef(dcInstance);
  return useDataConnectQuery(ref, inputOpts, CallerSdkTypeEnum.GeneratedReact);
}
exports.useAddMovieToList = function useAddMovieToList(dcOrOptions, options) {
  const { dc: dcInstance, vars: inputOpts } = validateArgs(connectorConfig, dcOrOptions, options);
  function refFactory() {
    return addMovieToListRef(dcInstance);
  }
  return useDataConnectMutation(refFactory, inputOpts, CallerSdkTypeEnum.GeneratedReact);
}


exports.useGetUserReviews = function useGetUserReviews(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts } = validateReactArgs(connectorConfig, dcOrOptions, options);
  const ref = getUserReviewsRef(dcInstance);
  return useDataConnectQuery(ref, inputOpts, CallerSdkTypeEnum.GeneratedReact);
}