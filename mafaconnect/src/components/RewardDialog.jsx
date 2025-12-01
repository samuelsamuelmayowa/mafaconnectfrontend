
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function RewardDialog({ open, onOpenChange, reward }) {
  const isEditMode = !!reward;

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [pointsCost, setPointsCost] = React.useState("");
  const [rewardType, setRewardType] = React.useState("discount");
  const [stockLimit, setStockLimit] = React.useState("");

  const queryClient = useQueryClient();
  const API_URL = import.meta.env.VITE_HOME_OO;
  const token = localStorage.getItem("ACCESS_TOKEN");

  // ================================
  // PREFILL FORM WHEN IN EDIT MODE
  // ================================
  React.useEffect(() => {
    if (reward) {
      setTitle(reward.title);
      setDescription(reward.description || "");
      setPointsCost(reward.points_cost?.toString() || "");
      setRewardType(reward.reward_type);
      setStockLimit(reward.stock_limit?.toString() || "");
    } else {
      // Reset for create mode
      setTitle("");
      setDescription("");
      setPointsCost("");
      setRewardType("discount");
      setStockLimit("");
    }
  }, [reward, open]);

  // ================================
  // CREATE REWARD
  // ================================
  const createReward = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/rewards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          title,
          description,
          points_cost: Number(pointsCost),
          reward_type: rewardType,
          stock_limit: stockLimit ? Number(stockLimit) : null,
          active: true,
        }),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message);
      return result;
    },

    onSuccess: (data) => {
      toast.success(data.message || "Reward created successfully!");
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      onOpenChange(false);
    },

    onError: (err) => {
      if (err.message.includes("exists")) {
        toast.error("A reward with this title already exists!");
      } else {
        toast.error(err.message);
      }
    },
  });

  // ================================
  // UPDATE REWARD
  // ================================
  const updateReward = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_URL}/rewards/${reward.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          title,
          description,
          points_cost: Number(pointsCost),
          reward_type: rewardType,
          stock_limit: stockLimit ? Number(stockLimit) : null,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      return result;
    },

    onSuccess: (data) => {
      toast.success(data.message || "Reward updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      onOpenChange(false);
    },

    onError: (err) => {
      toast.error(err.message || "Failed to update reward");
    },
  });

  // SUBMIT HANDLER
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) return toast.error("Reward title is required");
    if (!pointsCost || Number(pointsCost) < 1)
      return toast.error("Points cost must be at least 1");

    if (isEditMode) {
      updateReward.mutate();
    } else {
      createReward.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Reward" : "Create New Reward"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Reward Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., 10% Discount Voucher"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Points + Type */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Points Cost *</Label>
              <Input
                type="number"
                value={pointsCost}
                min="1"
                onChange={(e) => setPointsCost(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Reward Type *</Label>
              <Select value={rewardType} onValueChange={setRewardType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount">Discount</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="voucher">Voucher</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stock Limit */}
          <div className="space-y-2">
            <Label>Stock Limit (Optional)</Label>
            <Input
              type="number"
              value={stockLimit}
              onChange={(e) => setStockLimit(e.target.value)}
              placeholder="Leave empty for unlimited"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button
              type="submit"
              className="bg-gradient-primary"
              disabled={createReward.isPending || updateReward.isPending}
            >
              {(createReward.isPending || updateReward.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? "Save Changes" : "Create Reward"}
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  );
}

// import React from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/Button";
// import { Input } from "@/components/ui/Input";
// import { Label } from "@/components/ui/Label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Loader2 } from "lucide-react";
// import { toast } from "sonner";
// import { useMutation, useQueryClient } from "@tanstack/react-query";

// export function RewardDialog({ open, onOpenChange }) {
//   const [title, setTitle] = React.useState("");
//   const [description, setDescription] = React.useState("");
//   const [pointsCost, setPointsCost] = React.useState("");
//   const [rewardType, setRewardType] = React.useState("discount");
//   const [stockLimit, setStockLimit] = React.useState("");

//   const queryClient = useQueryClient();
//   const API_URL = import.meta.env.VITE_HOME_OO;
//   const token = localStorage.getItem("ACCESS_TOKEN");

//   // CREATE REWARD
//   const createReward = useMutation({
//     mutationFn: async () => {
//       const res = await fetch(`${API_URL}/rewards`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: token ? `Bearer ${token}` : "",
//         },
//         body: JSON.stringify({
//           title,
//           description,
//           points_cost: Number(pointsCost),
//           reward_type: rewardType,
//           stock_limit: stockLimit ? Number(stockLimit) : null,
//           active: true,
//         }),
//       });

//       const result = await res.json().catch(() => ({}));

//       // ❌ Handle duplicate title / server validation
//       if (!res.ok) {
//         throw new Error(result.message || "Failed to create reward");
//       }

//       return result;
//     },

//     onSuccess: (data) => {
//       toast.success(data?.message || "Reward created successfully!");

//       queryClient.invalidateQueries({ queryKey: ["rewards"] });

//       // Reset form
//       setTitle("");
//       setDescription("");
//       setPointsCost("");
//       setRewardType("discount");
//       setStockLimit("");

//       onOpenChange(false);
//     },

//     onError: (err) => {
//       // Custom error messages from backend
//       if (err.message.includes("exists")) {
//         toast.error("A reward with this title already exists!");
//       } else {
//         toast.error(err.message || "Failed to create reward");
//       }
//     },
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (!title.trim()) return toast.error("Reward title is required");
//     if (!pointsCost || Number(pointsCost) < 1)
//       return toast.error("Points cost must be at least 1");

//     createReward.mutate();
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[500px]">
//         <DialogHeader>
//           <DialogTitle>Create New Reward</DialogTitle>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-4">
          
//           {/* Title */}
//           <div className="space-y-2">
//             <Label htmlFor="title">Reward Title *</Label>
//             <Input
//               id="title"
//               value={title}
//               required
//               onChange={(e) => setTitle(e.target.value)}
//               placeholder="e.g., 10% Discount Voucher"
//             />
//           </div>

//           {/* Description */}
//           <div className="space-y-2">
//             <Label htmlFor="description">Description</Label>
//             <Textarea
//               id="description"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               placeholder="Describe this reward..."
//               rows={3}
//             />
//           </div>

//           {/* Points + Type */}
//           <div className="grid gap-4 md:grid-cols-2">
//             <div className="space-y-2">
//               <Label>Points Cost *</Label>
//               <Input
//                 type="number"
//                 value={pointsCost}
//                 required
//                 min="1"
//                 placeholder="500"
//                 onChange={(e) => setPointsCost(e.target.value)}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label>Reward Type *</Label>
//               <Select value={rewardType} onValueChange={setRewardType}>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="discount">Discount</SelectItem>
//                   <SelectItem value="product">Free Product</SelectItem>
//                   <SelectItem value="voucher">Voucher</SelectItem>
//                   <SelectItem value="service">Free Service</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           {/* Stock Limit */}
//           <div className="space-y-2">
//             <Label>Stock Limit (Optional)</Label>
//             <Input
//               type="number"
//               min="1"
//               value={stockLimit}
//               placeholder="Leave empty for unlimited"
//               onChange={(e) => setStockLimit(e.target.value)}
//             />
//           </div>

//           {/* Buttons */}
//           <div className="flex gap-3 justify-end pt-4">
//             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
//               Cancel
//             </Button>

//             <Button type="submit" disabled={createReward.isPending} className="bg-gradient-primary">
//               {createReward.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               Create Reward
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }




// import React from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/Button";
// import { Input } from "@/components/ui/Input";
// import { Label } from "@/components/ui/Label";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Loader2 } from "lucide-react";
// import { toast } from "sonner";
// import { useMutation, useQueryClient } from "@tanstack/react-query";

// export function RewardDialog({ open, onOpenChange }) {
//   const [title, setTitle] = React.useState("");
//   const [description, setDescription] = React.useState("");
//   const [pointsCost, setPointsCost] = React.useState("");
//   const [rewardType, setRewardType] = React.useState("discount");
//   const [stockLimit, setStockLimit] = React.useState("");

//   const queryClient = useQueryClient();
//   const API_URL = import.meta.env.VITE_HOME_OO;
//   const token = localStorage.getItem("ACCESS_TOKEN");

//   const createReward = useMutation({
//     mutationFn: async () => {
//       const res = await fetch(`${API_URL}/rewards`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: token ? `Bearer ${token}` : "",
//         },
//         body: JSON.stringify({
//           title,
//           description,
//           points_cost: Number(pointsCost),
//           reward_type: rewardType,
//           stock_limit: stockLimit ? Number(stockLimit) : null,
//           active: true,
//         }),
//       });

//       if (!res.ok) {
//         const err = await res.json().catch(() => ({}));
//         throw new Error(err.message || "Failed to create reward");
//       }

//       return res.json();
//     },

//     onSuccess: () => {
//       toast.success("Reward created successfully!");
//       queryClient.invalidateQueries({ queryKey: ["rewards"] });

//       // Reset form
//       setTitle("");
//       setDescription("");
//       setPointsCost("");
//       setRewardType("discount");
//       setStockLimit("");

//       onOpenChange(false);
//     },

//     onError: (err) => {
//       toast.error(err.message || "Failed to create reward");
//     },
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (!title.trim()) return toast.error("Reward title is required");
//     if (!pointsCost || Number(pointsCost) < 1)
//       return toast.error("Points cost must be at least 1");

//     createReward.mutate();
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[500px]">
//         <DialogHeader>
//           <DialogTitle>Create New Reward</DialogTitle>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Title */}
//           <div className="space-y-2">
//             <Label htmlFor="title">Reward Title *</Label>
//             <Input
//               id="title"
//               value={title}
//               required
//               onChange={(e) => setTitle(e.target.value)}
//               placeholder="e.g., 10% Discount Voucher"
//             />
//           </div>

//           {/* Description */}
//           <div className="space-y-2">
//             <Label htmlFor="description">Description</Label>
//             <Textarea
//               id="description"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               placeholder="Describe this reward..."
//               rows={3}
//             />
//           </div>

//           {/* Points + Type */}
//           <div className="grid gap-4 md:grid-cols-2">
//             <div className="space-y-2">
//               <Label>Points Cost *</Label>
//               <Input
//                 type="number"
//                 value={pointsCost}
//                 required
//                 min="1"
//                 placeholder="500"
//                 onChange={(e) => setPointsCost(e.target.value)}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label>Reward Type *</Label>
//               <Select value={rewardType} onValueChange={setRewardType}>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="discount">Discount</SelectItem>
//                   <SelectItem value="product">Free Product</SelectItem>
//                   <SelectItem value="voucher">Voucher</SelectItem>
//                   <SelectItem value="service">Free Service</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           {/* Stock Limit */}
//           <div className="space-y-2">
//             <Label>Stock Limit (Optional)</Label>
//             <Input
//               type="number"
//               min="1"
//               value={stockLimit}
//               placeholder="Leave empty for unlimited"
//               onChange={(e) => setStockLimit(e.target.value)}
//             />
//           </div>

//           {/* Buttons */}
//           <div className="flex gap-3 justify-end pt-4">
//             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
//               Cancel
//             </Button>

//             <Button type="submit" disabled={createReward.isPending} className="bg-gradient-primary">
//               {createReward.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               Create Reward
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

// // import React from "react";
// // import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// // import { Button } from "@/components/ui/Button";
// // import { Input } from "@/components/ui/Input";
// // import { Label } from "@/components/ui/Label";
// // import { Textarea } from "@/components/ui/textarea";
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// // import { Loader2 } from "lucide-react";
// // import { toast } from "sonner";
// // import { useMutation, useQueryClient } from "@tanstack/react-query";

// // export function RewardDialog({ open, onOpenChange }) {
// //   const [title, setTitle] = React.useState("");
// //   const [description, setDescription] = React.useState("");
// //   const [pointsCost, setPointsCost] = React.useState("");
// //   const [rewardType, setRewardType] = React.useState("discount");
// //   const [stockLimit, setStockLimit] = React.useState("");

// //   const queryClient = useQueryClient();
// // const API_URL = import.meta.env.VITE_HOME_OO
// //   // 🟢 Create Reward (REST API)
// //    const token = localStorage.getItem("ACCESS_TOKEN");
// //   const createReward = useMutation({
// //     mutationFn: async () => {
// //       const res = await fetch("/api/rewards", {
// //         method: "POST",
// //         credentials: "include",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           title,
// //           description,
// //           points_cost: parseInt(pointsCost),
// //           reward_type: rewardType,
// //           stock_limit: stockLimit ? parseInt(stockLimit) : null,
// //           active: true,
// //         }),
// //       });

// //       if (!res.ok) {
// //         const err = await res.json().catch(() => ({}));
// //         throw new Error(err.message || "Failed to create reward");
// //       }
// //     },
// //     onSuccess: () => {
// //       toast.success("Reward created successfully!");
// //       queryClient.invalidateQueries({ queryKey: ["rewards"] });

// //       // Reset form
// //       setTitle("");
// //       setDescription("");
// //       setPointsCost("");
// //       setRewardType("discount");
// //       setStockLimit("");

// //       onOpenChange(false);
// //     },
// //     onError: (err) => {
// //       toast.error(err.message || "Failed to create reward");
// //     },
// //   });

// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     createReward.mutate();
// //   };

// //   return (
// //     <Dialog open={open} onOpenChange={onOpenChange}>
// //       <DialogContent className="sm:max-w-[500px]">
// //         <DialogHeader>
// //           <DialogTitle>Create New Reward</DialogTitle>
// //         </DialogHeader>

// //         <form onSubmit={handleSubmit} className="space-y-4">
// //           {/* Title */}
// //           <div className="space-y-2">
// //             <Label htmlFor="title">Reward Title *</Label>
// //             <Input
// //               id="title"
// //               value={title}
// //               required
// //               onChange={(e) => setTitle(e.target.value)}
// //               placeholder="e.g., 10% Discount Voucher"
// //             />
// //           </div>

// //           {/* Description */}
// //           <div className="space-y-2">
// //             <Label htmlFor="description">Description</Label>
// //             <Textarea
// //               id="description"
// //               value={description}
// //               onChange={(e) => setDescription(e.target.value)}
// //               placeholder="Describe this reward..."
// //               rows={3}
// //             />
// //           </div>

// //           {/* Points + Type */}
// //           <div className="grid gap-4 md:grid-cols-2">
// //             <div className="space-y-2">
// //               <Label>Points Cost *</Label>
// //               <Input
// //                 type="number"
// //                 value={pointsCost}
// //                 required
// //                 min="1"
// //                 placeholder="500"
// //                 onChange={(e) => setPointsCost(e.target.value)}
// //               />
// //             </div>

// //             <div className="space-y-2">
// //               <Label>Reward Type *</Label>
// //               <Select value={rewardType} onValueChange={setRewardType}>
// //                 <SelectTrigger>
// //                   <SelectValue />
// //                 </SelectTrigger>
// //                 <SelectContent>
// //                   <SelectItem value="discount">Discount</SelectItem>
// //                   <SelectItem value="product">Free Product</SelectItem>
// //                   <SelectItem value="voucher">Voucher</SelectItem>
// //                   <SelectItem value="service">Free Service</SelectItem>
// //                 </SelectContent>
// //               </Select>
// //             </div>
// //           </div>

// //           {/* Stock Limit */}
// //           <div className="space-y-2">
// //             <Label>Stock Limit (Optional)</Label>
// //             <Input
// //               type="number"
// //               min="1"
// //               value={stockLimit}
// //               placeholder="Leave empty for unlimited"
// //               onChange={(e) => setStockLimit(e.target.value)}
// //             />
// //           </div>

// //           {/* Buttons */}
// //           <div className="flex gap-3 justify-end pt-4">
// //             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
// //               Cancel
// //             </Button>

// //             <Button type="submit" disabled={createReward.isPending} className="bg-gradient-primary">
// //               {createReward.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
// //               Create Reward
// //             </Button>
// //           </div>
// //         </form>
// //       </DialogContent>
// //     </Dialog>
// //   );
// // }
