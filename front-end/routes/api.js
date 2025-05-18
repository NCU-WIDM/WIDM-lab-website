import { getApiUrl } from '../utils';
const API_URL = getApiUrl();

export const processDataRoutes = {
  member: `${API_URL}/member`,
  activity: `${API_URL}/activity`,
  news: `${API_URL}/news`,
  paper: `${API_URL}/paper`,
  project: `${API_URL}/project`,
  retrieval: `${API_URL}/retrieval`,
};

/**

import { getApiUrl } from '../utils';
const API_URL = getApiUrl();

// 函數用於自動生成路由
const createRoute = (base, endpoint) => `${base}/${endpoint}`;

const processDataEndpoints = [
  'fetchUploadsFileName', 'uploadTheFile', 'fetchFileContent',
  'uploadProcessedFile', 'fetchProcessedContent', 'downloadProcessedFile',
  'deleteFile', 'addExtractionLabel_all', 'removeLabel_all',
  'gptRetrieve', 'gptRetrieve_all', 'formatterProcessedContent',
  'uploadFileSort', 'downloadCSV'
];

const loginEndpoints = [
  'checkAccountExist', 'accountList'
];

// 自動生成 processDataRoutes
export const processDataRoutes = processDataEndpoints.reduce((routes, endpoint) => {
  routes[endpoint] = createRoute(API_URL, `processData/${endpoint}`);
  return routes;
}, {});

// 自動生成 loginRoutes
export const loginRoutes = loginEndpoints.reduce((routes, endpoint) => {
  routes[endpoint] = createRoute(API_URL, `login/${endpoint}`);
  return routes;
}, {});

 */
