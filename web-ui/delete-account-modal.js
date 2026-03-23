/**
 * Delete Account Modal Handler
 * Manages the delete account confirmation modal across all settings pages
 */

(function () {
    'use strict';

    // Create and inject modal HTML
    function createDeleteModal() {
        const modalHTML = `
            <div id="deleteAccountModal" class="delete-modal-overlay" style="display: none;">
                <div class="delete-modal-container">
                    <div class="delete-modal-header">
                        <h2>Delete Account</h2>
                        <button class="modal-close-btn" onclick="closeDeleteModal()">
                            <i class="ph ph-x"></i>
                        </button>
                    </div>

                    <div class="delete-modal-body">
                        <!-- Danger Zone Warning -->
                        <div class="danger-warning-box">
                            <i class="ph-fill ph-warning-circle"></i>
                            <div class="danger-warning-content">
                                <h3>Danger Zone</h3>
                                <p>Deleting your account is permanent and cannot be undone. All your data, cases, and settings will be permanently removed.</p>
                            </div>
                        </div>

                        <!-- What will be deleted -->
                        <div class="delete-section">
                            <h3 class="delete-section-title">What will be deleted</h3>
                            <div class="delete-items-list">
                                <div class="delete-item">
                                    <i class="ph-fill ph-folder-open"></i>
                                    <div class="delete-item-content">
                                        <h4>All patient cases and CBCT scans</h4>
                                        <p>Including analysis results and reports</p>
                                    </div>
                                </div>
                                <div class="delete-item">
                                    <i class="ph-fill ph-user-circle"></i>
                                    <div class="delete-item-content">
                                        <h4>Your profile and account settings</h4>
                                        <p>Including preferences and integrations</p>
                                    </div>
                                </div>
                                <div class="delete-item">
                                    <i class="ph-fill ph-users-three"></i>
                                    <div class="delete-item-content">
                                        <h4>Team access and permissions</h4>
                                        <p>Team members will lose access to shared cases</p>
                                    </div>
                                </div>
                                <div class="delete-item">
                                    <i class="ph-fill ph-credit-card"></i>
                                    <div class="delete-item-content">
                                        <h4>Billing history and subscription</h4>
                                        <p>Your subscription will be canceled immediately</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Account to be deleted -->
                        <div class="delete-section">
                            <h3 class="delete-section-title">Account to be deleted</h3>
                            <div class="account-preview-card">
                                <div class="account-preview-avatar">SW</div>
                                <div class="account-preview-info">
                                    <h4 id="modal-account-name">Dr. Sarah Wilson</h4>
                                    <p>dr.wilson@advanceddentalcare.com</p>
                                    <p class="account-meta">Member since January 2022 • Professional Plan</p>
                                </div>
                            </div>
                        </div>

                        <!-- Permanently delete account -->
                        <div class="delete-section">
                            <h3 class="delete-section-title">Permanently delete account</h3>
                            <p class="delete-warning-text">Once you delete your account, there is no going back. Please be certain before proceeding.</p>
                            <button class="delete-confirm-btn" onclick="confirmDeleteAccount()">
                                <i class="ph-fill ph-trash"></i>
                                Delete My Account
                            </button>
                        </div>

                        <!-- Before you go -->
                        <div class="delete-section">
                            <h3 class="delete-section-title">Before you go...</h3>
                            <p class="help-text">If you're having issues with ImplantAI, we'd love to help. Consider these alternatives:</p>
                            <div class="alternative-actions">
                                <button class="alt-action-btn" onclick="window.location.href='settings-help.html'">
                                    <i class="ph ph-lifebuoy"></i>
                                    Contact Support
                                </button>
                                <button class="alt-action-btn" onclick="window.location.href='settings-billing.html'">
                                    <i class="ph ph-credit-card"></i>
                                    Change Plan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Open modal
    window.openDeleteModal = function () {
        const modal = document.getElementById('deleteAccountModal');
        if (modal) {
            // Update account name if saved
            const savedName = localStorage.getItem('implantAI_userName');
            if (savedName) {
                const nameElement = document.getElementById('modal-account-name');
                if (nameElement) nameElement.textContent = savedName;
            }

            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    };

    // Close modal
    window.closeDeleteModal = function () {
        const modal = document.getElementById('deleteAccountModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };

    // Confirm delete (placeholder - would connect to backend)
    window.confirmDeleteAccount = function () {
        if (confirm('Are you absolutely sure? This action cannot be undone.')) {
            // In a real app, this would call an API to delete the account
            alert('Account deletion would be processed here. Redirecting to login...');
            window.location.href = 'index.html';
        }
    };

    // Close modal when clicking outside
    document.addEventListener('click', function (e) {
        const modal = document.getElementById('deleteAccountModal');
        if (e.target === modal) {
            closeDeleteModal();
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeDeleteModal();
        }
    });

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createDeleteModal);
    } else {
        createDeleteModal();
    }

    // Attach click handlers to all delete account links
    document.addEventListener('DOMContentLoaded', function () {
        const deleteLinks = document.querySelectorAll('.delete-account');
        deleteLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                openDeleteModal();
            });
        });
    });

})();
