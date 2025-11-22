import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

import {
  Loader2,
  ArrowLeft,
  Package,
  Truck,
  AlertCircle,
} from "lucide-react";
import { BankDetailsCard } from "@/components/BankDetailsCard";

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const checkoutSchema = z
  .object({
    delivery_type: z.enum(["delivery", "pickup"]),
    pickup_location_id: z.string().optional(),
    shipping_address: z.string().optional(),
    shipping_city: z.string().optional(),
    shipping_state: z.string().optional(),
    shipping_postal_code: z.string().optional(),
    contact_phone: z
      .string()
      .min(10, "Valid phone number is required"),
    contact_email: z.string().email().optional().or(z.literal("")),
    delivery_notes: z.string().optional(),
    payment_method: z.enum([
      "cash_on_delivery",
      "bank_transfer",
      "pay_on_pickup",
      "stripe",
    ]),
  })
  .refine((data) => {
    if (data.delivery_type === "delivery") {
      return (
        data.shipping_address &&
        data.shipping_city &&
        data.shipping_state
      );
    }
    if (data.delivery_type === "pickup") {
      return data.pickup_location_id;
    }
    return true;
  }, { message: "Required fields missing for selected delivery type" });

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

  // 🧮 Store settings (shipping only, like your TS version)
  const shippingFeeSetting = getSetting("shipping_fee");
  const shippingFeeValue = shippingFeeSetting?.value || 0;
  const freeShippingThreshold =
    shippingFeeSetting?.free_threshold || 50000;

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
      : shippingFeeValue;

  const total = cartTotal + shippingCost;

  useEffect(() => {
    if (pickupLocationId && locations) {
      const location = locations.find(
        (l) => String(l.id) === String(pickupLocationId)
      );
      setSelectedLocation(location || null);
    }
  }, [pickupLocationId, locations]);

  // ✅ React Query mutation for creating order
  const createOrder = useMutation({
    mutationFn: async (payload) => {
      // You can adjust this URL to match your Node backend
      const res = await apiPost("/api/orders/create", payload);
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      clearCart();

      toast({
        title: "Order placed successfully!",
        description: `Order ${data.order_number} has been created`,
      });

      // If your backend returns order id differently, adjust here
      navigate(`/order-confirmation/${data.id}`);
    },
    onError: (error) => {
      let errorTitle = "Order failed";
      let errorDescription =
        error?.message || "Could not place order";

      const msg = error?.message || "";

      if (msg.includes("stock")) {
        errorTitle = "Stock Issue";
        errorDescription = msg;
      } else if (msg.includes("Cart is empty")) {
        errorTitle = "Cart Empty";
        errorDescription =
          "Your cart is empty. Please add items before checkout.";
      } else if (msg.includes("Product not found")) {
        errorTitle = "Product Unavailable";
        errorDescription =
          "Some products in your cart are no longer available.";
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data) => {
    if (!cart || !cart.items || cart.items.length === 0) {
      toast({
        title: "Cart is empty",
        variant: "destructive",
      });
      return;
    }

    if (!isKYCApproved) {
      toast({
        title: "KYC verification required",
        description:
          "Please complete your KYC verification before placing orders",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      user_id: user?.id,
      items: cart.items,
      cart_total: cartTotal,
      shipping_fee: shippingCost,
      total_amount: total,
      ...data,
    };

    try {
      // use mutateAsync so we can await it properly
      await createOrder.mutateAsync(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">
          Your cart is empty
        </h2>
        <Button asChild>
          <Link to="/shop">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 pb-[220px] lg:pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Button
          variant="ghost"
          asChild
          size="sm"
          className="h-9"
        >
          <Link to="/cart">
            <ArrowLeft className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Back to Cart</span>
          </Link>
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">
          Checkout
        </h1>
      </div>

      {/* KYC Alert */}
      {!isKYCApproved && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>KYC Verification Required</AlertTitle>
          <AlertDescription className="mt-2">
            You must complete and get your KYC documents approved
            before placing orders.
            <Link
              to="/kyc-onboarding"
              className="block mt-2"
            >
              <Button variant="outline" size="sm">
                Complete KYC Verification
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {/* LEFT SIDE: Main form */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Delivery Type */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Type</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="delivery_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
                        >
                          {/* Delivery */}
                          <div
                            className="flex items-center space-x-3 border rounded-lg p-3 sm:p-4 cursor-pointer hover:bg-accent"
                            onClick={() => field.onChange("delivery")}
                          >
                            <RadioGroupItem
                              value="delivery"
                              id="delivery"
                            />
                            <label
                              htmlFor="delivery"
                              className="flex-1 cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                <span className="font-semibold text-sm sm:text-base">
                                  Delivery
                                </span>
                              </div>
                              <div className="text-xs sm:text-sm text-muted-foreground">
                                Get it delivered to your address
                              </div>
                            </label>
                          </div>

                          {/* Pickup */}
                          <div
                            className="flex items-center space-x-3 border rounded-lg p-3 sm:p-4 cursor-pointer hover:bg-accent"
                            onClick={() => field.onChange("pickup")}
                          >
                            <RadioGroupItem
                              value="pickup"
                              id="pickup"
                            />
                            <label
                              htmlFor="pickup"
                              className="flex-1 cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                <span className="font-semibold text-sm sm:text-base">
                                  Pickup from Depot
                                </span>
                              </div>
                              <div className="text-xs sm:text-sm text-muted-foreground">
                                Collect from our location
                              </div>
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Pickup Location */}
            {deliveryType === "pickup" && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Pickup Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="pickup_location_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Depot Location</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a depot" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {locations
                              ?.filter((l) => l.active)
                              .map((location) => (
                                <SelectItem
                                  key={location.id}
                                  value={String(location.id)}
                                >
                                  {location.name} - {location.zone},{" "}
                                  {location.state}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedLocation && (
                    <div className="p-3 bg-accent rounded-lg text-sm space-y-1">
                      <p>
                        <strong>{selectedLocation.name}</strong>
                      </p>
                      <p>{selectedLocation.address}</p>
                      <p>{selectedLocation.phone}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Shipping Info */}
            {deliveryType === "delivery" && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="shipping_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter your full delivery address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="shipping_city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="City"
                              className="h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="shipping_state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {NIGERIAN_STATES.map((state) => (
                                <SelectItem
                                  key={state}
                                  value={state}
                                >
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+234..."
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@example.com"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="delivery_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any special instructions"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="payment_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="space-y-3"
                        >
                          {deliveryType === "delivery" && (
                            <div className="flex items-center space-x-3 border rounded-lg p-4">
                              <RadioGroupItem
                                value="cash_on_delivery"
                                id="cod"
                              />
                              <label
                                htmlFor="cod"
                                className="flex-1 cursor-pointer"
                              >
                                <div className="font-semibold">
                                  Cash on Delivery
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Pay when you receive your order (48hr
                                  reservation)
                                </div>
                              </label>
                            </div>
                          )}

                          <div className="flex items-center space-x-3 border rounded-lg p-4">
                            <RadioGroupItem
                              value="bank_transfer"
                              id="transfer"
                            />
                            <label
                              htmlFor="transfer"
                              className="flex-1 cursor-pointer"
                            >
                              <div className="font-semibold">
                                Bank Transfer
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Bank details shown after order (72hr
                                reservation)
                              </div>
                            </label>
                          </div>

                          {deliveryType === "pickup" && (
                            <div className="flex items-center space-x-3 border rounded-lg p-4">
                              <RadioGroupItem
                                value="pay_on_pickup"
                                id="pickup_pay"
                              />
                              <label
                                htmlFor="pickup_pay"
                                className="flex-1 cursor-pointer"
                              >
                                <div className="font-semibold">
                                  Pay on Pickup
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Pay when collecting (24hr reservation)
                                </div>
                              </label>
                            </div>
                          )}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {paymentMethod !== "stripe" && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your order will be reserved. Please complete
                      payment within the timeframe to avoid
                      auto-cancellation.
                    </AlertDescription>
                  </Alert>
                )}

                {paymentMethod === "bank_transfer" &&
                  selectedLocation?.bank_details && (
                    <BankDetailsCard
                      bankDetails={selectedLocation.bank_details}
                      orderNumber="Will be provided after order"
                    />
                  )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDE: Desktop Order Summary */}
          <div className="hidden lg:block lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Items ({cart.items.length})
                    </span>
                    <span className="font-medium">
                      {formatCurrency(cartTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Shipping
                    </span>
                    <span className="font-medium">
                      {shippingCost === 0 ? (
                        <span className="text-primary">Free</span>
                      ) : (
                        formatCurrency(shippingCost)
                      )}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12"
                  disabled={isSubmitting || !isKYCApproved}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Placing Order...
                    </>
                  ) : !isKYCApproved ? (
                    "Complete KYC to Order"
                  ) : (
                    "Place Order"
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By placing your order, you agree to our terms and
                  conditions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Mobile sticky summary */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-background border-t shadow-lg">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {cart.items.length} item
                    {cart.items.length !== 1 ? "s" : ""}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      {formatCurrency(total)}
                    </span>
                    {shippingCost > 0 && (
                      <span className="text-xs text-muted-foreground">
                        inc. shipping
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="h-12 px-8"
                  disabled={isSubmitting || !isKYCApproved}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : !isKYCApproved ? (
                    "Complete KYC"
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}



// import { useState, useEffect } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useQueryClient, useMutation } from "@tanstack/react-query";

// import { Button } from "@/components/ui/Button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Input } from "@/components/ui/Input";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// import { useCart } from "@/hooks/useCart";
// import { useStoreSettings } from "@/hooks/useStoreSettings";
// import { useAuth } from "@/hooks/useAuth";
// import { useLocations } from "@/hooks/useLocations";
// import { useKYCStatus } from "@/hooks/useKYC";
// import { useToast } from "@/hooks/use-toast";
// import { formatCurrency } from "@/lib/transactionUtils";
// import { apiPost } from "@/lib/api";

// import { Loader2, ArrowLeft, Package, Truck, AlertCircle } from "lucide-react";
// import { BankDetailsCard } from "@/components/BankDetailsCard";

// const NIGERIAN_STATES = [
//   "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
//   "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
//   "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
//   "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
//   "Yobe","Zamfara"
// ];

// const checkoutSchema = z.object({
//   delivery_type: z.enum(["delivery", "pickup"]),
//   pickup_location_id: z.string().optional(),
//   shipping_address: z.string().optional(),
//   shipping_city: z.string().optional(),
//   shipping_state: z.string().optional(),
//   shipping_postal_code: z.string().optional(),
//   contact_phone: z.string().min(10),
//   contact_email: z.string().email().optional().or(z.literal("")),
//   delivery_notes: z.string().optional(),
//   payment_method: z.enum(["cash_on_delivery", "bank_transfer", "pay_on_pickup", "stripe"]),
// }).refine(data => {
//   if (data.delivery_type === "delivery") {
//     return data.shipping_address && data.shipping_city && data.shipping_state;
//   }
//   if (data.delivery_type === "pickup") {
//     return data.pickup_location_id;
//   }
//   return true;
// });

// export default function Checkout() {
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const queryClient = useQueryClient();

//   const { cart, cartTotal, clearCart } = useCart();
//   const { user } = useAuth();
//   const { getSetting } = useStoreSettings();
//   const { locations } = useLocations();
//   const { data: kycStatus } = useKYCStatus();

//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [selectedLocation, setSelectedLocation] = useState(null);

//   const isKYCApproved = kycStatus?.kyc_status === "approved";
//   // alert(isKYCApproved)

//   const taxRate = getSetting("tax_rate")?.value || 0;
//   const shippingFee = getSetting("shipping_fee")?.value || 0;
//   const freeShippingThreshold = getSetting("shipping_fee")?.free_threshold || 50000;

//   const taxAmount = (cartTotal * taxRate) / 100;

//   const form = useForm({
//     resolver: zodResolver(checkoutSchema),
//     defaultValues: {
//       delivery_type: "delivery",
//       payment_method: "cash_on_delivery",
//     },
//   });

//   const deliveryType = form.watch("delivery_type");
//   const paymentMethod = form.watch("payment_method");
//   const pickupLocationId = form.watch("pickup_location_id");

//   const shippingCost =
//     deliveryType === "pickup"
//       ? 0
//       : cartTotal >= freeShippingThreshold
//       ? 0
//       : shippingFee;

//   const total = cartTotal + taxAmount + shippingCost;

//   useEffect(() => {
//     if (pickupLocationId) {
//       const location = locations?.find(l => l.id === pickupLocationId);
//       setSelectedLocation(location);
//     }
//   }, [pickupLocationId, locations]);

//   // ✅ React Query ORDER API
//   const createOrder = useMutation({
//     mutationFn: async (orderPayload) => {
//       const res = await apiPost("/api/orders/create", orderPayload);
//       return res;
//     },
//     onSuccess: (data) => {
//       queryClient.invalidateQueries(["cart"]);
//       clearCart();

//       toast({
//         title: "Order placed successfully!",
//         description: `Order ${data.order_number} has been created`,
//       });

//       navigate(`/order-confirmation/${data.id}`);
//     },
//     onError: (error) => {
//       toast({
//         title: "Order failed",
//         description: error.message || "Could not place order",
//         variant: "destructive",
//       });
//     },
//   });

//   const onSubmit = async (formData) => {
//     if (!cart?.items?.length) {
//       toast({ title: "Cart is empty", variant: "destructive" });
//       return;
//     }

//     if (!isKYCApproved) {
//       toast({
//         title: "KYC required",
//         description: "Please complete your KYC before placing orders",
//         variant: "destructive",
//       });
//       return;
//     }

//     setIsSubmitting(true);

//     const payload = {
//       user_id: user?.id,
//       items: cart.items,
//       cart_total: cartTotal,
//       tax: taxAmount,
//       shipping_fee: shippingCost,
//       total_amount: total,
//       ...formData,
//     };

//     await createOrder.mutate(payload);
//     setIsSubmitting(false);
//   };

//   if (!cart?.items?.length) {
//     return (
//       <div className="text-center py-12">
//         <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
//         <Button asChild><Link to="/shop">Browse Products</Link></Button>
//       </div>
//     );
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-6">
//         <Button asChild variant="ghost">
//           <Link to="/cart"><ArrowLeft className="h-4 w-4 mr-2" /> Back</Link>
//         </Button>

//         {!isKYCApproved && (
//           <Alert variant="destructive">
//             <AlertTitle>KYC Required</AlertTitle>
//             <AlertDescription>
//               You must complete KYC before placing orders.
//               <Link to="/kyc-onboarding"><Button className="mt-2">Go to KYC</Button></Link>
//             </AlertDescription>
//           </Alert>
//         )}

//         <Card>
//           <CardHeader>
//             <CardTitle>Order Summary</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div>Items: {cart.items.length}</div>
//             <div>Subtotal: {formatCurrency(cartTotal)}</div>
//             <div>Tax: {formatCurrency(taxAmount)}</div>
//             <div>Shipping: {shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}</div>
//             <div className="text-lg font-bold">Total: {formatCurrency(total)}</div>

//             <Button
//               type="submit"
//               disabled={isSubmitting || !isKYCApproved}
//               className="w-full"
//             >
//               {isSubmitting ? (
//                 <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Placing Order...</>
//               ) : "Place Order"}
//             </Button>
//           </CardContent>
//         </Card>
//       </form>
//     </Form>
//   );
// }
