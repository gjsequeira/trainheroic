'use client';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (submitError) {
      setError('Unable to sign in. Please verify your credentials.');
      console.error(submitError);
    }
  };

  return (
    <main>
      <h1>Coach Login</h1>
      <form onSubmit={onSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button type="submit">Sign in</button>
      </form>

      {error ? <p>{error}</p> : null}
    </main>
  );
}
