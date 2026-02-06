import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu";
import { Badge } from "@/shared/components/ui/badge";
import { Bell } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

function NotificationsBell() {
  const notifications = [
    {
      id: 1,
      type: "urgent",
      title: "Aprendices terminan etapa en menos de 7 dias",
      description: "5 casos requieren atencion inmediata",
      count: 5,
      badge: "Urgente",
      badgeVariant: "destructive",
    },
    {
      id: 2,
      type: "important",
      title: "Pruebas de seleccion pendientes",
      description: "8 evaluaciones por completar",
      count: 8,
      badge: "Importante",
      badgeVariant: "default",
    },
    {
      id: 3,
      type: "info",
      title: "Convocatorias listas para cerrar",
      description: "3 convocatorias para revisar",
      count: 3,
      badge: "Informacion",
      badgeVariant: "secondary",
    },
  ];

  const totalNotifications = notifications.reduce((sum, n) => sum + n.count, 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-gray-100"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {totalNotifications > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">
              {totalNotifications}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0">
        <div className="p-4 border-b">
          <h3 className="font-bold text-foreground">Notificaciones</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Tienes {totalNotifications} alertas que requieren atencion
          </p>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.map((notification, index) => (
            <div key={notification.id}>
              <DropdownMenuItem className="p-0 cursor-pointer hover:bg-muted focus:bg-muted">
                <div className="w-full p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${
                        notification.type === "urgent"
                          ? "bg-red-500"
                          : notification.type === "important"
                            ? "bg-primary"
                            : "bg-secondary"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={notification.badgeVariant}
                          className="text-xs"
                        >
                          {notification.badge}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {notification.count} casos
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground mb-1">
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {notification.description}
                      </p>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
              {index < notifications.length - 1 && <DropdownMenuSeparator />}
            </div>
          ))}
        </div>
        <div className="p-3 border-t bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-primary hover:text-primary/80"
          >
            Ver todas las notificaciones
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export default NotificationsBell;