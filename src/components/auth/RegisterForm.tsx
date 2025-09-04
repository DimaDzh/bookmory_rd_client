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
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {dictionary.auth.register.title}
          </CardTitle>
          <CardDescription className="text-center">
            {dictionary.auth.register.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{dictionary.common.firstName}</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder={dictionary.auth.register.firstNamePlaceholder}
                  {...register("firstName")}
                  disabled={isLoading}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">{dictionary.common.lastName}</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder={dictionary.auth.register.lastNamePlaceholder}
                  {...register("lastName")}
                  disabled={isLoading}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{dictionary.common.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder={dictionary.auth.register.emailPlaceholder}
                {...register("email")}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{dictionary.common.password}</Label>
              <Input
                id="password"
                type="password"
                placeholder={dictionary.auth.register.passwordPlaceholder}
                {...register("password")}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
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
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {dictionary.auth.register.creatingAccount}
                </>
              ) : (
                dictionary.auth.register.createAccount
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            {dictionary.auth.register.alreadyHaveAccount}{" "}
            <Link
              href={`/${locale}/login`}
              className="text-primary hover:underline"
            >
              {dictionary.auth.register.signIn}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
