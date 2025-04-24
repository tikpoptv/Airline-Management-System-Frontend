// Define and export the tab list and type together
export const tabs = ['Dashboard', 'Flight', 'Pathway', 'Aircraft', 'Crew', 'Maintenance'] as const;
export type Tab = (typeof tabs)[number];