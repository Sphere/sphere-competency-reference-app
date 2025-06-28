
export const getCompetencyConfig = () => ({
  config: JSON.parse(localStorage.getItem('competency') || '{}'),
  isOnlyPassbook: localStorage.getItem('isOnlyPassbook') || ''
});
export const COMPETENCY_REGISTRATION_CONFIG = getCompetencyConfig();