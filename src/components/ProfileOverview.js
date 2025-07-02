import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { updateProfile, sendEmailVerification, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { FiUser, FiMail, FiEdit2, FiSave, FiX, FiLock, FiShield, FiKey, FiCheckCircle, FiAlertCircle, FiGithub, FiLinkedin, FiCalendar, FiHome, FiUserCheck } from 'react-icons/fi';
import { parsePhoneNumberFromString } from 'libphonenumber-js'; // Import for phone number validation

const ProfileOverview = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    photoURL: '',
    bio: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    github: '',
    linkedin: ''
  });
  const [initialFirestoreData, setInitialFirestoreData] = useState(null); // To track changes for Firestore fields
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false); // New: To control Save Changes button
  const [updatedFields, setUpdatedFields] = useState({}); // New: For success indicators

  // Account Deletion States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);


  // Effect to check for email verification redirect
  useEffect(() => {
    const checkEmailVerification = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('verifyEmail') === 'true' && auth.currentUser) {
        await auth.currentUser.reload();
        setUser(auth.currentUser);
        setSuccessMessage('Email verified successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        // Clean URL after verification message is shown
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('verifyEmail');
        window.history.replaceState({}, document.title, newUrl.href);
      }
    };

    checkEmailVerification();
  }, []);

  // Effect to load user data from Firebase Auth and Firestore
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        let firestoreData = {};
        if (userSnap.exists()) {
          firestoreData = userSnap.data();
        } else {
          // Create user document if it doesn't exist
          firestoreData = {
            displayName: currentUser.displayName || '',
            email: currentUser.email || '',
            photoURL: currentUser.photoURL || '',
            bio: '',
            phone: '',
            gender: '',
            dateOfBirth: '',
            address: '',
            github: '',
            linkedin: '',
            createdAt: new Date(),
            lastUpdated: new Date()
          };
          await setDoc(userRef, firestoreData);
        }

        setFormData({
          displayName: currentUser.displayName || firestoreData.displayName || '',
          email: currentUser.email || '',
          photoURL: currentUser.photoURL || firestoreData.photoURL || '',
          bio: firestoreData.bio || '',
          phone: firestoreData.phone || '',
          gender: firestoreData.gender || '',
          dateOfBirth: firestoreData.dateOfBirth || '',
          address: firestoreData.address || '',
          github: firestoreData.github || '',
          linkedin: firestoreData.linkedin || ''
        });

        // Set initial Firestore data for change detection
        setInitialFirestoreData({
          displayName: currentUser.displayName || firestoreData.displayName || '',
          email: currentUser.email || '',
          photoURL: currentUser.photoURL || firestoreData.photoURL || '',
          bio: firestoreData.bio || '',
          phone: firestoreData.phone || '',
          gender: firestoreData.gender || '',
          dateOfBirth: firestoreData.dateOfBirth || '',
          address: firestoreData.address || '',
          github: firestoreData.github || '',
          linkedin: firestoreData.linkedin || ''
        });

        setLoading(false);
      } else {
        setLoading(false); // No user logged in
      }
    });
    return () => unsubscribe();
  }, []);

  // Effect to determine if changes have been made (for disabling Save button)
  useEffect(() => {
    if (user && formData && initialFirestoreData) {
      const changesDetected =
        formData.displayName !== initialFirestoreData.displayName ||
        formData.email !== initialFirestoreData.email ||
        formData.photoURL !== initialFirestoreData.photoURL ||
        formData.bio !== initialFirestoreData.bio ||
        formData.phone !== initialFirestoreData.phone ||
        formData.gender !== initialFirestoreData.gender ||
        formData.dateOfBirth !== initialFirestoreData.dateOfBirth ||
        formData.address !== initialFirestoreData.address ||
        formData.github !== initialFirestoreData.github ||
        formData.linkedin !== initialFirestoreData.linkedin;
      setHasChanges(changesDetected);
    } else {
      setHasChanges(false);
    }
  }, [formData, user, initialFirestoreData]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Phone number validation
    if (formData.phone.trim()) {
      const phoneNumber = parsePhoneNumberFromString(formData.phone);
      if (!phoneNumber || !phoneNumber.isValid()) {
        newErrors.phone = 'Please enter a valid phone number (e.g., +15551234567)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!hasChanges) {
      setSuccessMessage('No changes to save.');
      setTimeout(() => setSuccessMessage(''), 3000);
      setIsEditing(false);
      return;
    }

    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      const userRef = doc(db, 'users', currentUser.uid);
      const promises = [];
      const fieldsUpdatedSuccessfully = {}; // Track which fields were updated

      // Update Auth profile (displayName, photoURL)
      if (formData.displayName !== initialFirestoreData.displayName) {
        promises.push(updateProfile(currentUser, { displayName: formData.displayName }));
        fieldsUpdatedSuccessfully.displayName = true;
      }
      if (formData.photoURL !== initialFirestoreData.photoURL) {
        promises.push(updateProfile(currentUser, { photoURL: formData.photoURL || null }));
        fieldsUpdatedSuccessfully.photoURL = true;
      }

      // Prepare Firestore update object
      const firestoreUpdate = { lastUpdated: new Date() };
      let emailChanged = false;

      if (formData.email !== initialFirestoreData.email) {
        emailChanged = true;
        // Firebase Auth email update requires verification
        // Storing new email in Firestore, but Auth email will remain old until verified.
        firestoreUpdate.email = formData.email;
        fieldsUpdatedSuccessfully.email = true;
      } else {
        firestoreUpdate.email = formData.email; // Keep current email in Firestore if not changed
      }

      if (formData.bio !== initialFirestoreData.bio) {
        firestoreUpdate.bio = formData.bio;
        fieldsUpdatedSuccessfully.bio = true;
      }
      if (formData.phone !== initialFirestoreData.phone) {
        firestoreUpdate.phone = formData.phone;
        fieldsUpdatedSuccessfully.phone = true;
      }
      if (formData.gender !== initialFirestoreData.gender) {
        firestoreUpdate.gender = formData.gender;
        fieldsUpdatedSuccessfully.gender = true;
      }
      if (formData.dateOfBirth !== initialFirestoreData.dateOfBirth) {
        firestoreUpdate.dateOfBirth = formData.dateOfBirth;
        fieldsUpdatedSuccessfully.dateOfBirth = true;
      }
      if (formData.address !== initialFirestoreData.address) {
        firestoreUpdate.address = formData.address;
        fieldsUpdatedSuccessfully.address = true;
      }
      if (formData.github !== initialFirestoreData.github) {
        firestoreUpdate.github = formData.github;
        fieldsUpdatedSuccessfully.github = true;
      }
      if (formData.linkedin !== initialFirestoreData.linkedin) {
        firestoreUpdate.linkedin = formData.linkedin;
        fieldsUpdatedSuccessfully.linkedin = true;
      }

      // Only update Firestore if there are changes to Firestore-managed fields
      if (Object.keys(firestoreUpdate).length > 1 || emailChanged) { // Check for actual field changes + lastUpdated
        promises.push(setDoc(userRef, firestoreUpdate, { merge: true }));
      }

      await Promise.all(promises);

      // Handle email change separately for verification
      if (emailChanged) {
        await sendEmailVerification(currentUser, {
          url: `${window.location.origin}/profile?verifyEmail=true`,
          handleCodeInApp: true
        });
        setSuccessMessage(`Verification email sent to ${formData.email}. Please verify your new email address before it will be updated.`);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }

      setUpdatedFields(fieldsUpdatedSuccessfully);
      setTimeout(() => setUpdatedFields({}), 3000); // Clear success indicators

      setIsEditing(false);
      // Reload user to get updated displayName/photoURL and emailVerified status immediately
      await auth.currentUser.reload();
      setUser(auth.currentUser); // Update local user state
      // Reload initialFirestoreData to reflect latest state for next edit cycle
      const updatedUserSnap = await getDoc(doc(db, 'users', currentUser.uid));
      if (updatedUserSnap.exists()) {
          setInitialFirestoreData(updatedUserSnap.data());
      }


    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({
        general: error.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    try {
      setLoading(true);
      const currentUser = auth.currentUser;

      // Reauthenticate user
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, passwordData.newPassword);

      setSuccessMessage('Password changed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordErrors({}); // Clear errors on success
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordErrors({
        general: error.message || 'Failed to change password. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset formData to initial state
    setFormData({
      displayName: initialFirestoreData.displayName || '',
      email: initialFirestoreData.email || '',
      photoURL: initialFirestoreData.photoURL || '',
      bio: initialFirestoreData.bio || '',
      phone: initialFirestoreData.phone || '',
      gender: initialFirestoreData.gender || '',
      dateOfBirth: initialFirestoreData.dateOfBirth || '',
      address: initialFirestoreData.address || '',
      github: initialFirestoreData.github || '',
      linkedin: initialFirestoreData.linkedin || ''
    });
    setErrors({});
    setHasChanges(false); // Reset changes flag
  };

  const handlePasswordCancel = () => {
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordErrors({});
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setIsDeleting(true);

    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm deletion.');
      setIsDeleting(false);
      return;
    }

    try {
      const authUser = auth.currentUser;
      if (!authUser) {
        setDeleteError('No authenticated user found.');
        setIsDeleting(false);
        return;
      }

      // Reauthenticate
      const credential = EmailAuthProvider.credential(authUser.email, deletePassword);
      await reauthenticateWithCredential(authUser, credential);

      // Delete Firestore user document
      const userRef = doc(db, 'users', authUser.uid);
      await deleteDoc(userRef);

      // Delete Firebase Auth user
      await deleteUser(authUser);

      setSuccessMessage('Account deleted successfully. Redirecting...');
      setTimeout(() => {
        window.location.href = '/'; // Redirect to home or logout page
      }, 2000);

    } catch (error) {
      console.error('Error deleting account:', error);
      setDeleteError(error.message || 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };


  if (loading && !showPasswordModal && !showDeleteModal) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold flex items-center">
                <FiKey className="mr-2" /> Change Password
              </h3>
              <button
                onClick={handlePasswordCancel}
                className="text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                <FiX size={20} />
              </button>
            </div>

            {passwordErrors.general && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {passwordErrors.general}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 border rounded-md ${passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={loading}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 border rounded-md ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={loading}
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 border rounded-md ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                    disabled={loading}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handlePasswordCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold flex items-center text-red-700">
                <FiAlertCircle className="mr-2" /> Confirm Account Deletion
              </h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                  setDeleteError('');
                }}
                className="text-gray-500 hover:text-gray-700"
                disabled={isDeleting}
              >
                <FiX size={20} />
              </button>
            </div>

            {deleteError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {deleteError}
              </div>
            )}

            <p className="mb-4 text-gray-700">
              This action is irreversible. Please enter your current password to confirm you wish to permanently delete your account.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${deleteError ? 'border-red-500' : 'border-gray-300'}`}
                disabled={isDeleting}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                  setDeleteError('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete My Account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Profile Content */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
          <FiUser className="mr-2" /> Profile Overview
        </h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            disabled={loading}
          >
            <FiEdit2 className="mr-1" /> Edit Profile
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              <FiX className="mr-1" /> Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit} // Call handleSubmit here for save button within edit mode
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading || !hasChanges}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="mr-1" /> Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      {errors.general && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            {isEditing ? (
              <div className="relative">
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.displayName ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={loading}
                />
                {updatedFields.displayName && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✔️</span>
                )}
                {errors.displayName && (
                  <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
                )}
              </div>
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-md">
                {formData.displayName || 'Not set'}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
  {isEditing ? (
    <>
      <div className="relative flex items-center">
        <FiMail className="text-gray-500 mr-2" />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className={`flex-1 px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          disabled={loading}
        />
        {updatedFields.email && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✔️</span>
        )}
      </div>
      {errors.email && (
        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
      )}
    </>
  ) : (
    <div className="px-3 py-2 bg-gray-50 rounded-md flex items-center">
      <FiMail className="text-gray-500 mr-2" />
      <span>{formData.email}</span>
    </div>
  )}
</div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            {isEditing ? (
              <div className="relative">
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="3"
                  disabled={loading}
                />
                {updatedFields.bio && (
                  <span className="absolute right-3 top-2 text-green-500">✔️</span>
                )}
              </div>
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-md">
                {formData.bio || 'Not set'}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            {isEditing ? (
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={loading}
                  placeholder="+15551234567"
                />
                {updatedFields.phone && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✔️</span>
                )}
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-md">
                {formData.phone || 'Not set'}
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            {isEditing ? (
              <div className="relative">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={loading}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {updatedFields.gender && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✔️</span>
                )}
              </div>
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-md flex items-center">
                <FiUserCheck className="text-gray-500 mr-2" />
                {formData.gender || 'Not set'}
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            {isEditing ? (
              <div className="relative">
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={loading}
                />
                {updatedFields.dateOfBirth && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✔️</span>
                )}
              </div>
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-md flex items-center">
                <FiCalendar className="text-gray-500 mr-2" />
                {formData.dateOfBirth || 'Not set'}
              </p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            {isEditing ? (
              <div className="relative">
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows="2"
                  disabled={loading}
                />
                {updatedFields.address && (
                  <span className="absolute right-3 top-2 text-green-500">✔️</span>
                )}
              </div>
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-md flex items-center">
                <FiHome className="text-gray-500 mr-2" />
                {formData.address || 'Not set'}
              </p>
            )}
          </div>
          {/* GitHub Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Profile</label>
            {isEditing ? (
              <div className="relative">
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  placeholder="e.g., https://github.com/yourusername"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={loading}
                />
                {updatedFields.github && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✔️</span>
                )}
              </div>
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-md flex items-center">
                <FiGithub className="text-gray-500 mr-2" />
                {formData.github ? <a href={formData.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{formData.github}</a> : 'Not set'}
              </p>
            )}
          </div>

          {/* LinkedIn Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile</label>
            {isEditing ? (
              <div className="relative">
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  placeholder="e.g., https://linkedin.com/in/yourusername"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={loading}
                />
                {updatedFields.linkedin && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✔️</span>
                )}
              </div>
            ) : (
              <p className="px-3 py-2 bg-gray-50 rounded-md flex items-center">
                <FiLinkedin className="text-gray-500 mr-2" />
                {formData.linkedin ? <a href={formData.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{formData.linkedin}</a> : 'Not set'}
              </p>
            )}
          </div>

        </div>

      </form>

      <hr className="my-8 border-gray-200" />

      {/* Account Security Section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
          <FiShield className="mr-2" /> Account Security
        </h3>
        <div className="space-y-3">
          {/* Password Change */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
            <div className="flex items-center">
              <FiLock className="text-gray-500 mr-3" />
              <div>
                <h4 className="font-medium">Password</h4>
                <p className="text-sm text-gray-600">Change your account password.</p>
              </div>
            </div>
            <button
              className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
              onClick={() => setShowPasswordModal(true)}
              disabled={loading}
            >
              Change Password
            </button>
          </div>

          {/* Account Deletion */}
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-md border border-red-200">
            <div className="flex items-center">
              <FiAlertCircle className="text-red-500 mr-3" />
              <div>
                <h4 className="font-medium text-red-800">Danger Zone</h4>
                <p className="text-sm text-red-700">Permanently delete your account and all associated data.</p>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
              disabled={loading}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;
