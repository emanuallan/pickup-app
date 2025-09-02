/**
 * Utility functions for user display and data handling
 */

/**
 * Get display name for a user, falling back to username from email if no display name is set
 * @param user User object with display_name and email fields
 * @returns Display name or username extracted from email
 */
export const getUserDisplayName = (user: { display_name?: string | null; email?: string | null }): string => {
  if (user.display_name && user.display_name.trim()) {
    return user.display_name;
  }
  
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return 'User';
};

/**
 * Get user initials for avatar display
 * @param user User object with display_name and email fields
 * @returns Single character initial (uppercase)
 */
export const getUserInitial = (user: { display_name?: string | null; email?: string | null }): string => {
  const displayName = getUserDisplayName(user);
  return displayName.charAt(0).toUpperCase();
};

/**
 * Extract username from email address
 * @param email Email address
 * @returns Username part before @ symbol
 */
export const getUsernameFromEmail = (email: string): string => {
  return email.split('@')[0];
};