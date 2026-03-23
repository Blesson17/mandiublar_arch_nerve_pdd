/**
 * ImplantAI Theme Manager
 * Handles global application of themes, accent colors, and display settings.
 */

(function () {
    // Run immediately to prevent flash of content
    initTheme();

    // Also run on DOMContentLoaded to ensure body classes are applied if script ran in head
    document.addEventListener('DOMContentLoaded', () => {
        applyBodyClasses();
    });

    function initTheme() {
        const savedTheme = localStorage.getItem('implantAI_theme') || 'light';
        const savedColor = localStorage.getItem('implantAI_accent') || '#2563EB';
        applyGlobalTheme(savedTheme, savedColor);
        applyBodyClasses();
    }

    function applyBodyClasses() {
        if (!document.body) return;

        // Compact Mode
        const compactState = localStorage.getItem('implantAI_compact');
        const isCompact = compactState === 'true'; // Default false
        if (isCompact) document.body.classList.add('compact-mode');
        else document.body.classList.remove('compact-mode');

        // Animations
        const animState = localStorage.getItem('implantAI_animations');
        const isAnimEnabled = animState === null ? true : (animState === 'true'); // Default true
        if (!isAnimEnabled) document.body.classList.add('no-animations');
        else document.body.classList.remove('no-animations');
    }

    function applyGlobalTheme(theme, accentColor) {
        let styleId = 'global-theme-styles';
        let style = document.getElementById(styleId);
        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            document.head.appendChild(style);
        }

        let css = `
            :root {
                --primary-color: ${accentColor};
                --accent-color: ${accentColor};
            }
            /* Global Accent Color Overrides */
            .nav-item.active { color: ${accentColor} !important; }
            .nav-item.active i { color: ${accentColor} !important; }
            .avatar-circle { background-color: ${accentColor} !important; }
            .logo-box { background-color: ${accentColor} !important; }
            
            /* Button & Interaction Colors */
            .btn-create, .submit-btn, .send-btn, .chat-widget-btn, .chat-header { 
                background-color: ${accentColor} !important; 
            }
            
            .new-case-btn {
                background-color: ${accentColor} !important;
            }

            .chip { color: ${accentColor} !important; background: ${lightenColor(accentColor, 90)} !important; }
            .chip:hover { background: ${lightenColor(accentColor, 80)} !important; }

            /* Animations Toggle */
            body.no-animations * { transition: none !important; animation: none !important; }

            /* Compact Mode */
            body.compact-mode .nav-item { padding: 0.5rem 1rem; }
            body.compact-mode .settings-nav-item { padding: 0.5rem 1rem; }
        `;

        if (theme === 'dark') {
            css += `
                body { background-color: #0F172A !important; color: #F1F5F9 !important; }
                
                /* Sidebar */
                .sidebar { background-color: #1E293B !important; border-right-color: #334155 !important; }
                .logo-text { color: #F1F5F9 !important; }
                .nav-item { color: #F1F5F9 !important; }
                .nav-item:hover { background-color: #334155 !important; color: white !important; }
                .nav-item.active { background-color: rgba(255, 255, 255, 0.1) !important; color: ${accentColor} !important; }
                .sign-out { color: #94A3B8 !important; }
                .sign-out:hover { color: white !important; }
                
                /* Profile & Text */
                .user-profile h4, .profile-info h4 { color: white !important; }
                .user-profile p, .profile-info p { color: #94A3B8 !important; }
                
                /* Main Content Areas */
                .page-header h1 { color: white !important; }
                .settings-group-title { color: #F1F5F9 !important; }
                
                /* Cards & Containers */
                .settings-card, .table-card, .info-card, .stat-card, .modal-card, .chat-window { 
                    background-color: #1E293B !important; 
                    border-color: #334155 !important;
                    color: #F1F5F9 !important;
                }
                
                /* Inputs & Forms */
                .search-container input, .form-input, .chat-input, .input-container { 
                    background-color: #0F172A !important; 
                    border-color: #334155 !important; 
                    color: white !important; 
                }
                
                /* Table Specifics */
                .table-header th { color: #94A3B8 !important; }
                .table-row td { background-color: #1E293B !important; border-top: 1px solid #334155 !important; color: #F1F5F9 !important; }
                .patient-name { color: #F1F5F9 !important; }
                
                /* Settings Specifics */
                .settings-nav-item { color: #94A3B8 !important; }
                .settings-nav-item:hover { background-color: #334155 !important; color: white !important; }
                .settings-nav-item.active { background-color: rgba(255, 255, 255, 0.1) !important; color: ${accentColor} !important; }
                .card-title, .section-header { color: white !important; }
                .toggle-info h5, .perm-info h5, .feature-content h5 { color: white !important; }
                .toggle-info p, .perm-info p, .feature-content p { color: #94A3B8 !important; }
                
                /* Chat Specifics */
                .chat-body, .input-container { background-color: #1E293B !important; }
                .chat-message .message-content { color: #F1F5F9 !important; }
                
                /* Misc */
                /* My Profile Specifics */
                .profile-hero-card { background-color: #1E293B !important; border-color: #334155 !important; }
                .profile-name, .hero-body h2 { color: white !important; }
                .profile-role, .hero-body p { color: #94A3B8 !important; }
                .photo-btn { background-color: #0F172A !important; border-color: #334155 !important; color: white !important; }
                .edit-btn-float { color: #CBD5E1 !important; }
                
                .info-card, .stat-card { background-color: #1E293B !important; border: 1px solid #334155 !important; }
                .info-dets h5, .stat-label { color: #94A3B8 !important; }
                .info-dets p, .stat-value { color: white !important; }
                
                /* Icon Boxes in Profile */
                .icon-blue { background-color: rgba(37, 99, 235, 0.2) !important; color: #60A5FA !important; }
                .icon-green { background-color: rgba(16, 185, 129, 0.2) !important; color: #34D399 !important; }
                .icon-yellow { background-color: rgba(245, 158, 11, 0.2) !important; color: #FBBF24 !important; }
                
                /* Edit Profile Inputs */
                #profile-name-input, #email-input, #phone-input, #address-input { 
                    background-color: #0F172A !important; 
                    border-color: #334155 !important; 
                    color: white !important; 
                }
                
                /* Billing & Plans Specifics */
                .billing-card, .plan-card, .payment-method-card { background-color: #1E293B !important; border-color: #334155 !important; color: white !important; }
                .plan-price .amount { color: white !important; }
                .plan-price .period { color: #94A3B8 !important; }
                .feature-list li { color: #CBD5E1 !important; }
                
                /* Team Members Specifics */
                .member-card { background-color: #1E293B !important; border-color: #334155 !important; }
                .member-info h4 { color: white !important; }
                .member-info p { color: #94A3B8 !important; }
                .role-badge { background-color: rgba(37, 99, 235, 0.2) !important; color: #60A5FA !important; }
                
                /* Notifications Specifics */
                .notification-item { background-color: #1E293B !important; border-bottom-color: #334155 !important; }
                .notification-content h4 { color: white !important; }
                .notification-content p { color: #94A3B8 !important; }
                .notification-time { color: #64748B !important; }
                
                /* Help & About */
                .faq-item, .contact-card { background-color: #1E293B !important; border-color: #334155 !important; }
                .faq-question { color: white !important; }
                .faq-answer { color: #CBD5E1 !important; }

                /* Common Text Adjustments */
                h1, h2, h3, h4, h5, h6 { color: white !important; }
                p, span, div { color: inherit; } /* Let inheritance handle most, override specifics below */
                p { color: #CBD5E1; }
                
                /* Re-enforce white text for specific inputs/elements */
                .profile-name { color: white !important; } 

                /* Language & Region Specifics */
                .label-main { color: white !important; }
                .label-desc { color: #94A3B8 !important; }
                .select-input { 
                    background-color: #0F172A !important; 
                    border-color: #334155 !important; 
                    color: white !important; 
                }

                /* Integrations Specifics */
                .service-dets h4 { color: white !important; }
                .service-dets p { color: #94A3B8 !important; }
                .connect-row { border-bottom-color: #334155 !important; }
                .connect-link { color: #60A5FA !important; }
                .connect-link:hover { color: #93C5FD !important; }

                .api-key-box { background-color: #0F172A !important; border: 1px solid #334155 !important; }
                .key-input { 
                    background-color: #1E293B !important; 
                    border-color: #334155 !important; 
                    color: white !important; 
                }
                .key-action-btn { 
                    background-color: #1E293B !important; 
                    border-color: #334155 !important; 
                    color: white !important; 
                }
                .key-action-btn:hover { background-color: #334155 !important; }

                /* Help & Support Specifics */
                .doc-item { border-bottom-color: #334155 !important; }
                .doc-label { color: white !important; }
                .doc-icon { color: #94A3B8 !important; }
                .doc-icon:hover { color: ${accentColor} !important; }
                .support-text { color: #CBD5E1 !important; }
                .live-chat-link { color: #60A5FA !important; }
                .live-chat-link:hover { color: #93C5FD !important; }

                /* Upload Page Specifics (Refined) */
                .upload-card { background-color: #1E293B !important; border-color: #334155 !important; }
                .upload-card:hover { background-color: #334155 !important; border-color: ${accentColor} !important; }
                .card-title, .card-desc { color: white !important; }
                .upload-icon { color: ${accentColor} !important; }
                .helper-text { color: #94A3B8 !important; }
                .supported-text { color: #94A3B8 !important; }
                .supported-item { color: #94A3B8 !important; }

                /* Analysis Page Specifics */
                .start-card-container, .right-panel { background-color: #1E293B !important; border-color: #334155 !important; }
                .start-title { color: white !important; }
                .start-desc { color: #94A3B8 !important; }
                .brain-icon-circle { background-color: rgba(37, 99, 235, 0.2) !important; color: #60A5FA !important; }
                .will-perform-box { background-color: #0F172A !important; border: 1px solid #334155 !important; }
                .will-perform-title { color: white !important; }
                .perform-item { color: #CBD5E1 !important; }
                .perform-item i { color: #64748B !important; }
                
                .panel-header { color: white !important; }
                .tasks-title { color: white !important; }
                .task-content h4 { color: white !important; }
                .task-content p { color: #94A3B8 !important; }
                
                .metric-card { background-color: #1E293B !important; border-color: #334155 !important; }
                .metric-title { color: #94A3B8 !important; }
                .metric-value { color: white !important; }
                
                /* Report Page Specifics */
                .report-container { background-color: #1E293B !important; color: #F1F5F9 !important; }
                .report-content .card { background-color: #0F172A !important; border-color: #334155 !important; }
                .section-title { color: white !important; }
                .measure-item { background-color: #1E293B !important; border: 1px solid #334155 !important; }
                .measure-label { color: #94A3B8 !important; }
                .measure-value { color: white !important; }
                .info-label { color: #94A3B8 !important; }
                .info-value { color: white !important; }
                .action-bar { background-color: #1E293B !important; border-bottom-color: #334155 !important; }
                .back-btn { color: #94A3B8 !important; }
                .back-btn:hover { color: white !important; }
                .disclaimer-box { border-top-color: #334155 !important; color: #64748B !important; }

                
                /* About Page Specifics */
                .app-name { color: white !important; }
                .app-tagline { color: #94A3B8 !important; }
                .sys-label { color: #94A3B8 !important; }
                .sys-value { color: white !important; }
                .legal-label { color: white !important; }
                .legal-icon { color: #94A3B8 !important; }
                .legal-item { border-bottom-color: #334155 !important; }
                .copyright { color: #64748B !important; }
                .check-icon { color: #10B981 !important; } 

                /* Integration Icons */
                .icon-db { background-color: rgba(37, 99, 235, 0.2) !important; color: #60A5FA !important; }
                .icon-scan { background-color: rgba(22, 163, 74, 0.2) !important; color: #4ADE80 !important; }
                .icon-cad { background-color: rgba(147, 51, 234, 0.2) !important; color: #C084FC !important; }
                .icon-mail { background-color: rgba(234, 88, 12, 0.2) !important; color: #FB923C !important; } 
            `;
        }

        style.innerHTML = css;
    }

    function loadUserProfile() {
        // Try getting from LocalStorage (set during Login)
        const storedName = localStorage.getItem('implantAI_userName');
        const storedRole = localStorage.getItem('implantAI_userRole');
        const storedInitials = localStorage.getItem('implantAI_userInitials');

        if (storedName) {
            const nameEls = document.querySelectorAll('.profile-info h4, .user-profile h4');
            nameEls.forEach(el => el.innerText = storedName);
        }

        if (storedRole) {
            const roleEls = document.querySelectorAll('.profile-info p, .user-profile p');
            roleEls.forEach(el => el.innerText = storedRole.length < 20 ? storedRole : 'User');
        }

        if (storedInitials) {
            const avatars = document.querySelectorAll('.avatar-circle');
            avatars.forEach(el => el.innerText = storedInitials);
        }
    }

    // Helper to lighten color for chips background
    function lightenColor(color, percent) {
        var num = parseInt(color.replace("#", ""), 16),
            amt = Math.round(2.55 * percent),
            R = (num >> 16) + amt,
            B = ((num >> 8) & 0x00FF) + amt,
            G = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
    }

    // Expose for updates
    window.updateTheme = function () {
        initTheme();
    };

    // Load profile on start
    loadUserProfile();

})();
