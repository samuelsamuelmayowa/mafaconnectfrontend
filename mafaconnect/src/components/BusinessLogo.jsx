import * as React from "react";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import mafaLogo from "@/assets/mafa-logo.png";

export function BusinessLogo({ 
  size = "md", 
  showName = true,
  showContactInfo = false 
}) {
  const { getSetting } = useStoreSettings();
  
  const businessName = getSetting("business_name", "MAFA Rice Mill Limited");
  const businessEmail = getSetting("business_email", "sales@mafagroup.org");
  const businessPhone = getSetting("business_phone", "+234 904 028 8888");
  const rawAddress = getSetting("business_address", "");
  
  // Clean address - remove everything before "Km" or "km"
  const cleanAddress = (address) => {
    if (!address) return "";
    const kmIndex = address.toLowerCase().indexOf("km");
    if (kmIndex > 0) {
      return (
        address.substring(kmIndex).charAt(0).toUpperCase() +
        address.substring(kmIndex + 1)
      );
    }
    return address;
  };
  
  const businessAddress = cleanAddress(rawAddress);
  
  const sizeClasses = {
    sm: "h-10",
    md: "h-16",
    lg: "h-24"
  };
  
  const textSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl"
  };

  return (
    <div className="flex flex-col items-end gap-3">
      <div className="flex items-center gap-4">
        <img 
          src={mafaLogo} 
          alt={businessName}
          className={sizeClasses[size]}
        />
        {showName && (
          <div>
            <h1 className={`font-bold text-foreground ${textSizeClasses[size]}`}>
              {businessName}
            </h1>
          </div>
        )}
      </div>

      {showContactInfo && (
        <div className="text-right text-muted-foreground text-sm">
          {businessAddress && <p>{businessAddress}</p>}
          <p>
            {businessPhone && <span>Phone: {businessPhone}</span>}
            {businessPhone && businessEmail && <span> | </span>}
            {businessEmail && <span>Email: {businessEmail}</span>}
          </p>
        </div>
      )}
    </div>
  );
}
