"use client";

import { Divider } from "antd";
import { ProfileHeader } from "@/features/profile/ui/ProfileHeader";
import { PersonalDataForm } from "@/features/profile/ui/PersonalDataForm";
import { ChangePasswordForm } from "@/features/profile/ui/ChangePasswordForm";
import { useProfileForm } from "@/features/profile/hooks/useProfileForm";
import { usePasswordForm } from "@/features/profile/hooks/usePasswordForm";

export default function ProfilePage() {
  const profileForm = useProfileForm();
  const passwordForm = usePasswordForm();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {profileForm.profile && <ProfileHeader profile={profileForm.profile} />}
      <Divider style={{ margin: 0 }} />
      <PersonalDataForm
        formState={profileForm.formState}
        isDirty={profileForm.isDirty}
        saving={profileForm.saving}
        setField={profileForm.setField}
        save={profileForm.save}
        reset={profileForm.reset}
      />
      <ChangePasswordForm
        formState={passwordForm.formState}
        passwordStrength={passwordForm.passwordStrength}
        strengthLabel={passwordForm.strengthLabel}
        strengthColor={passwordForm.strengthColor}
        saving={passwordForm.saving}
        setField={passwordForm.setField}
        changePassword={passwordForm.changePassword}
        clear={passwordForm.clear}
      />
    </div>
  );
}
