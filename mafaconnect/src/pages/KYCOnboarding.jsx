import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  Plus,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Trash2,
} from "lucide-react";

import {
  useKYCStatus,
  useSubmitIndividualKYC,
  useSubmitCorporateKYC,
} from "@/hooks/useKYC";
import { toast } from "sonner";

const individualSchema = z.object({
  nin: z.string().regex(/^\d{11}$/, "NIN must be exactly 11 digits"),
  photo: z.any().refine((file) => file instanceof File, "Photo is required"),
});

export default function KYCOnboarding() {
  const navigate = useNavigate();

  const { data: kycStatus, isLoading } = useKYCStatus();
  const submitIndividual = useSubmitIndividualKYC();
  const submitCorporate = useSubmitCorporateKYC();

  const [step, setStep] = useState(1);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [cacDocuments, setCacDocuments] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [representative, setRepresentative] = useState({
    full_name: "",
    nin: "",
    phone: "",
    email: "",
    address: "",
  });

  const isIndividual = kycStatus?.customer_type === "individual";
  const totalSteps = isIndividual ? 2 : 4;
  const progress = (step / totalSteps) * 100;

  const individualForm = useForm({
    resolver: zodResolver(individualSchema),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (kycStatus?.kyc_status === "approved") {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <CardTitle>KYC Approved</CardTitle>
              <CardDescription>Your verification is complete</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate("/customer-dashboard")}>
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleIndividualSubmit = async () => {
    const nin = individualForm.getValues("nin");

    if (!nin || !photoFile) {
      toast.error("Please complete all required fields");
      return;
    }

    try {
      await submitIndividual.mutateAsync({
        nin,
        photoFile,
      });
      toast.success("KYC submitted successfully");
      navigate("/customer-dashboard");
    } catch (err) {
      toast.error("Failed to submit KYC");
    }
  };

  const handleCorporateSubmit = async () => {
    if (cacDocuments.length === 0) {
      toast.error("Upload CAC documents");
      return;
    }
    if (directors.length === 0) {
      toast.error("Add at least one director");
      return;
    }
    if (!representative.full_name || !representative.nin) {
      toast.error("Fill company representative info");
      return;
    }

    const payload = {
      cacDocuments,
      directors,
      representative,
    };

    try {
      await submitCorporate.mutateAsync(payload);
      toast.success("Corporate KYC submitted");
      navigate("/customer-dashboard");
    } catch {
      toast.error("Corporate submission failed");
    }
  };

  const addDirector = () => {
    setDirectors([
      ...directors,
      {
        full_name: "",
        nin: "",
        phone: "",
        email: "",
        address: "",
        photoFile: null,
        photoPreview: null,
      },
    ]);
  };

  const removeDirector = (index) => {
    setDirectors(directors.filter((_, i) => i !== index));
  };

  const updateDirector = (index, field, value) => {
    const updated = [...directors];
    updated[index][field] = value;
    setDirectors(updated);
  };

  const handleDirectorPhoto = (index, file) => {
    const updated = [...directors];
    updated[index].photoFile = file;
    updated[index].photoPreview = file ? URL.createObjectURL(file) : null;
    setDirectors(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>KYC Verification</CardTitle>
          <CardDescription>
            Complete your {isIndividual ? "individual" : "corporate"} verification
          </CardDescription>
          <Progress value={progress} className="mt-4" />
          <p className="text-sm text-muted-foreground mt-2">
            Step {step} of {totalSteps}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* INDIVIDUAL – STEP 1 */}
          {isIndividual && step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>NIN</Label>
                <Input
                  maxLength={11}
                  {...individualForm.register("nin")}
                  placeholder="Enter your 11-digit NIN"
                />
              </div>

              <div className="space-y-2">
                <Label>Upload Photo</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setPhotoFile(file);
                    individualForm.setValue("photo", file);
                    if (file) {
                      setPhotoPreview(URL.createObjectURL(file));
                    } else {
                      setPhotoPreview(null);
                    }
                  }}
                />
                {photoPreview && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1">
                      Preview:
                    </p>
                    <img
                      src={photoPreview}
                      alt="Photo preview"
                      className="h-32 w-32 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* INDIVIDUAL – STEP 2 */}
          {isIndividual && step === 2 && (
            <Button
              onClick={handleIndividualSubmit}
              disabled={submitIndividual.isPending}
              className="w-full"
            >
              {submitIndividual.isPending ? "Submitting..." : "Submit KYC"}
            </Button>
          )}

          {/* CORPORATE – STEP 1 (CAC DOCS) */}
          {!isIndividual && step === 1 && (
            <div className="space-y-3">
              <Label>Upload CAC Documents</Label>
              <Input
                type="file"
                multiple
                onChange={(e) => setCacDocuments([...e.target.files])}
              />

              {cacDocuments.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">Selected files:</p>
                  {cacDocuments.map((file, i) => (
                    <p key={i} className="text-xs text-green-600">
                      ✔ {file.name}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CORPORATE – STEP 2 (DIRECTORS) */}
          {!isIndividual && step === 2 && (
            <>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Directors</h3>
                <Button onClick={addDirector} size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Director
                </Button>
              </div>

              {directors.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No directors added yet. Click &quot;Add Director&quot; to begin.
                </p>
              )}

              <div className="space-y-3">
                {directors.map((d, index) => (
                  <Card key={index} className="p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-sm">
                        Director #{index + 1}
                      </p>
                      <Button
                        onClick={() => removeDirector(index)}
                        variant="destructive"
                        size="icon"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <Input
                      placeholder="Full Name"
                      value={d.full_name}
                      onChange={(e) =>
                        updateDirector(index, "full_name", e.target.value)
                      }
                    />
                    <Input
                      placeholder="NIN"
                      value={d.nin}
                      onChange={(e) =>
                        updateDirector(index, "nin", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Phone"
                      value={d.phone}
                      onChange={(e) =>
                        updateDirector(index, "phone", e.target.value)
                      }
                    />

                    <div className="space-y-1">
                      <Label className="text-xs">Photo (optional)</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          handleDirectorPhoto(index, file);
                        }}
                      />
                      {d.photoPreview && (
                        <img
                          src={d.photoPreview}
                          alt={`Director #${index + 1}`}
                          className="h-20 w-20 object-cover rounded-md border mt-2"
                        />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* CORPORATE – STEP 3 (REPRESENTATIVE) */}
          {!isIndividual && step === 3 && (
            <div className="space-y-3">
              <h3 className="font-bold">Company Representative</h3>

              <Input
                placeholder="Full Name"
                value={representative.full_name}
                onChange={(e) =>
                  setRepresentative({
                    ...representative,
                    full_name: e.target.value,
                  })
                }
              />
              <Input
                placeholder="NIN"
                value={representative.nin}
                onChange={(e) =>
                  setRepresentative({
                    ...representative,
                    nin: e.target.value,
                  })
                }
              />
              <Input
                placeholder="Email"
                value={representative.email}
                onChange={(e) =>
                  setRepresentative({
                    ...representative,
                    email: e.target.value,
                  })
                }
              />
              <Input
                placeholder="Phone"
                value={representative.phone}
                onChange={(e) =>
                  setRepresentative({
                    ...representative,
                    phone: e.target.value,
                  })
                }
              />
            </div>
          )}

          {/* CORPORATE – STEP 4 (SUBMIT) */}
          {!isIndividual && step === 4 && (
            <Button
              onClick={handleCorporateSubmit}
              disabled={submitCorporate.isPending}
              className="w-full"
            >
              {submitCorporate.isPending
                ? "Submitting..."
                : "Submit Corporate KYC"}
            </Button>
          )}

          {/* STEP NAVIGATION */}
          <div className="flex pt-6 border-t">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            )}

            {step < totalSteps && (
              <Button onClick={() => setStep(step + 1)} className="ml-auto">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/Card";
// import { Button } from "@/components/ui/Button";
// import { Input } from "@/components/ui/Input";
// import { Label } from "@/components/ui/Label";
// import { Progress } from "@/components/ui/progress";
// import {
//   Loader2,
//   Upload,
//   Plus,
//   Trash2,
//   ArrowRight,
//   ArrowLeft,
//   CheckCircle,
// } from "lucide-react";

// import {
//   useKYCStatus,
//   useSubmitIndividualKYC,
//   useSubmitCorporateKYC,
// } from "@/hooks/useKYC";

// import { toast } from "sonner";

// /* ==========================
//   Validation Schemas
// ========================== */

// const individualSchema = z.object({
//   nin: z.string().regex(/^\d{11}$/, "NIN must be exactly 11 digits"),
//   photo: z.any().refine((file) => file instanceof File, "Photo is required"),
// });

// /* ==========================
//   Main Component
// ========================== */

// export default function KYCOnboarding() {
//   const navigate = useNavigate();

//   const { data: kycStatus, isLoading } = useKYCStatus();
//   const submitIndividual = useSubmitIndividualKYC();
//   const submitCorporate = useSubmitCorporateKYC();

//   const [step, setStep] = useState(1);
//   const [photoFile, setPhotoFile] = useState(null);
//   const [cacDocuments, setCacDocuments] = useState([]);
//   const [directors, setDirectors] = useState([]);

//   const [representative, setRepresentative] = useState({
//     full_name: "",
//     nin: "",
//     phone: "",
//     email: "",
//     address: "",
//   });

//   const [repDocFile, setRepDocFile] = useState(null);

//   const isIndividual = kycStatus?.customer_type === "individual";
//   const totalSteps = isIndividual ? 2 : 4;
//   const progress = (step / totalSteps) * 100;

//   const individualForm = useForm({
//     resolver: zodResolver(individualSchema),
//   });

//   /* ==========================
//     Loading State
//   ========================== */
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   /* ==========================
//     Already Approved
//   ========================== */
//   if (kycStatus?.kyc_status === "approved") {
//     return (
//       <Card className="max-w-2xl mx-auto">
//         <CardHeader>
//           <div className="flex items-center gap-3">
//             <CheckCircle className="h-8 w-8 text-green-500" />
//             <div>
//               <CardTitle>KYC Approved</CardTitle>
//               <CardDescription>Your verification is complete</CardDescription>
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <Button onClick={() => navigate("/customer-dashboard")}>
//             Go to Dashboard
//           </Button>
//         </CardContent>
//       </Card>
//     );
//   }

//   /* ==========================
//     Individual Submit
//   ========================== */
//   const handleIndividualSubmit = async () => {
//     const nin = individualForm.getValues("nin");

//     if (!nin || !photoFile) {
//       toast.error("Please complete all required fields");
//       return;
//     }

//     try {
//       await submitIndividual.mutateAsync({
//         nin,
//         photoFile,
//       });

//       toast.success("KYC submitted successfully");
//       navigate("/customer-dashboard");
//     } catch (err) {
//       toast.error("Failed to submit KYC");
//     }
//   };

//   /* ==========================
//     Corporate Submit
//   ========================== */
//   const handleCorporateSubmit = async () => {
//     if (cacDocuments.length === 0) {
//       toast.error("Upload CAC documents");
//       return;
//     }

//     if (directors.length === 0) {
//       toast.error("Add at least one director");
//       return;
//     }

//     if (!representative.full_name || !representative.nin) {
//       toast.error("Fill company representative info");
//       return;
//     }

//     const payload = {
//       cacDocuments,
//       directors: directors,
//       representative: {
//         ...representative,
//         documentationFile: repDocFile,
//       },
//     };

//     try {
//       await submitCorporate.mutateAsync(payload);
//       toast.success("Corporate KYC submitted");
//       navigate("/customer-dashboard");
//     } catch {
//       toast.error("Corporate submission failed");
//     }
//   };

//   /* ==========================
//     Directors Functions
//   ========================== */

//   const addDirector = () => {
//     setDirectors([
//       ...directors,
//       {
//         full_name: "",
//         nin: "",
//         phone: "",
//         email: "",
//         address: "",
//         photoFile: null,
//       },
//     ]);
//   };

//   const removeDirector = (index) => {
//     setDirectors(directors.filter((_, i) => i !== index));
//   };

//   const updateDirector = (index, field, value) => {
//     const updated = [...directors];
//     updated[index][field] = value;
//     setDirectors(updated);
//   };

//   /* ==========================
//     UI
//   ========================== */
//   return (
//     <div className="max-w-4xl mx-auto space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle>KYC Verification</CardTitle>
//           <CardDescription>
//             Complete your {isIndividual ? "individual" : "corporate"} verification
//           </CardDescription>
//           <Progress value={progress} className="mt-4" />
//           <p className="text-sm text-muted-foreground mt-2">
//             Step {step} of {totalSteps}
//           </p>
//         </CardHeader>

//         <CardContent className="space-y-6">

//           {/* ================= INDIVIDUAL ================= */}
//           {isIndividual && step === 1 && (
//             <div className="space-y-4">
//               <Label>NIN</Label>
//               <Input {...individualForm.register("nin")} maxLength={11} />

//               <Label>Upload Photo</Label>
//               <Input
//                 type="file"
//                 accept="image/*"
//                 onChange={(e) => {
//                   const file = e.target.files[0];
//                   setPhotoFile(file);
//                   individualForm.setValue("photo", file);
//                 }}
//               />

//               {photoFile && <p className="text-green-600">✓ {photoFile.name}</p>}
//             </div>
//           )}

//           {isIndividual && step === 2 && (
//             <Button
//               onClick={handleIndividualSubmit}
//               disabled={submitIndividual.isPending}
//               className="w-full"
//             >
//               {submitIndividual.isPending ? "Submitting..." : "Submit KYC"}
//             </Button>
//           )}

//           {/* ================= CORPORATE ================= */}
//           {!isIndividual && step === 1 && (
//             <div>
//               <Label>Upload CAC Documents</Label>
//               <Input
//                 type="file"
//                 multiple
//                 onChange={(e) => setCacDocuments([...e.target.files])}
//               />

//               {cacDocuments.map((file, i) => (
//                 <p key={i} className="text-green-600">✓ {file.name}</p>
//               ))}
//             </div>
//           )}

//           {!isIndividual && step === 2 && (
//             <>
//               <div className="flex justify-between">
//                 <h3 className="font-bold">Directors</h3>
//                 <Button onClick={addDirector} size="sm">
//                   <Plus className="h-4 w-4" /> Add
//                 </Button>
//               </div>

//               {directors.map((d, index) => (
//                 <Card key={index} className="p-4">
//                   <Input placeholder="Full Name" value={d.full_name} onChange={(e) => updateDirector(index, "full_name", e.target.value)} />
//                   <Input placeholder="NIN" value={d.nin} onChange={(e) => updateDirector(index, "nin", e.target.value)} />
//                   <Input placeholder="Phone" value={d.phone} onChange={(e) => updateDirector(index, "phone", e.target.value)} />
//                   <Button onClick={() => removeDirector(index)} variant="destructive">Remove</Button>
//                 </Card>
//               ))}
//             </>
//           )}

//           {!isIndividual && step === 4 && (
//             <Button
//               onClick={handleCorporateSubmit}
//               disabled={submitCorporate.isPending}
//               className="w-full"
//             >
//               Submit Corporate KYC
//             </Button>
//           )}

//           {/* ================= Navigation ================= */}
//           <div className="flex pt-6 border-t">
//             {step > 1 && (
//               <Button variant="outline" onClick={() => setStep(step - 1)}>
//                 <ArrowLeft className="mr-2 h-4 w-4" /> Back
//               </Button>
//             )}

//             {step < totalSteps && (
//               <Button onClick={() => setStep(step + 1)} className="ml-auto">
//                 Next <ArrowRight className="ml-2 h-4 w-4" />
//               </Button>
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
