import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { useCart } from "@/hooks/useCart";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useAuth } from "@/hooks/useAuth";
import { useLocations } from "@/hooks/useLocations";
import { useKYCStatus } from "@/hooks/useKYC";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/transactionUtils";
import { apiPost } from "@/lib/api";

import { Loader2, ArrowLeft, Package, Truck, AlertCircle } from "lucide-react";
import { BankDetailsCard } from "@/components/BankDetailsCard";

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
  "Yobe","Zamfara"
];

const checkoutSchema = z.object({
  delivery_type: z.enum(["delivery", "pickup"]),
  pickup_location_id: z.string().optional(),
  shipping_address: z.string().optional(),
  shipping_city: z.string().optional(),
  shipping_state: z.string().optional(),
  shipping_postal_code: z.string().optional(),
  contact_phone: z.string().min(10),
  contact_email: z.string().email().optional().or(z.literal("")),
  delivery_notes: z.string().optional(),
  payment_method: z.enum(["cash_on_delivery", "bank_transfer", "pay_on_pickup", "stripe"]),
}).refine(data => {
  if (data.delivery_type === "delivery") {
    return data.shipping_address && data.shipping_city && data.shipping_state;
  }
  if (data.delivery_type === "pickup") {
    return data.pickup_location_id;
  }
  return true;
});

export default function Checkout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { getSetting } = useStoreSettings();
  const { locations } = useLocations();
  const { data: kycStatus } = useKYCStatus();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const isKYCApproved = kycStatus?.kyc_status === "approved";

  const taxRate = getSetting("tax_rate")?.value || 0;
  const shippingFee = getSetting("shipping_fee")?.value || 0;
  const freeShippingThreshold = getSetting("shipping_fee")?.free_threshold || 50000;

  const taxAmount = (cartTotal * taxRate) / 100;

  const form = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      delivery_type: "delivery",
      payment_method: "cash_on_delivery",
    },
  });

  const deliveryType = form.watch("delivery_type");
  const paymentMethod = form.watch("payment_method");
  const pickupLocationId = form.watch("pickup_location_id");

  const shippingCost =
    deliveryType === "pickup"
      ? 0
      : cartTotal >= freeShippingThreshold
      ? 0
      : shippingFee;

  const total = cartTotal + taxAmount + shippingCost;

  useEffect(() => {
    if (pickupLocationId) {
      const location = locations?.find(l => l.id === pickupLocationId);
      setSelectedLocation(location);
    }
  }, [pickupLocationId, locations]);

  // ✅ React Query ORDER API
  const createOrder = useMutation({
    mutationFn: async (orderPayload) => {
      const res = await apiPost("/api/orders/create", orderPayload);
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["cart"]);
      clearCart();

      toast({
        title: "Order placed successfully!",
        description: `Order ${data.order_number} has been created`,
      });

      navigate(`/order-confirmation/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Order failed",
        description: error.message || "Could not place order",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (formData) => {
    if (!cart?.items?.length) {
      toast({ title: "Cart is empty", variant: "destructive" });
      return;
    }

    if (!isKYCApproved) {
      toast({
        title: "KYC required",
        description: "Please complete your KYC before placing orders",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      user_id: user?.id,
      items: cart.items,
      cart_total: cartTotal,
      tax: taxAmount,
      shipping_fee: shippingCost,
      total_amount: total,
      ...formData,
    };

    await createOrder.mutate(payload);
    setIsSubmitting(false);
  };

  if (!cart?.items?.length) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Button asChild><Link to="/shop">Browse Products</Link></Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-6">
        <Button asChild variant="ghost">
          <Link to="/cart"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Link>
        </Button>

        {!isKYCApproved && (
          <Alert variant="destructive">
            <AlertTitle>KYC Required</AlertTitle>
            <AlertDescription>
              You must complete KYC before placing orders.
              <Link to="/kyc-onboarding"><Button className="mt-2">Go to KYC</Button></Link>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>Items: {cart.items.length}</div>
            <div>Subtotal: {formatCurrency(cartTotal)}</div>
            <div>Tax: {formatCurrency(taxAmount)}</div>
            <div>Shipping: {shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}</div>
            <div className="text-lg font-bold">Total: {formatCurrency(total)}</div>

            <Button
              type="submit"
              disabled={isSubmitting || !isKYCApproved}
              className="w-full"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Placing Order...</>
              ) : "Place Order"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
