import { toast } from "sonner";

interface NotifyOptions {
  description?: string;
}

export const notify = {
  success: (title: string, options?: NotifyOptions) => {
    toast.success(title, {
      description: options?.description,
    });
  },

  error: (error: unknown, actionContext: string) => {
    let message = "Ocorreu uma falha inesperada.";
    
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }

    if (message.toLowerCase().includes("permissão") || message.toLowerCase().includes("permission")) {
      message = "Você não tem permissão para realizar esta ação.";
    }

    toast.error(`Não foi possível ${actionContext}.`, {
      description: message,
    });
  },

  info: (title: string, description: string) => {
    toast.info(title, {
      description,
    });
  }
};