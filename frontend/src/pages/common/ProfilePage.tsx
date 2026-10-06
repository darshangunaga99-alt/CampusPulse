import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../auth/roles';
import { updateProfile } from '../../api/auth';
import type { UpdateProfilePayload } from '../../types';

export const ProfilePage: React.FC = () => {
  const { user, role, updateUser } = useAuth();
  const currentRole = role ?? 'student';
  const isStudent = currentRole === 'student';

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    usn: '',
    course: '',
    department: '',
    email: '',
    phoneNumber: '',
  });

  // Populate form data whenever user object changes or edit mode initializes
  useEffect(() => {
    if (user) {
      let derivedFirst = user.first_name ?? '';
      let derivedMiddle = user.middle_name ?? '';
      let derivedLast = user.last_name ?? '';

      // Only fallback to parsing user.name if first_name, middle_name, and last_name are ALL null/undefined
      if (
        user.first_name === undefined &&
        user.middle_name === undefined &&
        user.last_name === undefined &&
        user.name
      ) {
        const parts = user.name.trim().split(/\s+/);
        if (parts.length === 1) {
          derivedFirst = parts[0];
        } else if (parts.length === 2) {
          derivedFirst = parts[0];
          derivedLast = parts[1];
        } else if (parts.length >= 3) {
          derivedFirst = parts[0];
          derivedMiddle = parts.slice(1, -1).join(' ');
          derivedLast = parts[parts.length - 1];
        }
      }

      setFormData({
        firstName: derivedFirst,
        middleName: derivedMiddle,
        lastName: derivedLast,
        usn: user.usn ?? '',
        course: user.course ?? (isStudent ? 'B.E. Computer Science' : ''),
        department: user.department ?? 'Computer Science & Engineering',
        email: user.email ?? '',
        phoneNumber: user.phone_number ?? '',
      });
    }
  }, [user, isStudent]);

  // Compute full display name
  const computeDisplayName = () => {
    const parts = [
      formData.firstName.trim(),
      formData.middleName.trim(),
      formData.lastName.trim(),
    ].filter(Boolean);

    if (parts.length > 0) return parts.join(' ');
    if (user) {
      const userParts = [
        user.first_name?.trim(),
        user.middle_name?.trim(),
        user.last_name?.trim(),
      ].filter(Boolean);
      if (userParts.length > 0) return userParts.join(' ');
    }
    return user?.name || 'Authenticated Student';
  };

  const displayName = computeDisplayName();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (errorMessage) setErrorMessage(null);
    if (successMessage) setSuccessMessage(null);
  };

  const handleCancel = () => {
    // Reset form to user state
    if (user) {
      let derivedFirst = user.first_name ?? '';
      let derivedMiddle = user.middle_name ?? '';
      let derivedLast = user.last_name ?? '';

      if (
        user.first_name === undefined &&
        user.middle_name === undefined &&
        user.last_name === undefined &&
        user.name
      ) {
        const parts = user.name.trim().split(/\s+/);
        if (parts.length === 1) {
          derivedFirst = parts[0];
        } else if (parts.length === 2) {
          derivedFirst = parts[0];
          derivedLast = parts[1];
        } else if (parts.length >= 3) {
          derivedFirst = parts[0];
          derivedMiddle = parts.slice(1, -1).join(' ');
          derivedLast = parts[parts.length - 1];
        }
      }

      setFormData({
        firstName: derivedFirst,
        middleName: derivedMiddle,
        lastName: derivedLast,
        usn: user.usn ?? '',
        course: user.course ?? (isStudent ? 'B.E. Computer Science' : ''),
        department: user.department ?? 'Computer Science & Engineering',
        email: user.email ?? '',
        phoneNumber: user.phone_number ?? '',
      });
    }
    setFieldErrors({});
    setErrorMessage(null);
    setIsEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation: First Name (Required)
    const trimmedFirstName = formData.firstName.trim();
    const errors: { [key: string]: string } = {};

    if (!trimmedFirstName) {
      errors.firstName = 'First name is required.';
    }

    // 2. Validation: Email
    const trimmedEmail = formData.email.trim();
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    // 3. Validation: Phone number
    const trimmedPhone = formData.phoneNumber.trim();
    if (trimmedPhone && !/^[+]?[\d\s-]{7,18}$/.test(trimmedPhone)) {
      errors.phoneNumber = 'Please enter a valid phone number.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Send explicit current form values without turning empty strings into undefined
    const payload: UpdateProfilePayload = {
      first_name: trimmedFirstName,
      middle_name: formData.middleName.trim(),
      last_name: formData.lastName.trim(),
      usn: formData.usn.trim().toUpperCase(),
      course: formData.course.trim(),
      department: formData.department.trim(),
      email: trimmedEmail,
      phone_number: trimmedPhone,
    };

    try {
      const updatedUser = await updateProfile(payload);
      updateUser(updatedUser);
      setSuccessMessage('Profile updated successfully.');
      setIsEditing(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-space-xl max-w-4xl mx-auto pb-space-2xl">
      {/* Page Header & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-1 font-mono-data-sm">
          <span>CampusPulse</span>
          <span>/</span>
          <span className="text-secondary font-semibold">User Profile</span>
        </div>
        <h1 className="font-display-lg text-2xl font-bold text-on-surface">
          Account Profile &amp; Settings
        </h1>
        <p className="font-body-md text-sm text-on-surface-variant mt-1">
          {isStudent
            ? 'Manage your personal details, academic credentials, and contact information.'
            : 'Manage your campus account details, role permissions, and session security.'}
        </p>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium animate-in fade-in duration-200 shadow-sm">
          <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification Alert */}
      {errorMessage && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-error-container/20 border border-error/20 text-error text-sm font-medium animate-in fade-in duration-200 shadow-sm">
          <span className="material-symbols-outlined text-error text-lg">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-space-lg sm:p-space-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        {/* Top Header Row with Avatar & Edit Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-lg pb-space-lg border-b border-outline-variant/20">
          <div className="flex items-center gap-space-lg">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-secondary flex items-center justify-center text-on-secondary font-extrabold text-2xl sm:text-3xl shadow-md shadow-secondary/20 shrink-0">
              {formData.firstName.trim().charAt(0) || user?.name?.charAt(0) || 'S'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="font-headline-lg text-lg sm:text-xl font-bold text-on-surface truncate">
                  {displayName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary-container/20 text-secondary border border-secondary/20 font-label-sm">
                  {ROLE_LABELS[currentRole]}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Account
                </span>
              </div>

              <p className="font-body-md text-sm text-on-surface-variant truncate">
                {formData.email || user?.email || 'student@campuspulse.edu'}
              </p>
            </div>
          </div>

          {/* Edit Profile Action Button */}
          {!isEditing && (
            <button
              onClick={() => {
                setIsEditing(true);
                setSuccessMessage(null);
                setErrorMessage(null);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold rounded-xl border border-outline-variant/30 transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-base text-secondary">edit</span>
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {/* Form Body: Read-only or Editable */}
        <form onSubmit={handleSave} className="space-y-space-xl pt-space-lg">
          {/* 1. PERSONAL INFORMATION */}
          <div className="space-y-space-md">
            <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/15">
              <span className="material-symbols-outlined text-secondary text-base">person</span>
              <h3 className="font-label-lg text-xs font-bold uppercase tracking-wider text-on-surface">
                Personal Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
              {/* First Name */}
              <div className="space-y-1">
                <label className="block font-label-sm text-xs text-on-surface-variant font-medium">
                  First Name <span className="text-error font-bold">*</span>
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="e.g. Rahul"
                      className={`w-full font-body-md text-sm text-on-surface bg-surface-container-low px-3 py-2 rounded-xl border outline-none transition-all ${
                        fieldErrors.firstName
                          ? 'border-error focus:ring-1 focus:ring-error'
                          : 'border-outline-variant/30 focus:border-secondary focus:ring-1 focus:ring-secondary/20'
                      }`}
                    />
                    {fieldErrors.firstName && (
                      <p className="font-label-sm text-[11px] text-error mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">info</span>
                        {fieldErrors.firstName}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="font-body-md text-sm font-semibold text-on-surface bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/20">
                    {formData.firstName || '—'}
                  </div>
                )}
              </div>

              {/* Middle Name */}
              <div className="space-y-1">
                <label className="block font-label-sm text-xs text-on-surface-variant font-medium">
                  Middle Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.middleName}
                    onChange={(e) => handleInputChange('middleName', e.target.value)}
                    placeholder="e.g. Kumar"
                    className="w-full font-body-md text-sm text-on-surface bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/30 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all"
                  />
                ) : (
                  <div className="font-body-md text-sm text-on-surface bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/20">
                    {formData.middleName || '—'}
                  </div>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-1">
                <label className="block font-label-sm text-xs text-on-surface-variant font-medium">
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="e.g. Sharma"
                    className="w-full font-body-md text-sm text-on-surface bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/30 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all"
                  />
                ) : (
                  <div className="font-body-md text-sm text-on-surface bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/20">
                    {formData.lastName || '—'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. ACADEMIC INFORMATION */}
          <div className="space-y-space-md">
            <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/15">
              <span className="material-symbols-outlined text-secondary text-base">school</span>
              <h3 className="font-label-lg text-xs font-bold uppercase tracking-wider text-on-surface">
                Academic Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
              {/* USN */}
              <div className="space-y-1">
                <label className="block font-label-sm text-xs text-on-surface-variant font-medium">
                  USN (University Seat Number)
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.usn}
                    onChange={(e) => handleInputChange('usn', e.target.value)}
                    placeholder="e.g. 4XX22CS001"
                    className="w-full font-mono-data-sm text-sm text-on-surface bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/30 outline-none uppercase focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all"
                  />
                ) : (
                  <div className="font-mono-data-sm text-sm font-semibold text-on-surface bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/20">
                    {formData.usn || '4XX22CS001'}
                  </div>
                )}
              </div>

              {/* Course */}
              <div className="space-y-1">
                <label className="block font-label-sm text-xs text-on-surface-variant font-medium">
                  Course
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.course}
                    onChange={(e) => handleInputChange('course', e.target.value)}
                    placeholder="e.g. B.E. Computer Science"
                    className="w-full font-body-md text-sm text-on-surface bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/30 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all"
                  />
                ) : (
                  <div className="font-body-md text-sm text-on-surface bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/20">
                    {formData.course || 'B.E. Computer Science'}
                  </div>
                )}
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="block font-label-sm text-xs text-on-surface-variant font-medium">
                  Department
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                    className="w-full font-body-md text-sm text-on-surface bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/30 outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all"
                  />
                ) : (
                  <div className="font-body-md text-sm text-on-surface bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/20">
                    {formData.department || 'Computer Science & Engineering'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. CONTACT INFORMATION */}
          <div className="space-y-space-md">
            <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/15">
              <span className="material-symbols-outlined text-secondary text-base">contact_mail</span>
              <h3 className="font-label-lg text-xs font-bold uppercase tracking-wider text-on-surface">
                Contact Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              {/* Gmail / Email */}
              <div className="space-y-1">
                <label className="block font-label-sm text-xs text-on-surface-variant font-medium">
                  Gmail / Campus Email
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="e.g. rahul@example.com"
                      className={`w-full font-body-md text-sm text-on-surface bg-surface-container-low px-3 py-2 rounded-xl border outline-none transition-all ${
                        fieldErrors.email
                          ? 'border-error focus:ring-1 focus:ring-error'
                          : 'border-outline-variant/30 focus:border-secondary focus:ring-1 focus:ring-secondary/20'
                      }`}
                    />
                    {fieldErrors.email && (
                      <p className="font-label-sm text-[11px] text-error mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">info</span>
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="font-body-md text-sm text-on-surface bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/20">
                    {formData.email || 'student@campuspulse.edu'}
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="block font-label-sm text-xs text-on-surface-variant font-medium">
                  Phone Number
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className={`w-full font-body-md text-sm text-on-surface bg-surface-container-low px-3 py-2 rounded-xl border outline-none transition-all ${
                        fieldErrors.phoneNumber
                          ? 'border-error focus:ring-1 focus:ring-error'
                          : 'border-outline-variant/30 focus:border-secondary focus:ring-1 focus:ring-secondary/20'
                      }`}
                    />
                    {fieldErrors.phoneNumber && (
                      <p className="font-label-sm text-[11px] text-error mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">info</span>
                        {fieldErrors.phoneNumber}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="font-body-md text-sm text-on-surface bg-surface-container-low px-3 py-2 rounded-xl border border-outline-variant/20">
                    {formData.phoneNumber || '+91 98765 43210'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions in Edit Mode */}
          {isEditing && (
            <div className="flex items-center justify-end gap-3 pt-space-lg border-t border-outline-variant/20">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-secondary hover:bg-secondary/90 text-on-secondary text-xs font-semibold shadow-md shadow-secondary/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-on-secondary border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">save</span>
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
