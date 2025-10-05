import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, LogIn } from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLoginMutation } from "@/hooks/useAuthMutations";

const LoginSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const Login = () => {
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useLoginMutation();

  const onSubmit = async (data) => {
    try {
      await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });
      navigate("/game");
    } catch (error) {
      // error handled via mutation state
    }
  };

  const handle42Login = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE || "/api"}/auth/42`;
  };

  return (
    <>
      <Button
        variant="outline"
        className="w-full h-12 text-base border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all bg-transparent"
        onClick={handle42Login}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.42l-4.428 4.415H24zM8.028 22.01L0 13.983V8.028L8.028 0h5.955l-5.444 5.444h4.946l3.468-3.468H24v7.08l-4.799 4.798-5.778-5.777H8.028v5.405l5.778 5.777H24v7.08h-7.047l-3.468-3.468H8.028z" />
        </svg>
        Sign in with 42
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      {loginMutation.isError && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">
            {loginMutation.error?.message || "Login failed"}
          </p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 h-11 bg-input border-border/50 focus:border-primary transition-colors"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 h-11 bg-input border-border/50 focus:border-primary transition-colors"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="text-primary hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-base font-medium"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <LogIn className="w-5 h-5" />
              </motion.div>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </>
            )}
          </Button>
        </form>
      </Form>
    </>
  );
};
