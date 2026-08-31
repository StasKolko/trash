import type { ReactNode } from "react";

export const AdminContainer = ({
  title,
  children,
  actions,
}: {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) => {
  return (
    <div className="h-full w-full flex flex-col gap-2 md:gap-4 p-4 md:px-8">
      <div className="h-10 md:h-12 lg:h-14 flex items-center justify-between">
        <h1 className="font-bold text-md md:text-lg lg:text-xl">{title}</h1>
        {actions}
      </div>
      {children}
    </div>
  );
};
