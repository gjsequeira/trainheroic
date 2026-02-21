import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>TrainHeroic Coach Portal</h1>
      <p>
        <Link href="/login">Go to Login</Link>
      </p>
    </main>
  );
}
