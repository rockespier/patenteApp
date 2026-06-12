import { environment } from '../../enviroments/environment';

const normalizedBaseUrl = environment.apiBaseUrl.replace(/\/$/, '');
//const normalizedApiVersionPath = `/${(environment.apiVersionPath).replace(/^\/+|\/+$/g, '')}`;

//export const API_BASE_URL = `${normalizedBaseUrl}${normalizedApiVersionPath}`;
export const API_BASE_URL = `${normalizedBaseUrl}`;


