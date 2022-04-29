import { createCookieSessionStorage } from '@remix-run/node';
import { Authenticator } from 'remix-auth';
import { GoogleStrategy } from 'remix-auth-google';
import {
  CALLBACK_URL,
  CLIENT_ID,
  CLIENT_SECRET,
  SECRETS,
} from '~/constants/index.server';

import type { GoogleExtraParams, GoogleProfile } from 'remix-auth-google';

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '_remix_session',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: [SECRETS],
    secure: process.env.NODE_ENV === 'production',
  },
});

export const auth = new Authenticator<{
  profile: GoogleProfile;
  extraParams: GoogleExtraParams;
  accessToken: string;
}>(sessionStorage, {
  sessionKey: 'accessToken',
});

const googleStrategy = new GoogleStrategy(
  {
    callbackURL: CALLBACK_URL,
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    scope: 'openid profile email https://www.googleapis.com/auth/tasks',
  },
  async ({ profile, extraParams, accessToken }) => {
    console.log(extraParams);
    //
    // Use the returned information to process or write to the DB.
    //
    return { profile, extraParams, accessToken };
  },
);

auth.use(googleStrategy);

export const { getSession, commitSession, destroySession } = sessionStorage;
