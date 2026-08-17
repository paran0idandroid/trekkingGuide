import { createMapTilerOutdoorStyleUrl } from '../lib/routeMapState';

const mapTilerApiKey = (import.meta.env.VITE_MAPTILER_API_KEY || '').trim();

export const mapTilerOutdoorStyleUrl = mapTilerApiKey
  ? createMapTilerOutdoorStyleUrl(mapTilerApiKey)
  : '';
