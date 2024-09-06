import React from 'react';
import { useOrganization } from "@clerk/nextjs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface DashboardTogglerProps {
  isPersonal: boolean;
  onToggle: (isPersonal: boolean) => void;
}

const DashboardToggler: React.FC<DashboardTogglerProps> = ({ isPersonal, onToggle }) => {
  const { organization } = useOrganization();

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="dashboard-toggle"
        checked={!isPersonal}
        onCheckedChange={() => onToggle(!isPersonal)}
        disabled={!organization}
      />
      <Label htmlFor="dashboard-toggle">
        {isPersonal ? "Personal" : organization?.name || "Organization"}
      </Label>
    </div>
  );
};

export default DashboardToggler;