import type { City } from './cityParser';

export const getCityKey = (cityItem: City) => `${cityItem.city}-${cityItem.state_id}`;
