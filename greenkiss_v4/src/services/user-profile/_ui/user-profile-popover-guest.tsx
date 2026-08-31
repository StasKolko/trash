import { Button } from "@/shared/ui/kit/button";

export const UserProfilePopoverGuest = ({
  onSignIn,
}: {
  onSignIn: () => void | Promise<void>;
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="font-medium text-sm">Добро пожаловать!</h4>
        <p className="text-sm text-muted-foreground">
          Войдите в свой аккаунт, чтобы получить доступ ко всем функциям
          магазина
        </p>
      </div>
      <div className="space-y-2">
        <Button className="w-full" onClick={onSignIn}>
          Войти через Яндекс
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          Нажимая "Войти", вы соглашаетесь с условиями использования
        </p>
      </div>
    </div>
  );
};
