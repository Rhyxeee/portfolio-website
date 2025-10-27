// Portfolio Data - YOUR REAL CONTENT
const projects = [
    {
        id: 1,
        title: "Sales Dashboard",
        description: "Sales Performance Analytics Dashboard (Excel)",
        fullDescription: "Analyzed sales data to build a dynamic Excel dashboard, identifying key revenue drivers and suggesting optimized discount strategies for an e-commerce platform.",
        icon: "bar-chart-3",
    },
    {
        id: 2,
        title: "Pima Dataset",
        description: "Pima Diabetes Dataset Preprocessing (JASP)",
        fullDescription: "Cleaned and prepared the Pima Diabetes dataset for statistical analysis using JASP, applying median imputation and removing outliers to ensure data integrity.",
        icon: "line-chart",
    },
    {
        id: 3,
        title: "Budget Audit",
        description: "Financial Audit & Budget Transparency (₱2M+)",
        fullDescription: "Audited a student government budget of over ₱2M, verifying transactions and creating transparent reports to enhance fiscal governance and accountability.",
        icon: "dollar-sign",
    },
    {
        id: 4,
        title: "Data Structuring",
        description: "Speech Segmentation & Genealogical Data Cleaning",
        fullDescription: "Structured multilingual genealogical records and segmented audio using Praat, significantly increasing dataset usability and reducing downstream processing time.",
        icon: "package",
    },
    {
        id: 5,
        title: "Future SQL Project",
        description: "Advanced database analytics",
        fullDescription: "A planned project showcasing advanced SQL queries to extract valuable insights from large, complex relational databases using joins, aggregation, and window functions.",
        icon: "database",
    },
    {
        id: 6,
        title: "Future Visualization Project",
        description: "Interactive business dashboard",
        fullDescription: "A future project to present business metrics and user-driven filters in an interactive dashboard built with tools like Tableau or Power BI.",
        icon: "trending-down",
    }
];

document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const projectsGrid = document.getElementById('projectsGrid');
    const scrollTopBtn = document.getElementById('scrollTop');
    const profileImage = document.getElementById('profileImage');
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.floating-nav .nav-item');
    const floatingNav = document.getElementById('floatingNav');
    const contactForm = document.getElementById('contact-form');

    // 1. Render Projects
    if (projectsGrid) {
        projects.forEach(project => {
            const card = document.createElement('article');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-visual">
                    <i data-lucide="${project.icon}"></i>
                </div>
                <h3 class="p-title">${project.title}</h3>
                <p class="p-desc">${project.description}</p>
                <div class="card-summary">
                    <div class="card-visual-hover"><i data-lucide="${project.icon}"></i></div>
                    <h3 class="summary-title">${project.title}</h3>
                    <p class="summary-desc">${project.fullDescription}</p>
                    <button class="view-project-btn">View Project</button>
                </div>
            `;
            projectsGrid.appendChild(card);
        });
    }

    // Set skill progress widths from data-progress attribute
    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach(item => {
        const progress = item.dataset.progress;
        const progressBar = item.querySelector('.skill-progress');
        if (progressBar) {
            progressBar.style.setProperty('--progress-width', `${progress}%`);
        }
    });
    

    // 2. Scroll Animations & Active Nav
    function handleScroll() {
        const scrollPosition = window.scrollY;

        // Section visibility animation
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.75 && !section.classList.contains('visible')) {
                section.classList.add('visible');
                
                // Animate skills only when the about section is visible
                if (section.id === 'about') {
                    section.querySelectorAll('.skill-item').forEach(skill => {
                        skill.classList.add('visible');
                    });
                }
            }

            // Update active nav item
            if (rect.top <= 150 && rect.bottom >= 150) {
                navItems.forEach(item => item.classList.remove('active'));
                const activeNav = document.querySelector(`.nav-item[data-section="${section.id}"]`);
                if (activeNav) activeNav.classList.add('active');
            }
        });

        // Scroll-to-top button visibility
        if (scrollTopBtn) {
            if (scrollPosition > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        }
    }

    // 3. Modal Handling
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.classList.add('body-no-scroll');
        }
    }

    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.classList.remove('body-no-scroll');
    }

    function openProjectModal(projectId) {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            document.getElementById('modalProjectTitle').textContent = project.title;
            document.getElementById('modalProjectDescription').textContent = project.fullDescription;
            openModal('projectModal');
        }
    }

    // 4. Event Listeners

    // Use event delegation for project cards
    if (projectsGrid) {
        projectsGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            if (card && projects.length > 0) {
                const projectIndex = Array.from(card.parentElement.children).indexOf(card);
                const project = projects[projectIndex];
                if (project) {
                    document.getElementById('modalProjectTitle').textContent = project.title;
                    document.getElementById('modalProjectDescription').textContent = project.fullDescription;
                    openModal('projectModal');
                }
            }
        });
    }

    // Navigation
    if (floatingNav) {
        floatingNav.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                e.preventDefault();
                const sectionId = navItem.getAttribute('href');
                document.querySelector(sectionId).scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Scroll to top
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Modals
    if (profileImage) profileImage.addEventListener('click', () => openModal('profileModal'));

    document.querySelectorAll('.modal-close').forEach(btn => btn.addEventListener('click', closeAllModals));
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeAllModals();
        });
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllModals();
    });

    // 5. Initializations
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Run on load to set initial states and animations
    
    // Initial render for all static icons on the page
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // ✅ CONTACT FORM - Complete Working Version
    if (contactForm) {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');
        
        // Validation function
        function validateField(input, errorId, validationFn) {
            const errorElement = document.getElementById(errorId);
            const value = input.value.trim();
            
            if (!value) {
                input.classList.add('error');
                input.classList.remove('success');
                if (errorElement) errorElement.textContent = 'Please fill out this field.';
                return false;
            }
            
            const errorMsg = validationFn ? validationFn(value) : null;
            if (errorMsg) {
                input.classList.add('error');
                input.classList.remove('success');
                if (errorElement) errorElement.textContent = errorMsg;
                return false;
            }
            
            input.classList.remove('error');
            input.classList.add('success');
            if (errorElement) errorElement.textContent = '';
            return true;
        }
        
        // Email validation
        function validateEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return 'Please enter a valid email address';
            }
            return null;
        }
        
        // Message validation
        function validateMessage(message) {
            if (message.length < 10) {
                return 'Message must be at least 10 characters';
            }
            return null;
        }
        
        // Real-time validation on blur
        if (nameInput) {
            nameInput.addEventListener('blur', () => {
                validateField(nameInput, 'name-error', null);
            });
            nameInput.addEventListener('input', () => {
                if (nameInput.classList.contains('error')) {
                    validateField(nameInput, 'name-error', null);
                }
            });
        }
        
        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                validateField(emailInput, 'email-error', validateEmail);
            });
            emailInput.addEventListener('input', () => {
                if (emailInput.classList.contains('error')) {
                    validateField(emailInput, 'email-error', validateEmail);
                }
            });
        }
        
        if (messageInput) {
            messageInput.addEventListener('blur', () => {
                validateField(messageInput, 'message-error', validateMessage);
            });
            messageInput.addEventListener('input', () => {
                if (messageInput.classList.contains('error')) {
                    validateField(messageInput, 'message-error', validateMessage);
                }
            });
        }

        // Form submission
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formStatus = document.getElementById('formStatus');
            const submitBtn = document.getElementById('formSubmitBtn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnSpinner = submitBtn.querySelector('.btn-spinner');

            // Clear previous status
            formStatus.textContent = '';
            formStatus.className = 'form-status';

            // Validate all fields
            const isNameValid = validateField(nameInput, 'name-error', null);
            const isEmailValid = validateField(emailInput, 'email-error', validateEmail);
            const isMessageValid = validateField(messageInput, 'message-error', validateMessage);

            if (!isNameValid || !isEmailValid || !isMessageValid) {
                formStatus.textContent = 'Please complete all required fields';
                formStatus.className = 'form-status error';

                // Find the first field with an error and scroll to it for better UX
                const firstErrorField = document.querySelector('.form-group .error');
                if (firstErrorField) {
                    firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstErrorField.focus({ preventScroll: true });
                }
                return;
            }

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const message = messageInput.value.trim();

            if (typeof emailjs === 'undefined') {
                console.error('EmailJS is not loaded');
                formStatus.textContent = 'The email service is currently unavailable. Please try again later.';
                formStatus.className = 'form-status error';
                return;
            }

            try {
                submitBtn.disabled = true;
                submitBtn.classList.add('loading');
                if (btnSpinner) {
                    btnSpinner.style.display = 'flex';  // Use flex, not block
                }

                // Generate timestamp
                const now = new Date();
                const time = now.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });

                // Create template parameters
                const templateParams = {
                    name: name,
                    from_email: email,
                    message: message,
                    time: time
                };

                // Send email
                const response = await emailjs.send(
                    'service_bof3lzf', 'template_6pcgvie',
                    templateParams
                );

                if (response.status === 200) {
                    formStatus.textContent = `Thanks, ${name}! Your message has been sent successfully. I'll get back to you soon.`;
                    formStatus.className = 'form-status success';
                    contactForm.reset();
                    
                    // Remove validation classes
                    [nameInput, emailInput, messageInput].forEach(input => {
                        input.classList.remove('success', 'error');
                    });

                    // Track with Google Analytics if available
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'form_submission', {
                            event_category: 'Contact',
                            event_label: 'Contact Form',
                            value: 1
                        });
                    }

                    setTimeout(() => {
                        formStatus.textContent = '';
                        formStatus.className = 'form-status';
                    }, 5000);
                } else {
                    throw new Error('Failed to send email');
                }

            } catch (error) {
                console.error('Failed to send email. Error: ', error);
                let userMessage = 'An error occurred. Please email me directly at markanthony.nene18@gmail.com';
                if (error.status === 412) {
                    userMessage = 'There was a problem with the request. Please check your input and try again.';
                } else if (error.text) {
                    userMessage = 'The email service is temporarily unavailable. Please try again later or email me directly.';
                }
                formStatus.textContent = userMessage;
                formStatus.className = 'form-status error';
                
                // Track error with Google Analytics if available
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_error', {
                        event_category: 'Contact',
                        event_label: 'Contact Form Error',
                        value: 0
                    });
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                if (btnSpinner) {
                    btnSpinner.style.display = 'none';
                }
            }
        });
    }
});
