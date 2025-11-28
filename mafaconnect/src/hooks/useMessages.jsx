import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

export function useMessages(conversationId) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const API_BASE = import.meta.env.VITE_HOME_OO;

  const {
    data,
    isLoading,
  } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      const res = await fetch(`${API_BASE}/messages/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
        },
      });

      const json = await res.json();

      return Array.isArray(json.data) ? json.data : [];
    },
    enabled: !!conversationId, // 🔥 stops ghost reload
    refetchInterval: 5000,     // Optional polling every 5 sec
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content }) => {
      const res = await fetch(`${API_BASE}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          content,
          receiver_id: null, // backend decides
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      return await res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["messages", conversationId]);
    },
  });

  return {
    messages: data || [],
    isLoading,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isLoading,
  };
}

// // src/hooks/useMessages.js
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { apiGet, apiPost } from "@/lib/api";
// import { useAuth } from "./useAuth";
// import { toast } from "sonner";
// import { useEffect } from "react";

// export function useMessages(conversationId) {
//   const { user, isStaff } = useAuth();
//   const queryClient = useQueryClient();

//   // FETCH MESSAGES FROM BACKEND
//   const {
//     data: messages,
//     isLoading,
//     refetch,
//   } = useQuery({
//     queryKey: ["messages", conversationId],
//     queryFn: async () => {
//       if (!conversationId) return [];

//       const res = await apiGet(`/messages/${conversationId}`);
//       // return res.data; // backend returns array of messages
//       // return res.data || [];
//       const json = await res.json();

// // MAKE SURE we only return the array
// return json.data || [];
//     },
//     enabled: !!conversationId && !!user,
//   });

//   // SIMPLE POLLING (REALT IME REPLACEMENT)
//   useEffect(() => {
//     if (!conversationId || !user) return;

//     const interval = setInterval(() => {
//       refetch(); // refresh messages every 3 seconds
//       queryClient.invalidateQueries(["conversations"]);
//     }, 3000);

//     return () => clearInterval(interval);
//   }, [conversationId, user]);

//   // SEND MESSAGE
//   const sendMessage = useMutation({
//     mutationFn: async ({ content }) => {
//       if (!conversationId) throw new Error("No conversation selected");

//       await apiPost("/messages", {
//         conversation_id: conversationId,
//         sender_id: user?.id,
//         sender_type: isStaff ? "staff" : "customer",
//         content,
//       });
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries(["messages", conversationId]);
//       queryClient.invalidateQueries(["conversations"]);
//     },
//     onError: () => {
//       toast.error("Failed to send message");
//     },
//   });

//   return {
//     messages: messages || [],
//       // messages: Array.isArray(data) ? data : [],
//     isLoading,
//     sendMessage: sendMessage.mutate,
//     isSending: sendMessage.isPending,
//   };
// }
