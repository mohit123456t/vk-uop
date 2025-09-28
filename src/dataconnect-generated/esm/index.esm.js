import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'vk-oop',
  location: 'us-central1'
};

export const createUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser');
}
createUserRef.operationName = 'CreateUser';

export function createUser(dc) {
  return executeMutation(createUserRef(dc));
}

export const getMoviesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMovies');
}
getMoviesRef.operationName = 'GetMovies';

export function getMovies(dc) {
  return executeQuery(getMoviesRef(dc));
}

export const addMovieToListRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddMovieToList');
}
addMovieToListRef.operationName = 'AddMovieToList';

export function addMovieToList(dc) {
  return executeMutation(addMovieToListRef(dc));
}

export const getUserReviewsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserReviews');
}
getUserReviewsRef.operationName = 'GetUserReviews';

export function getUserReviews(dc) {
  return executeQuery(getUserReviewsRef(dc));
}

