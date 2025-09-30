import { useUser as useClerkUser } from '@clerk/clerk-expo';

export const useUser = () => {
  const { isLoaded, isSignedIn, user } = useClerkUser();

  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
  const displayName = fullName || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'User';
  const email = user?.emailAddresses?.[0]?.emailAddress || '';
  const initials = user ?
    `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() ||
    email?.[0]?.toUpperCase() ||
    'U' : 'U';

  return {
    isLoaded,
    isSignedIn,
    user,
    fullName,
    displayName,
    email,
    initials,
    profileImageUrl: user?.imageUrl,
  };
};