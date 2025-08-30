'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Github, Mail } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'emailRequired' })
    .email({ message: 'emailInvalid' }),
  password: z
    .string()
    .min(1, { message: 'passwordRequired' })
    .min(8, { message: 'passwordMinLength' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectUrl = searchParams.get('redirect') || '/';

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        setError(t('auth.invalidCredentials'));
        return;
      }

      // Redirect to intended page on successful login
      router.push(redirectUrl);
      router.refresh();
    } catch (err) {
      console.error('Login error:', err);
      setError(t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await authClient.signIn.social({
        provider: 'github',
        callbackURL: redirectUrl,
      });
    } catch (err) {
      console.error('GitHub login error:', err);
      setError(t('auth.loginError'));
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: redirectUrl,
      });
    } catch (err) {
      console.error('Google login error:', err);
      setError(t('auth.loginError'));
      setIsLoading(false);
    }
  };

  return (
    <div className="font-sans min-h-screen bg-background flex items-center justify-center p-4">
      {/* Header with theme and language toggles */}
      <header className="fixed top-4 right-4 flex gap-2 z-50">
        <ThemeToggle />
        <LanguageToggle />
      </header>

      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {t('auth.welcomeBack')}
            </CardTitle>
            <CardDescription>
              {t('auth.loginDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={handleGithubLogin}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Mail className="h-4 w-4" />
                  Google
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {t('auth.orContinueWith')}
                  </span>
                </div>
              </div>

              {/* Email/Password Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {error && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                      {error}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.email')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="name@example.com"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage>
                          {form.formState.errors.email?.message && 
                           t(`auth.${form.formState.errors.email.message}`)}
                        </FormMessage>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.password')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage>
                          {form.formState.errors.password?.message && 
                           t(`auth.${form.formState.errors.password.message}`)}
                        </FormMessage>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? t('auth.loggingIn') : t('auth.login')}
                  </Button>
                </form>
              </Form>

              <div className="text-center text-sm text-muted-foreground">
                {t('auth.noAccount')}{' '}
                <button
                  onClick={() => router.push('/register')}
                  className="text-primary hover:underline"
                >
                  {t('auth.register')}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
