import { json } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { auth, getSession } from '~/utils/auth.server';
import { Button } from '@mantine/core';
import { BrandGoogle } from 'tabler-icons-react';

import type { LoaderFunction } from '@remix-run/node';

type LoaderData = {
  error: { message: string } | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  await auth.isAuthenticated(request, { successRedirect: '/private' });
  const session = await getSession(request.headers.get('Cookie'));
  const error = session.get(auth.sessionErrorKey) as LoaderData['error'];
  return json<LoaderData>({ error });
};

export default function Screen() {
  const { error } = useLoaderData<LoaderData>();

  return (
    <Form method="post" action="/google">
      {error ? <div>{error.message}</div> : null}
      <Button leftIcon={<BrandGoogle />} type="submit">
        Sign In with Google
      </Button>
    </Form>
  );
}
