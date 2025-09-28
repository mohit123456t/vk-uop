const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'vk-oop',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const createUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser');
}
createUserRef.operationName = 'CreateUser';
exports.createUserRef = createUserRef;

exports.createUser = function createUser(dc) {
  return executeMutation(createUserRef(dc));
};

const getMoviesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMovies');
}
getMoviesRef.operationName = 'GetMovies';
exports.getMoviesRef = getMoviesRef;

exports.getMovies = function getMovies(dc) {
  return executeQuery(getMoviesRef(dc));
};

const addMovieToListRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddMovieToList');
}
addMovieToListRef.operationName = 'AddMovieToList';
exports.addMovieToListRef = addMovieToListRef;

exports.addMovieToList = function addMovieToList(dc) {
  return executeMutation(addMovieToListRef(dc));
};

const getUserReviewsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserReviews');
}
getUserReviewsRef.operationName = 'GetUserReviews';
exports.getUserReviewsRef = getUserReviewsRef;

exports.getUserReviews = function getUserReviews(dc) {
  return executeQuery(getUserReviewsRef(dc));
};
