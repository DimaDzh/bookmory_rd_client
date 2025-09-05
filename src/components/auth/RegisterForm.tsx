"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { RegisterRequest } from "@/types/auth";
import { Dictionary } from "@/lib/dictionaries";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeSelector } from "@/components/ThemeSelector";

interface RegisterFormProps {
  locale: string;
  dictionary: Dictionary;
}

export function RegisterForm({ locale, dictionary }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();

  const registerSchema = z
    .object({
      email: z.string().email(dictionary.auth.validation.invalidEmail),
      password: z.string().min(6, dictionary.auth.validation.passwordMinLength),
      confirmPassword: z.string(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: dictionary.auth.validation.passwordsDontMatch,
      path: ["confirmPassword"],
    });

  type RegisterFormData = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData as RegisterRequest);
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
            {dictionary.auth.register.title}
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground dark:text-muted-foreground transition-colors">
            {dictionary.auth.register.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-foreground dark:text-foreground"
                >
                  {dictionary.common.firstName}
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder={dictionary.auth.register.firstNamePlaceholder}
                  {...register("firstName")}
                  disabled={isLoading}
                  className="bg-background dark:bg-input border-border dark:border-border text-foreground dark:text-foreground placeholder:text-muted-foreground dark:placeholder:text-muted-foreground transition-colors"
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive dark:text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-foreground dark:text-foreground"
                >
                  {dictionary.common.lastName}
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder={dictionary.auth.register.lastNamePlaceholder}
                  {...register("lastName")}
                  disabled={isLoading}
                  className="bg-background dark:bg-input border-border dark:border-border text-foreground dark:text-foreground placeholder:text-muted-foreground dark:placeholder:text-muted-foreground transition-colors"
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive dark:text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

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
                placeholder={dictionary.auth.register.emailPlaceholder}
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
                placeholder={dictionary.auth.register.passwordPlaceholder}
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

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-foreground dark:text-foreground"
              >
                {dictionary.common.confirmPassword}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={
                  dictionary.auth.register.confirmPasswordPlaceholder
                }
                {...register("confirmPassword")}
                disabled={isLoading}
                className="bg-background dark:bg-input border-border dark:border-border text-foreground dark:text-foreground placeholder:text-muted-foreground dark:placeholder:text-muted-foreground transition-colors"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive dark:text-destructive">
                  {errors.confirmPassword.message}
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
                  {dictionary.auth.register.creatingAccount}
                </>
              ) : (
                dictionary.auth.register.createAccount
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground dark:text-muted-foreground transition-colors">
            {dictionary.auth.register.alreadyHaveAccount}{" "}
            <Link
              href={`/${locale}/login`}
              className="text-primary dark:text-primary hover:underline transition-colors"
            >
              {dictionary.auth.register.signIn}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
