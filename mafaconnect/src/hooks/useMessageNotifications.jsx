import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useMessageNotifications(currentConversationId = null) {
  const queryClient = useQueryClient();
  const lastCheck = useRef(0);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("USER_DATA"));

    // 🔴 Prevent crash if no user
    if (!user) {
      console.warn("No user found in storage. Skipping notifications.");
      return;
    }

    const checkMessages = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_HOME_OO}/messages/unread`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
          },
        });

        const data = await res.json();

        if (data?.count > 0) {
          toast(`You have ${data.count} new message(s)`);
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      } catch (err) {
        console.log("Notification check failed:", err.message);
      }
    };

    const interval = setInterval(checkMessages, 5000);

    return () => clearInterval(interval);
  }, [currentConversationId, queryClient]);
}




// import { useEffect, useRef } from "react";
// import { useQueryClient } from "@tanstack/react-query";
// import { toast } from "sonner";


// export function useMessageNotifications(currentConversationId = null) {
//   const queryClient = useQueryClient();
//   const lastCheck = useRef(0);

//   useEffect(() => {
//     const checkMessages = async () => {
//       try {
//         const res = await fetch(`${import.meta.env.VITE_HOME_OO}/messages/unread`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
//           },
//         });

//         if (!res.ok) return;

//         const data = await res.json();

//         if (data?.count > 0) {
//           queryClient.invalidateQueries({ queryKey: ["conversations"] });
//         }
//       } catch (err) {
//         console.log("Notification check failed:", err.message);
//       }
//     };

//     const interval = setInterval(checkMessages, 8000);

//     return () => clearInterval(interval);
//   }, [queryClient]);
// }


// // export function useMessageNotifications(currentConversationId = null) {
//   const queryClient = useQueryClient();
//   const lastCheck = useRef(0);

//   useEffect(() => {
//     const checkMessages = async () => {
//       try {
//         const res = await fetch(`${import.meta.env.VITE_HOME_OO}/api/messages/unread`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
//           },
//         });

//         const data = await res.json();

//         if (data?.count > 0) {
//           toast(`You have ${data.count} new message(s)`);
//           queryClient.invalidateQueries(["conversations"]);
//         }
//       } catch (err) {
//         console.log("Notification check failed", err.message);
//       }
//     };

//     const interval = setInterval(checkMessages, 5000); // poll every 5 seconds

//     return () => clearInterval(interval);
//   }, [currentConversationId, queryClient]);
// // }


// // import { useEffect, useRef } from "react";
// // import { useQueryClient } from "@tanstack/react-query";
// // import { toast } from "sonner";
// // import { useAuth } from "./useAuth";
// // import { MessageNotificationToast } from "@/components/chat/MessageNotificationToast";

// // export function useMessageNotifications(currentConversationId = null) {
// //   const { user } = useAuth();
// //   const queryClient = useQueryClient();

// //   const audioRef = useRef(null);
// //   const lastNotificationRef = useRef(0);
// //   const lastMessageIdRef = useRef(null);

// //   useEffect(() => {
// //     if (!user) return;

// //     // 1. Load notification sound
// //     audioRef.current = new Audio("/sounds/notification.mp3");
// //     audioRef.current.volume = 0.6;

// //     // 2. Start polling for new messages
// //     const interval = setInterval(async () => {
// //       try {
// //         const res = await fetch(
// //           `${import.meta.env.VITE_HOME_OO}/api/v1/messages/latest/${user.id}`,
// //           {
// //             headers: {
// //               Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
// //             },
// //           }
// //         );

// //         if (!res.ok) return;

// //         const data = await res.json();

// //         if (!data?.message) return;

// //         const message = data.message;
// //         const sender = data.sender;
// //         const conversation = data.conversation;

// //         // Ignore old message
// //         if (lastMessageIdRef.current === message.id) return;

// //         // Save message id to prevent duplicate notifications
// //         lastMessageIdRef.current = message.id;

// //         // Ignore self messages
// //         if (message.sender_id === user.id) return;

// //         // Ignore current open conversation
// //         if (message.conversation_id === currentConversationId) return;

// //         // Debounce
// //         const now = Date.now();
// //         if (now - lastNotificationRef.current < 2000) return;
// //         lastNotificationRef.current = now;

// //         // Show Toast
// //         toast.custom((t) => (
// //           <MessageNotificationToast
// //             senderName={sender?.full_name || sender?.email || "Unknown"}
// //             message={message.content}
// //             subject={conversation?.subject || "New Message"}
// //             conversationId={message.conversation_id}
// //             onDismiss={() => toast.dismiss(t)}
// //           />
// //         ));

// //         // Play sound
// //         audioRef.current?.play().catch(() => {});

// //         // Refresh UI
// //         queryClient.invalidateQueries({ queryKey: ["conversations"] });
// //         queryClient.invalidateQueries({ queryKey: ["messages"] });

// //       } catch (err) {
// //         console.error("Polling error:", err);
// //       }
// //     }, 4000); // poll every 4 seconds

// //     return () => clearInterval(interval);
// //   }, [user, currentConversationId, queryClient]);
// // }



// // // import { useEffect, useRef } from "react";
// // // import { useQueryClient } from "@tanstack/react-query";
// // // import { toast } from "sonner";
// // // import Pusher from "pusher-js";
// // // import { useAuth } from "./useAuth";
// // // import { MessageNotificationToast } from "@/components/chat/MessageNotificationToast";
// // // export function useMessageNotifications(currentConversationId = null) {
// // //   const { user } = useAuth();
// // //   const queryClient = useQueryClient();

// // //   const audioRef = useRef(null);
// // //   const lastNotificationRef = useRef(0);

// // //   useEffect(() => {
// // //     if (!user) return;

// // //     // 1. Load Notification Sound
// // //     audioRef.current = new Audio("/sounds/notification.mp3");
// // //     audioRef.current.volume = 0.5;

// // //     // 2. Setup Pusher client
// // //     const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
// // //       cluster: import.meta.env.VITE_PUSHER_CLUSTER,
// // //       authEndpoint: `${import.meta.env.VITE_HOME_OO}/api/pusher/auth`,
// // //       auth: {
// // //         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
// // //       }
// // //     });

// // //     // 3. Subscribe to personal notification channel
// // //     const channel = pusher.subscribe(`private-user-${user.id}`);

// // //     // 4. Handle new message notifications
// // //     channel.bind("new-message", (data) => {
// // //       const { message, sender, conversation } = data;

// // //       // Avoid notifying for own messages
// // //       if (message.sender_id === user.id) return;

// // //       // Avoid notifying if viewing the same conversation
// // //       if (message.conversation_id === currentConversationId) return;

// // //       // Debounce notifications
// // //       const now = Date.now();
// // //       if (now - lastNotificationRef.current < 2000) return;
// // //       lastNotificationRef.current = now;

// // //       // 5. Visual Toast
// // //       toast.custom(
// // //         (t) => (
// // //           <MessageNotificationToast
// // //             senderName={sender?.full_name || sender?.email || "Unknown"}
// // //             message={message.content}
// // //             subject={conversation?.subject || "New Message"}
// // //             conversationId={message.conversation_id}
// // //             onDismiss={() => toast.dismiss(t)}
// // //           />
// // //         ),
// // //         {
// // //           duration: 5000,
// // //           position: "top-right",
// // //         }
// // //       );

// // //       // 6. Play sound
// // //       try {
// // //         audioRef.current?.play().catch(() => {});
// // //       } catch {}

// // //       // 7. Refresh unread counters
// // //       queryClient.invalidateQueries({ queryKey: ["conversations"] });
// // //     });

// // //     return () => {
// // //       channel.unbind_all();
// // //       pusher.unsubscribe(`private-user-${user.id}`);
// // //       pusher.disconnect();
// // //     };
// // //   }, [user, currentConversationId, queryClient]);
// // // }
