import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.VITE_HOME_OO;

export function useStoreSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 🔹 Fetch all store settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["store-settings"],
    queryFn: async () => {
      const token = localStorage.getItem("ACCESS_TOKEN");

      const res = await axios.get(`${API_BASE}/api/store-settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Convert array to object for easy access
      const settingsMap = {};

      res.data.data.forEach((setting) => {
        settingsMap[setting.setting_key] = setting.setting_value;
      });

      return settingsMap;
    },
  });

  // 🔹 Get one setting
  const getSetting = (key, defaultValue = null) => {
    return settings && settings[key] !== undefined
      ? settings[key]
      : defaultValue;
  };

  // 🔹 Update store setting (Admin)
  const updateSetting = useMutation({
    mutationFn: async ({ key, value }) => {
      const token = localStorage.getItem("ACCESS_TOKEN");

      const res = await axios.put(
        `${API_BASE}/api/store-settings/update`,
        { key, value },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-settings"] });

      toast({
        title: "Settings updated",
        description: "Store settings updated successfully ✅",
      });
    },

    onError: (error) => {
      toast({
        title: "Error updating settings",
        description:
          error?.response?.data?.message || error.message || "Update failed",
        variant: "destructive",
      });
    },
  });

  return {
    settings,
    isLoading,
    getSetting,
    updateSetting: updateSetting.mutate,
    isUpdating: updateSetting.isPending,
  };
}
