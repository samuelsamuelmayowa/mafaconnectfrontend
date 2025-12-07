import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/Button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  User,
  Copy,
  Upload,
  AlertTriangle,
  Trash2,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Shield,
  Check,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Loader2, User, Copy, Upload, AlertTriangle, Trash2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/Label";

const profileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, hyphens, and underscores"
    )
    .optional()
    .or(z.literal("")),
  full_name: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Full name must be less than 100 characters"),
  phone: z.string().optional().or(z.literal("")),
});

export default function ProfileSettings() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPasswordSection, setShowPasswordSection] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPasswordValue, setNewPasswordValue] = React.useState("");
  const [confirmNewPassword, setConfirmNewPassword] = React.useState("");
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [changingPassword, setChangingPassword] = React.useState(false);

  const [avatarUrl, setAvatarUrl] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const fileInputRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      full_name: "",
      phone: "",
      
    },
  });

  // ------------------------------
  // FETCH PROFILE DATA (React Query)
  // ------------------------------
  const API_URL = import.meta.env.VITE_HOME_OO;
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    enabled: !!user,
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      alert("load ");
      console.log("PROFILE RESPONSE:", res.data);

      return res.data.user;
    },
  });

  // ------------------------------
  // UPDATE PROFILE (React Query)
  // ------------------------------
  const updateProfileMutation = useMutation({
    mutationFn: async (values) => {
      return axios.put("/api/profile/me", values);
    },
    onSuccess: () => {
      toast({ title: "Profile updated successfully" });
      queryClient.invalidateQueries(["profile"]);
    },
    onError: () => {
      toast({ title: "Failed to update profile", variant: "destructive" });
    },
  });

  const onSubmit = (values) => {
    updateProfileMutation.mutate(values);
  };

  // ------------------------------
  // UPLOAD AVATAR
  // ------------------------------
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result;

        await axios.put("/api/profile/avatar", { avatar_url: base64 });

        setAvatarUrl(base64);
        toast({ title: "Avatar updated successfully" });
      } catch (err) {
        toast({ title: "Failed to upload", variant: "destructive" });
      }
    };

    reader.readAsDataURL(file);
  };

  // ------------------------------
  // COPY ACCOUNT NUMBER
  // ------------------------------
  const copyAccountNumber = () => {
    navigator.clipboard.writeText(accountNumber);
    toast({ title: "Copied!", description: "Account number copied." });
  };

  // ------------------------------
  // DELETE ACCOUNT
  // ------------------------------
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      return axios.delete("/api/profile/delete", {
        data: {
          password: deletePassword,
          confirmation: deleteConfirmText,
        },
      });
    },
    onSuccess: () => {
      toast({ title: "Account deleted" });
      window.location.href = "/logout";
    },
    onError: () => {
      toast({ title: "Delete failed", variant: "destructive" });
    },
  });

  const handleDeleteAccount = () => {
    deleteAccountMutation.mutate();
  };

  // ------------------------------
  // LOADING STATE
  // ------------------------------
  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // ------------------------------
  // UI SECTION
  // ------------------------------
  return (
    <div className="container max-w-2xl py-8 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-6 w-6" />
            <CardTitle>Profile Settings</CardTitle>
          </div>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>
                    {form.getValues("name")?.charAt(0) || "U"}
                    {/* {form.getValues("name")?.charAt(0) || "U"} */}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" /> Upload Photo
                  </Button>
                </div>
              </div>

              {/* Account Number */}
              {user?.account_number && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium">Account Number</p>
                      <p className="text-2xl font-bold text-primary">
                        MFC-{user?.account_number}
                      </p>
                    </div>

                    <Button variant="outline" onClick={copyAccountNumber}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* User ID */}
              {/* <FormItem>
                <FormLabel>User ID</FormLabel>
                <FormControl>
                  <Input value={user?.id} disabled />
                </FormControl>
              </FormItem> */}

              {/* Email */}
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  {/* <Input value={profileData?.email || ""} disabled /> */}
                  <Input value={user?.email} disabled />
                </FormControl>
              </FormItem>

              {/* Username */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input value={user?.name} disabled />
                      {/* <Input placeholder="Enter username" {...field} /> */}
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Full Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                          <Input value={user?.name} disabled />
                      {/* <Input placeholder="Enter full name" {...field} /> */}
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                          <Input value={user?.phone} disabled />
                      {/* <Input placeholder="Enter phone" {...field} /> */}
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-6 w-6" />
              <CardTitle>Security</CardTitle>
            </div>
          </div>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showPasswordSection ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Keep your account secure by using a strong, unique password.
              </p>
              <Button
                variant="outline"
                onClick={() => setShowPasswordSection(true)}
                className="w-full"
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Change Password
              </Button>
            </div>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Password Requirements</AlertTitle>
                <AlertDescription className="text-xs">
                  Your password must be at least 6 characters long. We recommend
                  using a mix of uppercase, lowercase, numbers, and special
                  characters.
                </AlertDescription>
              </Alert>

              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                    disabled={changingPassword}
                    className="pr-10"
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    disabled={changingPassword}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPasswordValue}
                    onChange={(e) => setNewPasswordValue(e.target.value)}
                    placeholder="Enter new password"
                    required
                    minLength={6}
                    disabled={changingPassword}
                    className="pr-10"
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    disabled={changingPassword}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>

                {/* Password Strength Indicator */}
                {newPasswordValue && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      <div
                        className={`h-1 flex-1 rounded ${
                          newPasswordValue.length >= 6
                            ? "bg-green-500"
                            : "bg-muted"
                        }`}
                      />
                      <div
                        className={`h-1 flex-1 rounded ${
                          newPasswordValue.length >= 10
                            ? "bg-green-500"
                            : "bg-muted"
                        }`}
                      />
                      <div
                        className={`h-1 flex-1 rounded ${
                          /[A-Z]/.test(newPasswordValue) &&
                          /[0-9]/.test(newPasswordValue)
                            ? "bg-green-500"
                            : "bg-muted"
                        }`}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {newPasswordValue.length < 6 &&
                        "Password too short (minimum 6 characters)"}
                      {newPasswordValue.length >= 6 &&
                        newPasswordValue.length < 10 &&
                        "Good password"}
                      {newPasswordValue.length >= 10 &&
                        /[A-Z]/.test(newPasswordValue) &&
                        /[0-9]/.test(newPasswordValue) &&
                        "Strong password!"}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                  disabled={changingPassword}
                  autoComplete="new-password"
                />
                {confirmNewPassword &&
                  newPasswordValue !== confirmNewPassword && (
                    <p className="text-xs text-destructive">
                      Passwords do not match
                    </p>
                  )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={
                    changingPassword ||
                    !currentPassword ||
                    !newPasswordValue ||
                    !confirmNewPassword ||
                    newPasswordValue !== confirmNewPassword ||
                    newPasswordValue.length < 6
                  }
                  className="flex-1"
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Update Password
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordSection(false);
                    setCurrentPassword("");
                    setNewPasswordValue("");
                    setConfirmNewPassword("");
                  }}
                  disabled={changingPassword}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
      {/* -------------------- */}
      {/* DANGER ZONE */}
      {/* -------------------- */}

      <Card className="border-destructive">
        {/* <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader> */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions that will permanently affect your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Account deletion is permanent and cannot be undone. This will:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Delete your profile and personal information</li>
                  <li>Remove all your loyalty points</li>
                  <li>Delete all your messages and conversations</li>
                  <li>Clear your shopping cart</li>
                  <li>
                    Anonymize (but not delete) order history for business
                    records
                  </li>
                </ul>
              </AlertDescription>
            </Alert>

            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="w-full"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete My Account
            </Button>
          </CardContent>
        </Card>

        {/* <CardContent>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete My Account
          </Button>
        </CardContent> */}
      </Card>

      {/* DELETE DIALOG */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Delete Account?
            </AlertDialogTitle>

            <AlertDialogDescription>
              <p className="font-semibold">This action cannot be undone.</p>

              <div className="space-y-2 mt-4">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                />
              </div>

              <div className="space-y-2 mt-4">
                <Label>Type DELETE</Label>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              disabled={deleteConfirmText !== "DELETE"}
              className="bg-destructive"
              onClick={handleDeleteAccount}
            >
              {deleteAccountMutation.isPending
                ? "Deleting..."
                : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
