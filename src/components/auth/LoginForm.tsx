"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { email, z } from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { LoginRequest } from "@/types/auth";
import { Dictionary } from "@/lib/dictionaries";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeSelector } from "@/components/ThemeSelector";

interface LoginFormProps {
  locale: string;
  dictionary: Dictionary;
}

export function LoginForm({ locale, dictionary }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const loginSchema = z.object({
    email: email().min(1, dictionary.auth.validation.emailRequired),
    password: z.string().min(1, dictionary.auth.validation.passwordRequired),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data as LoginRequest);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Error is handled in the AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background dark:bg-background transition-colors">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeSelector dictionary={dictionary} variant="minimal" size="sm" />
        <LanguageSelector
          currentLocale={locale}
          dictionary={dictionary}
          variant="minimal"
          size="sm"
        />
      </div>
      <Card className="w-full max-w-md bg-card dark:bg-card border border-border dark:border-border shadow-lg dark:shadow-xl transition-colors">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-foreground dark:text-foreground transition-colors">
            {dictionary.auth.login.title}
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground dark:text-muted-foreground transition-colors">
            {dictionary.auth.login.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-foreground dark:text-foreground"
              >
                {dictionary.common.email}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={dictionary.auth.login.emailPlaceholder}
                {...register("email")}
                disabled={isLoading}
                className="bg-background dark:bg-input border-border dark:border-border text-foreground dark:text-foreground placeholder:text-muted-foreground dark:placeholder:text-muted-foreground transition-colors"
              />
              {errors.email && (
                <p className="text-sm text-destructive dark:text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-foreground dark:text-foreground"
              >
                {dictionary.common.password}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={dictionary.auth.login.passwordPlaceholder}
                {...register("password")}
                disabled={isLoading}
                className="bg-background dark:bg-input border-border dark:border-border text-foreground dark:text-foreground placeholder:text-muted-foreground dark:placeholder:text-muted-foreground transition-colors"
              />
              {errors.password && (
                <p className="text-sm text-destructive dark:text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary dark:bg-primary hover:bg-primary/90 dark:hover:bg-primary/90 text-primary-foreground dark:text-primary-foreground transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  {dictionary.auth.login.signingIn}
                </>
              ) : (
                dictionary.auth.login.signIn
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground dark:text-muted-foreground transition-colors">
            {dictionary.auth.login.noAccount}{" "}
            <Link
              href={`/${locale}/register`}
              className="text-primary dark:text-primary hover:underline transition-colors"
            >
              {dictionary.auth.login.signUp}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
