import React, { useState, useMemo } from "react";
import { Plus, Search, Filter, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/Badge";
import { useTransactions } from "@/hooks/useTransactions";
import { TransactionDialog } from "@/components/TransactionDialog";
import { TransactionDetailsDialog } from "@/components/TransactionDetailsDialog";
import {
  STATUS_CONFIG,
  formatCurrency,
  isOverdue,
} from "@/lib/transactionUtils";
import { format } from "date-fns";

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const { user, isStaff, loading: authLoading } = useAuth();
  const { transactions, isLoading } = useTransactions();

  // Fallback to empty array to avoid crashes
  const txList = Array.isArray(transactions) ? transactions : [];

  // 🔹 Filtering
  const filteredTransactions = useMemo(() => {
    return txList.filter((t) => {
      const matchesSearch =
        t.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.customers?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(t.id)?.includes(searchQuery);

      const rawStatus = t.order_status?.toLowerCase();
      const matchesStatus =
        statusFilter === "all" || rawStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [txList, searchQuery, statusFilter]);

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsDialog(true);
  };

  // 🔹 Access control
  if (!authLoading && (!user || !isStaff)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="text-2xl font-semibold">Access Denied</h2>
          <p className="text-muted-foreground max-w-md">
            You do not have permission to view transactions. Staff access is
            required.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            View confirmed, paid, and completed orders
          </p>
        </div>
        {isStaff && (
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by order #, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                if (key === "__fallback") return null;
                return (
                  <SelectItem key={key} value={key}>
                    {cfg.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-8">Loading transactions...</div>
      ) : filteredTransactions.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No transactions found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => {
            return (
             <Card
  key={transaction.id}
  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
  onClick={() => handleViewDetails(transaction)}
>
  <div className="space-y-2">
    
    {/* Header Line */}
    <h3 className="text-xl font-semibold">
      Transaction #{transaction.order_number || transaction.id}
    </h3>

    {/* Payment Method & Status */}
    <div className="flex items-center gap-3 flex-wrap">
      <Badge variant="secondary" className="capitalize">
        {transaction.payment_method || "Cash Sale"}
      </Badge>
      <Badge className="capitalize">
        {transaction.order_status || "Completed"}
      </Badge>
    </div>

    {/* Customer + Location + Date */}
    <div className="text-sm text-muted-foreground space-y-1">
      {transaction.customer && (
        <p>Customer: {transaction.customer.name}</p>
      )}
      {transaction.location && (
        <p>Location: {transaction.location.name}</p>
      )}
      <p>
        Date: {format(new Date(transaction.createdAt), "MMM dd, yyyy")}
      </p>
    </div>

    {/* Amount + Item Count */}
    <div className="flex justify-between items-center pt-3 border-t">
      <div className="text-xl font-bold">
        {formatCurrency(transaction.total_amount)}
      </div>
      <div className="text-sm text-muted-foreground">
        {transaction.items?.length || 0} items
      </div>
    </div>

  </div>
</Card>

            );
          })}
        </div>
      )}

      {/*      
      {showDialog && (
        <TransactionDialog open={showDialog} onOpenChange={setShowDialog} />
      )}

      {showDetailsDialog && selectedTransaction && (
        <TransactionDetailsDialog
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          transaction={selectedTransaction}
        />
      )} */}
      {/* Create Transaction Dialog */}
      <TransactionDialog open={showDialog} onOpenChange={setShowDialog} />

      {/* View Transaction Details */}
      <TransactionDetailsDialog
        open={showDetailsDialog}
        onOpenChange={(isOpen) => {
          setShowDetailsDialog(isOpen);
          if (!isOpen) setSelectedTransaction(null); // reset when closed
        }}
        transaction={selectedTransaction}
      />
    </div>
  );
}

// import React, { useState, useMemo } from "react";
// import { Plus, Search, Filter, ShieldAlert } from "lucide-react";
// import { useAuth } from "@/hooks/useAuth";
// import { Button } from "@/components/ui/Button";
// import { Input } from "@/components/ui/Input";
// import { Card } from "@/components/ui/Card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Badge } from "@/components/ui/Badge";
// import { useTransactions } from "@/hooks/useTransactions";
// import { TransactionDialog } from "@/components/TransactionDialog";
// import { TransactionDetailsDialog } from "@/components/TransactionDetailsDialog";
// import {
//   STATUS_CONFIG,
//   formatCurrency,
// } from "@/lib/transactionUtils";
// import { format } from "date-fns";

// export default function Transactions() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [showDialog, setShowDialog] = useState(false);
//   const [selectedTransaction, setSelectedTransaction] = useState(null);
//   const [showDetailsDialog, setShowDetailsDialog] = useState(false);

//   const { user, isStaff, loading: authLoading } = useAuth();
//   const { transactions, isLoading } = useTransactions();

//   // ---------------------------------
//   // FILTER FIXED
//   // ---------------------------------
//   const filteredTransactions = useMemo(() => {
//     if (!transactions) return [];

//     return transactions.filter((t) => {
//       const searchText = searchQuery.toLowerCase();

//       const matchesSearch =
//         t.order_number?.toLowerCase().includes(searchText) ||
//         t.customers?.name?.toLowerCase().includes(searchText) ||
//         t.id.toString().includes(searchText);

//       const matchesStatus =
//         statusFilter === "all" || t.order_status === statusFilter;

//       return matchesSearch && matchesStatus;
//     });
//   }, [transactions, searchQuery, statusFilter]);

//   const handleViewDetails = (transaction) => {
//     setSelectedTransaction(transaction);
//     setShowDetailsDialog(true);
//   };

//   // ---------------------------------
//   // ACCESS CONTROL
//   // ---------------------------------
//   if (!authLoading && (!user || !isStaff)) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center space-y-4">
//           <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground" />
//           <h2 className="text-2xl font-semibold">Access Denied</h2>
//           <p className="text-muted-foreground max-w-md">
//             You do not have permission to view transactions. Staff access is
//             required.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // ---------------------------------
//   // UI
//   // ---------------------------------
//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold">Transactions</h1>
//           <p className="text-muted-foreground">
//             Completed / Confirmed / Paid Orders
//           </p>
//         </div>
//         {isStaff && (
//           <Button onClick={() => setShowDialog(true)}>
//             <Plus className="mr-2 h-4 w-4" />
//             New Transaction
//           </Button>
//         )}
//       </div>

//       {/* Filters */}
//       <Card className="p-4">
//         <div className="flex gap-4 flex-wrap">
//           <div className="flex-1 min-w-[200px] relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
//             <Input
//               placeholder="Search by order #, customer, or ID..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10"
//             />
//           </div>

//           <Select value={statusFilter} onValueChange={setStatusFilter}>
//             <SelectTrigger className="w-[180px]">
//               <SelectValue placeholder="Status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Status</SelectItem>
//               <SelectItem value="confirmed">Confirmed</SelectItem>
//               <SelectItem value="paid">Paid</SelectItem>
//               <SelectItem value="completed">Completed</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </Card>

//       {/* Transactions List */}
//       {isLoading ? (
//         <div className="text-center py-8">Loading transactions...</div>
//       ) : filteredTransactions.length === 0 ? (
//         <Card className="p-8 text-center">
//           <p className="text-muted-foreground">No transactions found</p>
//         </Card>
//       ) : (
//         <div className="space-y-4">
//           {filteredTransactions.map((transaction) => {
//             // const statusCfg =
//               // STATUS_CONFIG[transaction.order_status] || STATUS_CONFIG.default;
//               const rawStatus = transaction.order_status?.toLowerCase();
// const statusCfg = STATUS_CONFIG[rawStatus] ?? STATUS_CONFIG.__fallback;

//             return (
//               <Card
//                 key={transaction.id}
//                 className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
//                 onClick={() => handleViewDetails(transaction)}
//               >
//                 <div className="flex justify-between items-start">
//                   <div className="space-y-2 flex-1">
//                     <div className="flex items-center gap-3 flex-wrap">
//                       <h3 className="font-semibold text-lg">
//                         {transaction.order_number ||
//                           `Order #${transaction.id}`}
//                       </h3>

//                       <Badge variant={statusCfg.variant}>
//                         {statusCfg.label}
//                       </Badge>
//                     </div>

//                     <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
//                       {transaction.customers && (
//                         <span>Customer: {transaction.customers.name}</span>
//                       )}
//                       {transaction.locations && (
//                         <span>Location: {transaction.locations.name}</span>
//                       )}
//                       <span>
//                         Date:{" "}
//                         {format(
//                           new Date(transaction.createdAt),
//                           "MMM dd, yyyy"
//                         )}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="text-right">
//                     <div className="text-2xl font-bold">
//                       {formatCurrency(transaction.total_amount)}
//                     </div>
//                     <div className="text-sm text-muted-foreground">
//                       {transaction.order_items?.length || 0} items
//                     </div>
//                   </div>
//                 </div>
//               </Card>
//             );
//           })}
//         </div>
//       )}

//       {/* Dialogs */}
//       {showDialog && (
//         <TransactionDialog open={showDialog} onOpenChange={setShowDialog} />
//       )}

//       {showDetailsDialog && selectedTransaction && (
//         <TransactionDetailsDialog
//           open={showDetailsDialog}
//           onOpenChange={setShowDetailsDialog}
//           transaction={selectedTransaction}
//         />
//       )}
//     </div>
//   );
// }

// // import React, { useState, useMemo } from "react";
// // import { Plus, Search, Filter, ShieldAlert } from "lucide-react";
// // import { useAuth } from "@/hooks/useAuth";
// // import { Button } from "@/components/ui/Button";
// // import { Input } from "@/components/ui/Input";
// // import { Card } from "@/components/ui/Card";
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select";
// // import { Badge } from "@/components/ui/Badge";
// // import { useTransactions } from "@/hooks/useTransactions";
// // import { TransactionDialog } from "@/components/TransactionDialog";
// // import { TransactionDetailsDialog } from "@/components/TransactionDetailsDialog";
// // import {
// //   TRANSACTION_TYPES,
// //   STATUS_CONFIG,
// //   formatCurrency,
// //   isOverdue,
// // } from "@/lib/transactionUtils";
// // import { format } from "date-fns";

// // export default function Transactions() {
// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [typeFilter, setTypeFilter] = useState("all");
// //   const [statusFilter, setStatusFilter] = useState("all");
// //   const [showDialog, setShowDialog] = useState(false);
// //   const [selectedTransaction, setSelectedTransaction] = useState(null);
// //   const [showDetailsDialog, setShowDetailsDialog] = useState(false);

// //   const { user, isStaff, loading: authLoading } = useAuth();
// //   const { transactions, isLoading } = useTransactions();

// //   // 🔹 Filter logic
// // //   const filteredTransactions = useMemo(() => {
// // //     if (!transactions) return [];

// // //     return transactions.filter((t) => {
// // //       const matchesSearch =
// // //         // t.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
// // //         t.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
// // //         t.customers?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
// // //         t.id.toLowerCase().includes(searchQuery.toLowerCase());

// // //       // const matchesType = typeFilter === "all" || t.transaction_type === typeFilter;
// // //       // const matchesStatus = statusFilter === "all" || t.status === statusFilter;
// // // const matchesType = true; // You don't have transaction types yet

// // // // Use order_status instead of status
// // // const matchesStatus =
// // //   statusFilter === "all" || t.order_status === statusFilter;
// // //       return matchesSearch && matchesType && matchesStatus;
// // //     });
// // //   }, [transactions, searchQuery, typeFilter, statusFilter]);
// // const filteredTransactions = transactions || [];

// // const statusConfig = STATUS_CONFIG[transactions.order_status];

// // const badgeVariant = overdue
// //   ? "destructive"
// //   : statusConfig?.variant || "secondary";

// // const badgeLabel = overdue
// //   ? "Overdue"
// //   : statusConfig?.label || transactions.order_status;

// //   const handleViewDetails = (transaction) => {
// //     setSelectedTransaction(transaction);
// //     setShowDetailsDialog(true);
// //   };

// //   // 🔹 Access control for non-staff
// //   if (!authLoading && (!user || !isStaff)) {
// //     return (
// //       <div className="flex items-center justify-center min-h-[400px]">
// //         <div className="text-center space-y-4">
// //           <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground" />
// //           <h2 className="text-2xl font-semibold">Access Denied</h2>
// //           <p className="text-muted-foreground max-w-md">
// //             You do not have permission to view transactions. Staff access is required.
// //           </p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="space-y-6">
// //       {/* Header */}
// //       <div className="flex justify-between items-center">
// //         <div>
// //           <h1 className="text-3xl font-bold">Transactions</h1>
// //           <p className="text-muted-foreground">
// //             Manage all sales, invoices, and quotes in one place
// //           </p>
// //         </div>
// //         {isStaff && (
// //           <Button onClick={() => setShowDialog(true)}>
// //             <Plus className="mr-2 h-4 w-4" />
// //             New Transaction
// //           </Button>
// //         )}
// //       </div>

// //       {/* Filters */}
// //       <Card className="p-4">
// //         <div className="flex gap-4 flex-wrap">
// //           <div className="flex-1 min-w-[200px] relative">
// //             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
// //             <Input
// //               placeholder="Search by invoice #, customer, or ID..."
// //               value={searchQuery}
// //               onChange={(e) => setSearchQuery(e.target.value)}
// //               className="pl-10"
// //             />
// //           </div>

// //           <Select value={typeFilter} onValueChange={setTypeFilter}>
// //             <SelectTrigger className="w-[180px]">
// //               <Filter className="mr-2 h-4 w-4" />
// //               <SelectValue placeholder="Type" />
// //             </SelectTrigger>
// //             <SelectContent>
// //               <SelectItem value="all">All Types</SelectItem>
// //               {Object.entries(TRANSACTION_TYPES).map(([key, cfg]) => (
// //                 <SelectItem key={key} value={key}>
// //                   {cfg.label}
// //                 </SelectItem>
// //               ))}
// //             </SelectContent>
// //           </Select>

// //           <Select value={statusFilter} onValueChange={setStatusFilter}>
// //             <SelectTrigger className="w-[180px]">
// //               <SelectValue placeholder="Status" />
// //             </SelectTrigger>
// //             <SelectContent>
// //               <SelectItem value="all">All Status</SelectItem>
// //               {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
// //                 <SelectItem key={key} value={key}>
// //                   {cfg.label}
// //                 </SelectItem>
// //               ))}
// //             </SelectContent>
// //           </Select>
// //         </div>
// //       </Card>

// //       {/* Transaction List */}
// //       {isLoading ? (
// //         <div className="text-center py-8">Loading transactions...</div>
// //       ) : filteredTransactions.length === 0 ? (
// //         <Card className="p-8 text-center">
// //           <p className="text-muted-foreground">No transactions found</p>
// //         </Card>
// //       ) : (
// //         <div className="space-y-4">
// //           {filteredTransactions.map((transaction) => {
// //             // const typeConfig = TRANSACTION_TYPES[transaction.transaction_type];
// //             const statusConfig = STATUS_CONFIG[transaction.status];
// //             const overdue = isOverdue(transaction.due_date, transaction.status);

// //             return (
// //               <Card
// //                 key={transaction.id}
// //                 className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
// //                 onClick={() => handleViewDetails(transaction)}
// //               >
// //                 <div className="flex justify-between items-start">
// //                   <div className="space-y-2 flex-1">
// //                     <div className="flex items-center gap-3 flex-wrap">
// //                       <h3 className="font-semibold text-lg">
// //                         {/* {transaction.invoice_number || */}
// //                           {/* // `Transaction #${transaction.id.slice(0, 8)}`} */}
// //                           {transaction.order_number || `Transaction #${transaction.id}`}

// //                       </h3>
// //                       {/* <Badge variant="outline">{typeConfig?.label}</Badge> */}
// //                       {/* <Badge
// //                         variant={overdue ? "destructive" : statusConfig?.variant || "secondary"}
// //                       >
// //                         {overdue ? "Overdue" : statusConfig?.label}
// //                       </Badge> */}
// //                       {
// //                         <Badge variant={badgeVariant}>
// //   {badgeLabel}
// // </Badge>
// //                       }
// //                     </div>

// //                     <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
// //                       {transaction.customers && (
// //                         <span>Customer: {transaction.customers.name}</span>
// //                       )}
// //                       {transaction.locations && (
// //                         <span>Location: {transaction.locations.name}</span>
// //                       )}
// //                       <span>
// //                         Date: {format(new Date(transaction.createdAt), "MMM dd, yyyy")}
// //                       </span>
// //                       {transaction.due_date && (
// //                         <span>
// //                           Due: {format(new Date(transaction.due_date), "MMM dd, yyyy")}
// //                         </span>
// //                       )}
// //                     </div>
// //                   </div>

// //                   <div className="text-right">
// //                     <div className="text-2xl font-bold">
// //                       {formatCurrency(transaction.total_amount)}
// //                     </div>
// //                     <div className="text-sm text-muted-foreground">
// //                       {/* {transaction.sale_items?.length || 0} items */}
// //                      { transaction.order_items?.length || 0} items

// //                     </div>
// //                   </div>
// //                 </div>
// //               </Card>
// //             );
// //           })}
// //         </div>
// //       )}

// //       {/* Dialogs */}
// //       {showDialog && (
// //         <TransactionDialog open={showDialog} onOpenChange={setShowDialog} />
// //       )}

// //       {showDetailsDialog && selectedTransaction && (
// //         <TransactionDetailsDialog
// //           open={showDetailsDialog}
// //           onOpenChange={setShowDetailsDialog}
// //           transaction={selectedTransaction}
// //         />
// //       )}
// //     </div>
// //   );
// // }
