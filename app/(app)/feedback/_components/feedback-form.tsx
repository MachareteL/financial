"use client";

import { useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { FeedbackSchema } from "@/domain/entities/feedback";
import {
  sendFeedback,
  type FeedbackFormValues,
} from "../_actions/send-feedback";

// Extend Domain Schema with UI-specific fields
const formSchema = FeedbackSchema.pick({
  type: true,
  title: true,
  description: true,
  email: true,
}).extend({
  shouldIdentify: z.boolean().default(false),
});

export function FeedbackForm() {
  const { session } = useAuth();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "bug",
      title: "",
      description: "",
      email: "",
      shouldIdentify: false,
    },
  });

  const shouldIdentify = form.watch("shouldIdentify");

  // Manage email field based on identification choice
  useEffect(() => {
    if (shouldIdentify) {
      // If opting to identify, try to fill with session email
      if (session?.user?.email) {
        form.setValue("email", session.user.email);
      }
    } else {
      // If anonymous, clear email
      form.setValue("email", "");
    }
  }, [shouldIdentify, session, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Determine final email based on identify flag
    const finalValues: FeedbackFormValues = {
      ...values,
      email: values.shouldIdentify ? values.email : "",
    };

    startTransition(async () => {
      const result = await sendFeedback(finalValues);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          "Recebemos sua mensagem! Obrigado por nos ajudar a melhorar o Lemon."
        );
        form.reset({
          type: "bug",
          title: "",
          description: "",
          email: "",
          shouldIdentify: false,
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Feedback</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="bug">Reportar Bug</SelectItem>
                    <SelectItem value="suggestion">Sugestão</SelectItem>
                    <SelectItem value="complaint">Reclamação</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Resumo do problema ou sugestão"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição Detalhada</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva com detalhes o que aconteceu ou o que você gostaria de ver no Lemon..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="shouldIdentify"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Quero me identificar</FormLabel>
                  <FormDescription>
                    Este formulário é anônimo. Marque esta opção se deseja se
                    identificar e entraremos em contato com você a respeito da
                    sua solicitação.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {shouldIdentify && (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <FormLabel>Email para Contato</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="seu@email.com"
                      {...field}
                      disabled={!!session?.user?.email}
                      className={
                        session?.user?.email
                          ? "bg-muted text-muted-foreground"
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Feedback
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
