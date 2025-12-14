import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Crown,
  Shield,
  Users,
  UserCog,
  ShoppingCart,
  ArrowDown,
  ArrowUp,
  Clock,
  Activity,
} from "lucide-react";

import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const API_BASE = import.meta.env.VITE_HOME_OO;

/* ===============================
   API HELPERS
================================ */
const fetchSuperusers = async () => {
  const res = await fetch(`${API_BASE}/admin/superusers`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch superusers");
  return res.json();
};

const fetchAdmins = async () => {
  const res = await fetch(`${API_BASE}/admin/admins`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch admins");
  return res.json();
};

const fetchActivityLogs = async () => {
  const res = await fetch(`${API_BASE}/admin/superuser-logs`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch logs");
  return res.json();
};

const promoteUser = async (userId) => {
  const res = await fetch(`${API_BASE}/admin/promote-superuser/${userId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
    },
  });
  if (!res.ok) throw new Error("Promotion failed");
  return res.json();
};

const demoteUser = async (userId) => {
  const res = await fetch(`${API_BASE}/admin/demote-superuser/${userId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
    },
  });
  if (!res.ok) throw new Error("Demotion failed");
  return res.json();
};

/* ===============================
   COMPONENT
================================ */
export default function SuperuserManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [userToPromote, setUserToPromote] = useState(null);
  const [userToDemote, setUserToDemote] = useState(null);

  /* ===== Queries ===== */
  const { data: superusers = [], isLoading: isLoadingSuperusers } = useQuery({
    queryKey: ["superusers"],
    queryFn: fetchSuperusers,
  });

  const { data: admins = [], isLoading: isLoadingAdmins } = useQuery({
    queryKey: ["admins"],
    queryFn: fetchAdmins,
  });

  const { data: activityLogs = [], isLoading: isLoadingLogs } = useQuery({
    queryKey: ["superuserLogs"],
    queryFn: fetchActivityLogs,
  });

  /* ===== Mutations ===== */
  const promoteMutation = useMutation({
    mutationFn: promoteUser,
    onSuccess: () => {
      toast.success("User promoted to superuser");
      queryClient.invalidateQueries();
      setUserToPromote(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const demoteMutation = useMutation({
    mutationFn: demoteUser,
    onSuccess: () => {
      toast.success("Superuser demoted");
      queryClient.invalidateQueries();
      setUserToDemote(null);
    },
    onError: (err) => toast.error(err.message),
  });

  /* ===============================
     UI
  ================================ */
  return (
    <div className="space-y-6">
      {/* ROLE HIERARCHY */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="text-amber-500" />
            Role Hierarchy
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap justify-center gap-4">
          {[
            ["Superuser", Crown, "amber"],
            ["Admin", Shield, "red"],
            ["Manager", UserCog, "blue"],
            ["Sales Agent", ShoppingCart, "green"],
            ["Customer", Users, "gray"],
          ].map(([label, Icon, color]) => (
            <div key={label} className={`px-4 py-2 rounded-lg border bg-${color}-500/10`}>
              <div className="flex items-center gap-2">
                <Icon className={`text-${color}-500`} />
                <span className="font-semibold">{label}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* CURRENT SUPERUSERS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="text-amber-500" />
            Current Superusers ({superusers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingSuperusers ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Promoted</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {superusers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      {u.name} {u.id === user?.id && <Badge>You</Badge>}
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      {u.promoted_at
                        ? format(new Date(u.promoted_at), "MMM d, yyyy")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={u.id === user?.id}
                            onClick={() => setUserToDemote(u.id)}
                          >
                            <ArrowDown className="mr-1 h-4 w-4" />
                            Demote
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Demote Superuser</AlertDialogTitle>
                            <AlertDialogDescription>
                              This user will lose superuser privileges.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => demoteMutation.mutate(u.id)}
                            >
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* PROMOTE ADMIN */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUp className="text-primary" />
            Promote Admin to Superuser
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAdmins ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <Table>
              <TableBody>
                {admins.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.name}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button onClick={() => setUserToPromote(a.id)}>
                            <Crown className="mr-1 h-4 w-4" />
                            Promote
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Promote to Superuser</AlertDialogTitle>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => promoteMutation.mutate(a.id)}
                            >
                              Promote
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ACTIVITY LOG */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity />
            Superuser Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingLogs ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            activityLogs.map((log) => (
              <div key={log.id} className="flex gap-2 text-sm border p-2 rounded">
                <Clock />
                <span>{log.action.replace("_", " ")}</span>
                <span className="ml-auto text-muted-foreground">
                  {format(new Date(log.created_at), "MMM d, yyyy h:mm a")}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
