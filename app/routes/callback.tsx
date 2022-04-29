import { auth } from '~/utils/auth.server';

import type { LoaderFunction } from '@remix-run/node';

export const loader: LoaderFunction = async ({ request }) => {
  return auth.authenticate('google', request, {
    successRedirect: '/private',
    failureRedirect: '/',
  });
};
