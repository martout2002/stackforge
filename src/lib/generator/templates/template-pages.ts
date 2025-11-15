import { ScaffoldConfigWithFramework } from '@/types';

/**
 * Get color classes based on the selected color scheme
 */
function getColorClasses(colorScheme: string) {
  switch (colorScheme) {
    case 'purple':
      return {
        primary: 'purple-600',
        primaryHover: 'purple-700',
        primaryLight: 'purple-50',
        accent: 'purple-500',
        accentHover: 'purple-600',
      };
    case 'gold':
      return {
        primary: 'amber-600',
        primaryHover: 'amber-700',
        primaryLight: 'amber-50',
        accent: 'amber-500',
        accentHover: 'amber-600',
      };
    case 'white':
      return {
        primary: 'gray-900',
        primaryHover: 'gray-800',
        primaryLight: 'gray-50',
        accent: 'gray-700',
        accentHover: 'gray-800',
      };
    case 'futuristic':
      return {
        primary: 'cyan-600',
        primaryHover: 'cyan-700',
        primaryLight: 'cyan-50',
        accent: 'cyan-500',
        accentHover: 'cyan-600',
      };
    default:
      return {
        primary: 'blue-600',
        primaryHover: 'blue-700',
        primaryLight: 'blue-50',
        accent: 'blue-500',
        accentHover: 'blue-600',
      };
  }
}

/**
 * Generate template dashboard page (boilerplate)
 */
export function generateTemplateDashboardPage(config: ScaffoldConfigWithFramework): string {
  const hasAuth = config.auth !== 'none';
  const isClerk = config.auth === 'clerk';
  const isNextAuth = config.auth === 'nextauth';
  const colors = getColorClasses(config.colorScheme);
  
  return `${hasAuth && isClerk ? "import { UserButton } from '@clerk/nextjs';" : ''}
${hasAuth && isNextAuth ? "import { signOut } from 'next-auth/react';" : ''}
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">${config.projectName}</h1>
          <div className="flex items-center gap-4">
            ${hasAuth && isClerk ? '<UserButton />' : ''}
            ${hasAuth && isNextAuth ? `
            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Sign Out
            </button>` : ''}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to your Dashboard</h2>
          <p className="text-gray-600">${config.description}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900">1,234</p>
            <p className="text-sm text-green-600 mt-2">↑ 12% from last month</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Active Sessions</h3>
            <p className="text-3xl font-bold text-gray-900">567</p>
            <p className="text-sm text-green-600 mt-2">↑ 8% from last month</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Revenue</h3>
            <p className="text-3xl font-bold text-gray-900">$12,345</p>
            <p className="text-sm text-red-600 mt-2">↓ 3% from last month</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/profile"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-${colors.accent} hover:bg-${colors.primaryLight} transition-colors"
            >
              <div className="text-2xl mb-2">👤</div>
              <h4 className="font-medium text-gray-900">View Profile</h4>
              <p className="text-sm text-gray-500">Manage your account</p>
            </Link>
            <Link
              href="/settings"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-${colors.accent} hover:bg-${colors.primaryLight} transition-colors"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <h4 className="font-medium text-gray-900">Settings</h4>
              <p className="text-sm text-gray-500">Configure preferences</p>
            </Link>
            <Link
              href="/analytics"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-${colors.accent} hover:bg-${colors.primaryLight} transition-colors"
            >
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-medium text-gray-900">Analytics</h4>
              <p className="text-sm text-gray-500">View insights</p>
            </Link>
            <Link
              href="/help"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-${colors.accent} hover:bg-${colors.primaryLight} transition-colors"
            >
              <div className="text-2xl mb-2">❓</div>
              <h4 className="font-medium text-gray-900">Help & Support</h4>
              <p className="text-sm text-gray-500">Get assistance</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
`;
}

/**
 * Generate template sign-in page (boilerplate)
 */
export function generateTemplateSignInPage(config: ScaffoldConfigWithFramework): string {
  const isClerk = config.auth === 'clerk';
  const isNextAuth = config.auth === 'nextauth';
  const isSupabase = config.auth === 'supabase';
  const colors = getColorClasses(config.colorScheme);
  
  if (isClerk) {
    return `import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <SignIn />
    </div>
  );
}
`;
  }
  
  if (isNextAuth) {
    return `'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/signup" className="font-medium text-${colors.primary} hover:text-${colors.accent}">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-${colors.accent} focus:border-${colors.accent} focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-${colors.accent} focus:border-${colors.accent} focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-${colors.primary} hover:text-${colors.accent}">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-${colors.primary} hover:bg-${colors.primaryHover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${colors.accent} disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
`;
  }
  
  // Supabase or generic
  return `'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // TODO: Implement ${isSupabase ? 'Supabase' : 'your'} authentication logic
    try {
      // Placeholder for authentication
      console.log('Sign in with:', { email, password });
      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/signup" className="font-medium text-${colors.primary} hover:text-${colors.accent}">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-${colors.accent} focus:border-${colors.accent} sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-${colors.accent} focus:border-${colors.accent} sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-${colors.primary} hover:text-${colors.accent}">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-${colors.primary} hover:bg-${colors.primaryHover} focus:outline-none disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
`;
}

/**
 * Generate template sign-up page (boilerplate)
 */
export function generateTemplateSignUpPage(config: ScaffoldConfigWithFramework): string {
  const isClerk = config.auth === 'clerk';
  const colors = getColorClasses(config.colorScheme);
  
  if (isClerk) {
    return `import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <SignUp />
    </div>
  );
}
`;
  }
  
  return `'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement your authentication logic
      console.log('Sign up with:', { name, email, password });
      router.push('/signin');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/signin" className="font-medium text-${colors.primary} hover:text-${colors.accent}">
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">Full name</label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-${colors.accent} focus:border-${colors.accent} sm:text-sm"
                placeholder="Full name"
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-${colors.accent} focus:border-${colors.accent} sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-${colors.accent} focus:border-${colors.accent} sm:text-sm"
                placeholder="Password (min. 8 characters)"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">Confirm password</label>
              <input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-${colors.accent} focus:border-${colors.accent} sm:text-sm"
                placeholder="Confirm password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-${colors.primary} hover:bg-${colors.primaryHover} focus:outline-none disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
`;
}

/**
 * Generate template forgot password page (boilerplate)
 */
export function generateTemplateForgotPasswordPage(config: ScaffoldConfigWithFramework): string {
  const colors = getColorClasses(config.colorScheme);
  
  return `'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // TODO: Implement password reset logic
      console.log('Password reset requested for:', email);
      setSubmitted(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-green-600 text-4xl">✓</div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Check your email
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent password reset instructions to <strong>{email}</strong>
            </p>
            <div className="mt-6">
              <Link
                href="/signin"
                className="font-medium text-${colors.primary} hover:text-${colors.accent}"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-${colors.accent} focus:border-${colors.accent} sm:text-sm"
              placeholder="Email address"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-${colors.primary} hover:bg-${colors.primaryHover} focus:outline-none disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send reset instructions'}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/signin"
              className="font-medium text-${colors.primary} hover:text-${colors.accent} text-sm"
            >
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
`;
}
