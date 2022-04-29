import { redirect } from '@remix-run/node';
import { auth } from '~/utils/auth.server';

import type { ActionFunction, LoaderFunction } from '@remix-run/node';

export const loader: LoaderFunction = async () => redirect('/');

export const action: ActionFunction = ({ request }) => {
  return auth.authenticate('google', request);
};
