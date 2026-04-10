document.addEventListener('DOMContentLoaded', () => {
    const matrixContainer = document.getElementById('unit-matrix');
    
    // Initialize Bootstrap Modals
    const bsModalElement = document.getElementById('quotationModal');
    const quotationModal = new bootstrap.Modal(bsModalElement, {
        backdrop: 'static'
    });
    
    const bsAddCustModal = document.getElementById('addCustomerModal');
    const addCustModal = bsAddCustModal ? new bootstrap.Modal(bsAddCustModal) : null;

    const bsEditCustModal = document.getElementById('editCustomerModal');
    const editCustModal = bsEditCustModal ? new bootstrap.Modal(bsEditCustModal) : null;

    const bsBookingModal = document.getElementById('bookingDetailModal');
    const bookingModal = bsBookingModal ? new bootstrap.Modal(bsBookingModal) : null;

    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // update UI
            langBtns.forEach(b => b.classList.remove('active'));
            const lang = e.target.dataset.lang;
            
            document.querySelectorAll(`.lang-btn[data-lang="${lang}"]`).forEach(b => b.classList.add('active'));

            // toggle class on body
            if (lang === 'en') {
                document.body.classList.add('lang-en');
                document.querySelector('.lang-toggle-mini').innerText = 'EN';
            } else {
                document.body.classList.remove('lang-en');
                document.querySelector('.lang-toggle-mini').innerText = 'TH';
            }
        });
    });

    const langToggleMini = document.querySelector('.lang-toggle-mini');
    if (langToggleMini) {
        langToggleMini.addEventListener('click', () => {
            const isEn = document.body.classList.contains('lang-en');
            const targetLang = isEn ? 'th' : 'en';
            const btnArr = Array.from(langBtns);
            const targetBtn = btnArr.find(b => b.dataset.lang === targetLang);
            if (targetBtn) targetBtn.click();
        });
    }

    // Sidebar Toggle Logic
    const sidebar = document.getElementById('sidebar');
    const mainContainer = document.getElementById('app-main-container');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const mobileToggleBtn = document.getElementById('mobile-sidebar-toggle');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('expanded');
            if(window.innerWidth >= 768) {
                mainContainer.classList.toggle('expanded');
            }
        });
    }

    if (mobileToggleBtn) {
        mobileToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
        });
    }

    // Close sidebar on mobile when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth < 768 && sidebar && sidebar.classList.contains('mobile-open')) {
            if (!sidebar.contains(e.target) && !mobileToggleBtn.contains(e.target)) {
                sidebar.classList.remove('mobile-open');
            }
        }
    });

    // Project & Building Data Configuration
    const estateData = {
        'spr': {
            buildings: {
                'A': { label: 'Building A (North Wing)', floors: 8, unitsPerFloor: 12, basePrice: 3000000, priceStep: 150000 },
                'B': { label: 'Building B (South Wing)', floors: 12, unitsPerFloor: 10, basePrice: 2500000, priceStep: 100000 },
                'C': { label: 'Building C (East Wing)', floors: 5, unitsPerFloor: 16, basePrice: 4000000, priceStep: 250000 }
            }
        },
        'view': {
            buildings: {
                'X': { label: 'Tower X (River View)', floors: 15, unitsPerFloor: 6, basePrice: 5000000, priceStep: 300000 },
                'Y': { label: 'Tower Y (City View)', floors: 10, unitsPerFloor: 8, basePrice: 4500000, priceStep: 250000 }
            }
        }
    };

    let currentStats = { total: 0, avail: 0, booked: 0, sold: 0, locked: 0 };
    let currentProjectKey = 'spr';
    let currentBuildingKey = 'A';
    let currentFilter = 'all';

    const projectSelect = document.getElementById('project-select');
    const buildingSelect = document.getElementById('building-select');

    function populateBuildings() {
        buildingSelect.innerHTML = '';
        const bldgs = estateData[currentProjectKey].buildings;
        for (const [key, bldg] of Object.entries(bldgs)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = bldg.label;
            buildingSelect.appendChild(option);
        }
        // Auto-select first building
        currentBuildingKey = Object.keys(bldgs)[0];
        buildingSelect.value = currentBuildingKey;
    }

    // Generate Matrix Function
    function renderMatrix() {
        matrixContainer.innerHTML = ''; // Clear existing
        currentStats = { total: 0, avail: 0, booked: 0, sold: 0, locked: 0 };
        
        const data = estateData[currentProjectKey].buildings[currentBuildingKey];

        for (let f = 1; f <= data.floors; f++) {
            const floorRow = document.createElement('div');
            // Reduced margin and padding for density
            floorRow.className = 'floor-row d-flex align-items-start mb-2 w-100 pb-2 border-bottom border-secondary border-opacity-10';
            
            const floorLabel = document.createElement('div');
            floorLabel.className = 'unit-row-label me-2 font-thai small';
            // Bilingual floor label
            floorLabel.innerHTML = `<span class="text-th">ชั้น ${f}</span><span class="text-en">Fl ${f}</span>`;
            floorRow.appendChild(floorLabel);

            const unitsContainer = document.createElement('div');
            // Replaced overflow with flex-wrap and reduced padding/gap
            unitsContainer.className = 'd-flex gap-1 flex-wrap py-1 pe-2 floor-units-container';
            unitsContainer.style.flex = "1";

            const mockTypes = ['A1', 'B1A', 'C2A', 'B2'];
            for (let u = 1; u <= data.unitsPerFloor; u++) {
                const unitBox = document.createElement('div');
                const unitNo = `${currentBuildingKey}${f}${u.toString().padStart(2, '0')}`;
                const price = data.basePrice + (f * data.priceStep);
                
                // Determine mock UnitType
                const unitType = mockTypes[u % mockTypes.length];

                // Random Status Logic
                let status = 'avail';
                const rand = Math.random();
                if (rand > 0.90) status = 'sold';
                else if (rand > 0.80) status = 'locked';
                else if (rand > 0.65) status = 'booked';

                currentStats[status]++;
                currentStats.total++;

                unitBox.className = `flex-shrink-0 unit-box status-${status}`;
                unitBox.dataset.unit = unitNo;
                unitBox.dataset.status = status;
                unitBox.dataset.floor = f;
                unitBox.dataset.price = price;
                unitBox.dataset.type = unitType;
                
                unitBox.innerHTML = `
                    <div class="u-no">${unitNo}</div>
                    <div class="u-price">${unitType}</div>
                    ${status === 'locked' ? '<div class="lock-icon-overlay"><i class="bi bi-lock-fill"></i></div>' : ''}
                `;

                if (status === 'avail') {
                    unitBox.addEventListener('click', () => openQuotationModal(unitNo, f, price, unitType, unitBox));
                } else if (status === 'locked') {
                    unitBox.addEventListener('click', () => unlockUnitPrompt(unitBox, unitNo));
                }

                unitsContainer.appendChild(unitBox);
            }

            floorRow.appendChild(unitsContainer);
            matrixContainer.appendChild(floorRow);
        }

        updateDashboardStats();
        applyCurrentFilter(); // Re-apply filter on new data
    }

    function updateDashboardStats() {
        document.getElementById('stat-total').textContent = currentStats.total;
        document.getElementById('stat-avail').textContent = currentStats.avail;
        document.getElementById('stat-booked').textContent = currentStats.booked;
        document.getElementById('stat-locked').textContent = currentStats.locked;
        document.getElementById('stat-sold').textContent = currentStats.sold;
    }

    // Initial Render
    populateBuildings();
    renderMatrix();

    // Event Listeners
    projectSelect.addEventListener('change', (e) => {
        currentProjectKey = e.target.value;
        populateBuildings();
        renderMatrix();
    });

    buildingSelect.addEventListener('change', (e) => {
        currentBuildingKey = e.target.value;
        renderMatrix();
    });

    const priceSelect = document.getElementById('price-select');
    if (priceSelect) {
        priceSelect.addEventListener('change', () => {
            applyCurrentFilter();
        });
    }

    // --- Modal Logic ---
    const btnLockUnit = document.getElementById('btn-lock-unit');
    const btnCreateQuote = document.getElementById('btn-create-quote');
    const btnProceedBook = document.getElementById('btn-proceed-book');
    const customerSelect = document.getElementById('customer-select');
    let selectedUnitBoxRef = null;

    function openQuotationModal(unitNo, floor, price, unitType, elementBox) {
        // Set Data
        document.getElementById('modal-unit-no').textContent = unitNo;
        document.getElementById('modal-floor').textContent = floor;
        document.getElementById('modal-type').textContent = unitType;
        document.getElementById('modal-price').textContent = price.toLocaleString();

        const contractFee = 150000; // Mock fixed contract fee
        const promotionDiscount = 100000; // Mock fixed promotion discount
        const netPrice = price - promotionDiscount;

        document.getElementById('calc-contract').textContent = `฿ ${contractFee.toLocaleString()}`;
        document.getElementById('calc-promo').textContent = `- ฿ ${promotionDiscount.toLocaleString()}`;
        document.getElementById('calc-net').textContent = `฿ ${netPrice.toLocaleString()}`;

        // Reset Form
        customerSelect.value = '';
        selectedUnitBoxRef = elementBox;

        // Show
        quotationModal.show();
    }

    // Lock Flow
    if (btnLockUnit) {
        btnLockUnit.addEventListener('click', () => {
            if (selectedUnitBoxRef) {
                const unitNo = document.getElementById('modal-unit-no').textContent;
                lockUnit(selectedUnitBoxRef, unitNo);
                quotationModal.hide();
            }
        });
    }

    window.lockUnit = function(unitBox, unitNo) {
        unitBox.className = 'flex-shrink-0 unit-box status-locked';
        unitBox.dataset.status = 'locked';
        unitBox.innerHTML = `
            <div class="u-no">${unitNo}</div>
            <div class="u-price">${unitBox.dataset.type}</div>
            <div class="lock-icon-overlay"><i class="bi bi-lock-fill"></i></div>
        `;
        
        // Remove old listeners by cloning
        const newBox = unitBox.cloneNode(true);
        unitBox.parentNode.replaceChild(newBox, unitBox);
        
        // Add unlock listener
        newBox.addEventListener('click', () => unlockUnitPrompt(newBox, unitNo));
        
        // Update Stats
        currentStats.avail--;
        currentStats.locked++;
        updateDashboardStats();
        applyCurrentFilter();
    };

    window.unlockUnitPrompt = function(unitBox, unitNo) {
        if (confirm(`คุณต้องการปลดล็อคห้อง ${unitNo} ให้กลับมาเป็นห้องว่างใช่หรือไม่?\n(Do you want to unlock this unit?)`)) {
            unitBox.className = 'flex-shrink-0 unit-box status-avail';
            unitBox.dataset.status = 'avail';
            
            // Remove lock icon
            const lockIcon = unitBox.querySelector('.lock-icon-overlay');
            if (lockIcon) lockIcon.remove();
            
            // Reassign listener
            const newBox = unitBox.cloneNode(true);
            unitBox.parentNode.replaceChild(newBox, unitBox);
            
            const floor = parseInt(newBox.dataset.floor);
            const price = parseInt(newBox.dataset.price);
            const type = newBox.dataset.type;
            
            newBox.addEventListener('click', () => openQuotationModal(unitNo, floor, price, type, newBox));

            // Update stats
            currentStats.avail++;
            currentStats.locked--;
            updateDashboardStats();
            applyCurrentFilter();
        }
    }

    // Quotation Flow
    btnCreateQuote.addEventListener('click', () => {
        if (!customerSelect.value) {
            alert("กรุณาเลือกลูกค้าเพื่อทำใบเสนอราคา (Please select a customer)");
            return;
        }
        alert("ทำใบเสนอราคาสำเร็จ! (Quotation Created)");
    });

    // Booking Flow
    btnProceedBook.addEventListener('click', () => {
        if (!customerSelect.value) {
            alert("กรุณาเลือกลูกค้าก่อนทำการจองห้อง (Please select a customer)");
            return;
        }
        alert("จองห้องสำเร็จ (Unit Booked!)");
        const dateStr = new Date().toLocaleDateString('th-TH');
        const bkId = 'BK-' + Math.floor(100 + Math.random() * 900);
        const unitNo = document.getElementById('modal-unit-no').textContent;
        const priceText = document.getElementById('modal-price').textContent.replace(/[^0-9]/g, '');
        const netText = document.getElementById('calc-net').textContent.replace(/[^0-9]/g, '');
        const contractText = document.getElementById('calc-contract').textContent.replace(/[^0-9]/g, '');
        const discountText = document.getElementById('calc-promo').textContent.replace(/[^0-9]/g, '');
        
        mockBookings.push({
            id: bkId,
            date: dateStr,
            unit: unitNo,
            customer: customerSelect.value,
            price: parseInt(priceText),
            reservationFee: 50000,
            contractFee: parseInt(contractText),
            discount: parseInt(discountText),
            netPrice: parseInt(netText),
            status: 'Active'
        });
        renderBookingsTable();

        if (selectedUnitBoxRef) {
            selectedUnitBoxRef.className = 'flex-shrink-0 unit-box status-booked';
            selectedUnitBoxRef.dataset.status = 'booked';
            
            // Remove Event Listener by replacing node
            const newBox = selectedUnitBoxRef.cloneNode(true);
            selectedUnitBoxRef.parentNode.replaceChild(newBox, selectedUnitBoxRef);
            
            // Re-calc Stats
            currentStats.avail--;
            currentStats.booked++;
            updateDashboardStats();
            applyCurrentFilter(); // Keep the current filter respected after booking
        }
        quotationModal.hide();
    });

    // --- Add Customer Logic ---
    const btnAddCustomer = document.getElementById('btn-add-customer');
    const btnSaveCustomer = document.getElementById('btn-save-customer');
    const customerDatalist = document.getElementById('customer-datalist');
    const formCustFirstName = document.getElementById('custFirstName');
    const formCustLastName = document.getElementById('custLastName');
    const formCustPhone = document.getElementById('custPhone');
    const formCustEmail = document.getElementById('custEmail');

    if (btnAddCustomer && addCustModal) {
        btnAddCustomer.addEventListener('click', () => {
            formCustFirstName.value = '';
            formCustLastName.value = '';
            formCustPhone.value = '';
            formCustEmail.value = '';
            addCustModal.show();
        });
    }

    if (btnSaveCustomer && customerDatalist) {
        btnSaveCustomer.addEventListener('click', () => {
            const firstName = formCustFirstName.value.trim();
            const lastName = formCustLastName.value.trim();
            const phone = formCustPhone.value.trim();
            const email = formCustEmail.value.trim();
            
            if (!firstName || !lastName || !phone) {
                // Ensure proper language support if toggle is implemented for alerts
                alert(document.body.classList.contains('lang-en') 
                      ? "Please enter first name, last name, and phone number." 
                      : "กรุณากรอกชื่อ นามสกุล และเบอร์โทรศัพท์ให้ครบถ้วน");
                return;
            }

            const newCustomerLabel = `${firstName} ${lastName} (${phone})`;
            
            const option = document.createElement('option');
            option.value = newCustomerLabel;
            customerDatalist.appendChild(option);

            // Update select input
            if (customerSelect) {
                customerSelect.value = newCustomerLabel;
            }

            // Save to mock database
            mockCustomers.push({
                id: 'C' + Date.now(),
                firstName: firstName,
                lastName: lastName,
                phone: phone,
                email: email
            });
            renderCustomersTable();
            
            addCustModal.hide();
        });
    }

    // --- Filter Logic ---
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update Active State
            filterBtns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');

            currentFilter = e.currentTarget.dataset.filter;
            applyCurrentFilter();
        });
    });

    function applyCurrentFilter() {
        const allUnits = document.querySelectorAll('.unit-box');
        const allFloorRows = document.querySelectorAll('.floor-row');
        const priceSelectElement = document.getElementById('price-select');
        const priceFilterValue = priceSelectElement ? priceSelectElement.value : 'all';

        allUnits.forEach(unit => {
            const statusMatch = currentFilter === 'all' || 
                            unit.dataset.status === currentFilter || 
                            (currentFilter === 'sold' && unit.dataset.status === 'locked');
            
            let priceMatch = true;
            if (priceFilterValue !== 'all') {
                const price = parseInt(unit.dataset.price);
                if (priceFilterValue === 'lt3m' && price >= 3000000) priceMatch = false;
                else if (priceFilterValue === '3m-5m' && (price < 3000000 || price > 5000000)) priceMatch = false;
                else if (priceFilterValue === 'gt5m' && price <= 5000000) priceMatch = false;
            }

            const isMatch = statusMatch && priceMatch;
                            
            if (isMatch) {
                unit.classList.remove('d-none');
                unit.classList.add('d-flex');
            } else {
                unit.classList.remove('d-flex');
                unit.classList.add('d-none');
            }
        });

        // Hide Floors logically if no units match
        allFloorRows.forEach(row => {
            const visibleUnitsInRow = row.querySelectorAll('.unit-box:not(.d-none)');
            if (visibleUnitsInRow.length === 0) {
                row.classList.add('d-none');
                row.classList.remove('d-flex');
            } else {
                row.classList.remove('d-none');
                row.classList.add('d-flex');
            }
        });
    }

    // ==========================================
    // NEW SPA & CRUD LOGIC
    // ==========================================

    // --- SPA View Navigation ---
    const navBtns = document.querySelectorAll('.nav-view-btn');
    const appViews = document.querySelectorAll('.app-view');

    function switchView(targetId) {
        // Hide all
        appViews.forEach(view => {
            view.classList.remove('d-block');
            view.classList.add('d-none');
        });
        
        // Show target
        const targetView = document.getElementById(targetId);
        if (targetView) {
            targetView.classList.remove('d-none');
            targetView.classList.add('d-block');
        }

        // Update Nav Styling
        navBtns.forEach(btn => {
            btn.classList.remove('active');
            if (!btn.classList.contains('bg-light')) {
                btn.classList.add('text-secondary');
            }
            if (btn.dataset.target === targetId) {
                btn.classList.add('active');
                if (!btn.classList.contains('bg-light')) {
                    btn.classList.remove('text-secondary');
                }
            }
        });
    }

    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(e.currentTarget.dataset.target);
        });
    });

    // Buttons that switch views directly
    const btnBackToMatrix = document.getElementById('btn-back-to-matrix');
    if (btnBackToMatrix) {
        btnBackToMatrix.addEventListener('click', () => switchView('view-matrix'));
    }

    // --- Customer CRUD Logic ---
    let mockCustomers = [
        { id: 'C001', firstName: 'สมชาย', lastName: 'ใจดี', phone: '081-123-4567', email: 'somchai@mail.com' },
        { id: 'C002', firstName: 'มณี', lastName: 'มีทรัพย์', phone: '089-987-6543', email: 'manee@mail.com' }
    ];

    const btnAddCustomerMain = document.getElementById('btn-add-customer-main');
    if (btnAddCustomerMain && addCustModal) {
        btnAddCustomerMain.addEventListener('click', () => {
            formCustFirstName.value = '';
            formCustLastName.value = '';
            formCustPhone.value = '';
            formCustEmail.value = '';
            addCustModal.show();
        });
    }

    function renderCustomersTable() {
        const tbody = document.getElementById('customers-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        mockCustomers.forEach(cust => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="ps-4 fw-medium">${cust.firstName} ${cust.lastName}</td>
                <td>${cust.phone}</td>
                <td>${cust.email || '-'}</td>
                <td class="pe-4">
                    <div class="d-flex justify-content-end gap-1 flex-nowrap">
                        <button class="btn btn-sm btn-outline-primary rounded-pill px-3 shadow-sm fw-medium" onclick="openEditCustomer('${cust.id}')">
                            <i class="bi bi-pencil-square"></i> <span class="d-none d-md-inline"><span class="text-th">แก้ไข</span><span class="text-en">Edit</span></span>
                        </button>
                        <button class="btn btn-sm btn-outline-danger rounded-pill px-3 shadow-sm fw-medium" onclick="deleteCustomer('${cust.id}')">
                            <i class="bi bi-trash3"></i> <span class="d-none d-md-inline"><span class="text-th">ลบ</span><span class="text-en">Delete</span></span>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.deleteCustomer = function(id) {
        if (confirm('คุณต้องการลบข้อมูลลูกค้านี้ใช่หรือไม่?')) {
            mockCustomers = mockCustomers.filter(c => c.id !== id);
            renderCustomersTable();
        }
    };

    window.openEditCustomer = function(id) {
        const cust = mockCustomers.find(c => c.id === id);
        if (cust) {
            document.getElementById('editCustId').value = cust.id;
            document.getElementById('editCustFirstName').value = cust.firstName;
            document.getElementById('editCustLastName').value = cust.lastName;
            document.getElementById('editCustPhone').value = cust.phone;
            document.getElementById('editCustEmail').value = cust.email || '';
            if (editCustModal) editCustModal.show();
        }
    };

    const btnUpdateCustomer = document.getElementById('btn-update-customer');
    if (btnUpdateCustomer) {
        btnUpdateCustomer.addEventListener('click', () => {
            const id = document.getElementById('editCustId').value;
            const firstName = document.getElementById('editCustFirstName').value.trim();
            const lastName = document.getElementById('editCustLastName').value.trim();
            const phone = document.getElementById('editCustPhone').value.trim();
            const email = document.getElementById('editCustEmail').value.trim();

            if (!firstName || !lastName || !phone) {
                alert(document.body.classList.contains('lang-en') 
                      ? "Please enter first name, last name, and phone number." 
                      : "กรุณากรอกชื่อ นามสกุล และเบอร์โทรศัพท์ให้ครบถ้วน");
                return;
            }

            const index = mockCustomers.findIndex(c => c.id === id);
            if (index !== -1) {
                mockCustomers[index] = { ...mockCustomers[index], firstName, lastName, phone, email };
                renderCustomersTable();
            }
            if (editCustModal) editCustModal.hide();
        });
    }

    // --- Quotation History Logic ---
    let mockQuotations = [];
    
    function renderQuotationsTable() {
        const tbody = document.getElementById('quotations-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (mockQuotations.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">ยังไม่มีประวัติใบเสนอราคา</td></tr>`;
            return;
        }
        
        // Reverse array to show newest first
        [...mockQuotations].reverse().forEach(qt => {
            const statusBadge = qt.status === 'Booked' 
                ? '<span class="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-2 py-1"><span class="text-th">จองแล้ว</span><span class="text-en">Booked</span></span>' 
                : '<span class="badge bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50 px-2 py-1"><span class="text-th">เสนอราคา</span><span class="text-en">Quoted</span></span>';
                
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="ps-4 fw-bold text-gold">${qt.id}</td>
                <td>${qt.date}</td>
                <td><span class="badge bg-light text-dark border">${qt.unit}</span></td>
                <td>${qt.customer}</td>
                <td class="text-end fw-bold text-success">฿ ${qt.netPrice.toLocaleString()}</td>
                <td class="text-center">${statusBadge}</td>
                <td class="pe-4 text-center">
                    <button class="btn btn-sm btn-light border rounded-pill px-3 shadow-sm text-primary fw-medium" onclick="viewQuotation('${qt.id}')">
                        <i class="bi bi-eye"></i> <span class="d-none d-xl-inline"><span class="text-th">ดู</span><span class="text-en">View</span></span>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Capture existing Create Quote btn to generate Document View instead of standard alert
    if (btnCreateQuote) {
        // Redefine listener to detour original modal behavior
        const newBtnCreateQuote = btnCreateQuote.cloneNode(true);
        btnCreateQuote.parentNode.replaceChild(newBtnCreateQuote, btnCreateQuote);

        newBtnCreateQuote.addEventListener('click', () => {
            if (!customerSelect.value) {
                alert(document.body.classList.contains('lang-en') ? "Please select a customer" : "กรุณาเลือกลูกค้าเพื่อทำใบเสนอราคา");
                return;
            }
            
            // Generate data
            const dateStr = new Date().toLocaleDateString('th-TH');
            const qtId = 'QT-' + Math.floor(1000 + Math.random() * 9000);
            const customerName = customerSelect.value;
            const unitNo = document.getElementById('modal-unit-no').textContent;
            
            // Retrieve from modal spans (remove non-digits for parsing)
            const priceText = document.getElementById('modal-price').textContent.replace(/[^0-9]/g, '');
            const contractText = document.getElementById('calc-contract').textContent.replace(/[^0-9]/g, '');
            const discountText = document.getElementById('calc-promo').textContent.replace(/[^0-9]/g, '');
            const netText = document.getElementById('calc-net').textContent.replace(/[^0-9]/g, '');
            
            // Populate Document View
            document.getElementById('doc-customer-name').textContent = customerName;
            document.getElementById('doc-date').textContent = dateStr;
            document.getElementById('doc-ref').textContent = qtId;
            document.getElementById('doc-unit').textContent = unitNo;
            document.getElementById('doc-floor').textContent = document.getElementById('modal-floor').textContent;
            document.getElementById('doc-type').textContent = document.getElementById('modal-type').textContent;
            
            document.getElementById('doc-price').textContent = `฿ ${parseInt(priceText).toLocaleString()}`;
            document.getElementById('doc-contract-fee').textContent = `฿ ${parseInt(contractText).toLocaleString()}`;
            document.getElementById('doc-discount').textContent = `- ฿ ${parseInt(discountText).toLocaleString()}`;
            document.getElementById('doc-net-price').textContent = `฿ ${parseInt(netText).toLocaleString()}`;

            // Save to mock database
            mockQuotations.push({
                id: qtId,
                date: dateStr,
                unit: unitNo,
                floor: document.getElementById('modal-floor').textContent,
                type: document.getElementById('modal-type').textContent,
                price: parseInt(priceText),
                contractFee: parseInt(contractText),
                discount: parseInt(discountText),
                customer: customerName,
                netPrice: parseInt(netText),
                status: 'Quoted'
            });
            renderQuotationsTable();

            // Hide Modal, switch to Document View
            quotationModal.hide();
            switchView('view-quote-document');
        });
    }

    window.viewQuotation = function(id) {
        const qt = mockQuotations.find(q => q.id === id);
        if (qt) {
            document.getElementById('doc-customer-name').textContent = qt.customer;
            document.getElementById('doc-date').textContent = qt.date;
            document.getElementById('doc-ref').textContent = qt.id;
            document.getElementById('doc-unit').textContent = qt.unit;
            document.getElementById('doc-floor').textContent = qt.floor || '-';
            document.getElementById('doc-type').textContent = qt.type || '-';
            
            document.getElementById('doc-price').textContent = `฿ ${qt.price ? qt.price.toLocaleString() : '0'}`;
            document.getElementById('doc-contract-fee').textContent = `฿ ${qt.contractFee ? qt.contractFee.toLocaleString() : '0'}`;
            document.getElementById('doc-discount').textContent = `- ฿ ${qt.discount ? qt.discount.toLocaleString() : '0'}`;
            document.getElementById('doc-net-price').textContent = `฿ ${qt.netPrice ? qt.netPrice.toLocaleString() : '0'}`;

            switchView('view-quote-document');
        }
    };

    const btnDocProceedBook = document.getElementById('btn-doc-proceed-book');
    if (btnDocProceedBook) {
        btnDocProceedBook.addEventListener('click', () => {
            alert("จองห้องสำเร็จ (Unit Booked!)");
            
            // Mark quote as Booked
            const currentQtId = document.getElementById('doc-ref').textContent;
            const qtIndex = mockQuotations.findIndex(q => q.id === currentQtId);
            if (qtIndex > -1) {
                mockQuotations[qtIndex].status = 'Booked';
                renderQuotationsTable();
            }
            
            const dateStr = new Date().toLocaleDateString('th-TH');
            const bkId = 'BK-' + Math.floor(100 + Math.random() * 900);
            const unitNo = document.getElementById('doc-unit').textContent;
            const customerName = document.getElementById('doc-customer-name').textContent;
            const priceText = document.getElementById('doc-price').textContent.replace(/[^0-9]/g, '');
            const contractText = document.getElementById('doc-contract-fee').textContent.replace(/[^0-9]/g, '');
            const discountText = document.getElementById('doc-discount').textContent.replace(/[^0-9]/g, '');
            const netText = document.getElementById('doc-net-price').textContent.replace(/[^0-9]/g, '');
            
            mockBookings.push({
                id: bkId,
                date: dateStr,
                unit: unitNo,
                customer: customerName,
                price: parseInt(priceText) || 0,
                reservationFee: 50000,
                contractFee: parseInt(contractText) || 0,
                discount: parseInt(discountText) || 0,
                netPrice: parseInt(netText) || 0,
                status: 'Active'
            });
            renderBookingsTable();

            const uiUnit = document.querySelector(`.unit-box[data-unit="${unitNo}"]`);
            if (uiUnit && uiUnit.dataset.status !== 'booked') {
                uiUnit.className = 'flex-shrink-0 unit-box status-booked';
                uiUnit.dataset.status = 'booked';
                
                const newBox = uiUnit.cloneNode(true);
                uiUnit.parentNode.replaceChild(newBox, uiUnit);
                
                currentStats.avail--;
                currentStats.booked++;
                updateDashboardStats();
                applyCurrentFilter();
            }

            switchView('view-bookings');
        });
    }

    // --- Bookings Menu Logic ---
    let mockBookings = [];

    function renderBookingsTable() {
        const tbody = document.getElementById('bookings-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (mockBookings.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">ยังไม่มีข้อมูลการจอง (No Bookings)</td></tr>`;
            return;
        }
        
        [...mockBookings].reverse().forEach(bk => {
            const isActive = bk.status !== 'Inactive';
            const statusBadge = isActive
                ? '<span class="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-2 py-1"><span class="text-th">ใช้งาน (Active)</span><span class="text-en">Active</span></span>'
                : '<span class="badge bg-secondary bg-opacity-25 text-secondary border border-secondary border-opacity-50 px-2 py-1"><span class="text-th">ยกเลิก (Inactive)</span><span class="text-en">Inactive</span></span>';
                
            const actionButtons = isActive
                ? `<button class="btn btn-sm btn-outline-info rounded-pill px-3 shadow-sm me-1 fw-medium" onclick="viewBooking('${bk.id}')">
                        <i class="bi bi-eye"></i> <span class="d-none d-md-inline"><span class="text-th">ดู</span><span class="text-en">View</span></span>
                   </button>
                   <button class="btn btn-sm btn-outline-danger rounded-pill px-3 shadow-sm fw-medium" onclick="cancelBooking('${bk.id}')">
                         <i class="bi bi-x-circle"></i> <span class="d-none d-md-inline"><span class="text-th">ยกเลิก</span><span class="text-en">Cancel</span></span>
                   </button>`
                : `<button class="btn btn-sm btn-outline-info rounded-pill px-3 shadow-sm fw-medium" onclick="viewBooking('${bk.id}')">
                        <i class="bi bi-eye"></i> <span class="d-none d-md-inline"><span class="text-th">ดู</span><span class="text-en">View</span></span>
                   </button>`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="ps-4 fw-bold ${isActive ? 'text-success' : 'text-secondary'}">${bk.id}</td>
                <td class="${isActive ? '' : 'text-muted'}">${bk.date}</td>
                <td><span class="badge bg-light text-dark border ${isActive ? '' : 'opacity-50'}">${bk.unit}</span></td>
                <td class="${isActive ? '' : 'text-muted'}">${bk.customer}</td>
                <td class="text-center">${statusBadge}</td>
                <td class="pe-4 text-center">
                    ${actionButtons}
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.viewBooking = function(id) {
        const bk = mockBookings.find(b => b.id === id);
        if (bk && bookingModal) {
            document.getElementById('view-b-unit').textContent = bk.unit;
            document.getElementById('view-b-date').textContent = bk.date;
            document.getElementById('view-b-cust').textContent = bk.customer;
            document.getElementById('view-b-price').textContent = `฿ ${bk.price.toLocaleString()}`;
            document.getElementById('view-b-res').textContent = `฿ ${bk.reservationFee ? bk.reservationFee.toLocaleString() : '50,000'}`;
            document.getElementById('view-b-contract').textContent = `฿ ${bk.contractFee ? bk.contractFee.toLocaleString() : '0'}`;
            document.getElementById('view-b-discount').textContent = `- ฿ ${bk.discount ? bk.discount.toLocaleString() : '0'}`;
            document.getElementById('view-b-net').textContent = `฿ ${bk.netPrice.toLocaleString()}`;
            bookingModal.show();
        }
    };

    window.cancelBooking = function(id) {
        if (confirm('คุณต้องการยกเลิกการจองห้องนี้ใช่หรือไม่? (Are you sure you want to cancel this booking?)')) {
            const bkIndex = mockBookings.findIndex(b => b.id === id);
            if (bkIndex > -1) {
                const bkUnit = mockBookings[bkIndex].unit;
                mockBookings[bkIndex].status = 'Inactive';
                renderBookingsTable();

                const uiUnit = document.querySelector(`.unit-box[data-unit="${bkUnit}"]`);
                if (uiUnit) {
                    uiUnit.className = 'flex-shrink-0 unit-box status-avail';
                    uiUnit.dataset.status = 'avail';
                    currentStats.booked--;
                    currentStats.avail++;
                    updateDashboardStats();
                    applyCurrentFilter();
                }
                alert('ยกเลิกการจองสำเร็จ (Booking Cancelled)');
            }
        }
    };


    // --- AI Chat Logic ---
    const chatForm = document.getElementById('ai-chat-form');
    const chatInput = document.getElementById('ai-chat-input');
    const chatBox = document.getElementById('ai-chat-box');

    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (!message) return;

            // 1. Append User Message
            const userMsgDiv = document.createElement('div');
            userMsgDiv.className = 'd-flex w-100 flex-column align-items-end mb-3';
            userMsgDiv.innerHTML = `
                <div class="bg-gold px-4 py-3 rounded-4 shadow-sm text-white" style="max-width: 85%; border-bottom-right-radius: 4px !important; line-height: 1.6;">
                    ${message}
                </div>
                <small class="text-muted mt-1 me-2" style="font-size: 0.7rem;">You • Just now</small>
            `;
            chatBox.appendChild(userMsgDiv);
            chatInput.value = '';
            chatBox.scrollTop = chatBox.scrollHeight;

            // 2. Mock AI Response Delay
            setTimeout(() => {
                const aiMsgDiv = document.createElement('div');
                aiMsgDiv.className = 'd-flex w-100 flex-column align-items-start mb-3';
                
                let replyTh = 'ขออภัยค่ะ ข้อมูลส่วนนี้ยังไม่ได้เชื่อมต่อในระบบจำลอง (Mockup) แต่ฉันสามารถให้ข้อมูลพื้นฐานเกี่ยวกับ <b>Siam Premium Residences</b> ได้ค่ะ สนใจห้องขนาดกี่ห้องนอนดีคะ?';
                let replyEn = 'Sorry, this data is not fully connected in the mockup system. However, I can provide basic info about <b>Siam Premium Residences</b>. How many bedrooms are you looking for?';

                const lowerMsg = message.toLowerCase();

                if (lowerMsg.includes('ราคา') || lowerMsg.includes('price') || lowerMsg.includes('เท่าไหร่') || lowerMsg.includes('แพง')) {
                    replyTh = 'ราคาเริ่มต้นของโครงการ Siam Premium Residences อยู่ที่ <b>2.5 ล้านบาท</b> สำหรับอาคาร B และ <b>3.0 ล้านบาท</b> สำหรับอาคาร A ค่ะ<br><br>หากสนใจทำใบเสนอราคา สามารถไปที่เมนู <b>"ผังห้องพัก"</b> และคลิกที่ตำแหน่งห้องว่างได้เลยค่ะ';
                    replyEn = 'The starting price for Siam Premium Residences is <b>2.5MB</b> for Building B and <b>3.0MB</b> for Building A.<br><br>If you want a quotation, you can go to the <b>"Unit Matrix"</b> menu and click on an available unit.';
                } else if (lowerMsg.includes('ว่าง') || lowerMsg.includes('available') || lowerMsg.includes('เหลือ') || lowerMsg.includes('กี่ห้อง')) {
                    replyTh = `ปัจจุบันมีห้องโปรโมชั่นว่างพร้อมจองในระบบทั้งหมด <b>${currentStats.avail} ห้อง</b> ค่ะ คุณสามารถไปที่เมนู <b>"ผังห้องพัก" (Unit Matrix)</b> เพื่อดูผังห้องและตำแหน่งได้แบบ Real-time เลยนะคะ`;
                    replyEn = `Currently, there are exactly <b>${currentStats.avail} available units</b> in the system. You can check the <b>"Unit Matrix"</b> menu to see the exact floor plans and available positions in real-time.`;
                } else if (lowerMsg.includes('hello') || lowerMsg.includes('สวัสดี') || lowerMsg.includes('ดีครับ') || lowerMsg.includes('ดีค่ะ') || lowerMsg.includes('hi')) {
                    replyTh = 'สวัสดีค่ะ! ยินดีที่ได้ให้บริการค่ะ ต้องการสอบถามข้อมูลด้านไหนของโครงการเป็นพิเศษไหมคะ?';
                    replyEn = 'Hello! Nice to meet you. What information are you looking for today?';
                } else if (lowerMsg.includes('โปรโมชั่น') || lowerMsg.includes('promo') || lowerMsg.includes('ส่วนลด') || lowerMsg.includes('แถม')) {
                    replyTh = '🎉 <b>โปรโมชั่นพิเศษเฉพาะเดือนนี้:</b><br>- ฟรี ค่าธรรมเนียมการโอนกรรมสิทธิ์<br>- ฟรี ค่าส่วนกลาง 1 ปีล่วงหน้า<br>- รับชุด Home Automation ครบชุด (Smart Home)<br>- ส่วนลดเงินสดสูงสุด <b>100,000 บาท</b> ณ วันโอนค่ะ!';
                    replyEn = '🎉 <b>Current Special Promotions:</b><br>- Free Transfer Fee<br>- Free 1-year CAM Fee<br>- Full Smart Home Automation package<br>- Cash discount up to <b>100,000 THB</b> on transfer date!';
                } else if (lowerMsg.includes('แผนที่') || lowerMsg.includes('map') || lowerMsg.includes('ที่ตั้ง') || lowerMsg.includes('ส่วนกลาง') || lowerMsg.includes('facility')) {
                    replyTh = 'โครงการของเราตั้งอยู่บนทำเลศักยภาพ ใกล้รถไฟฟ้าเพียง 300 เมตร! 🚆 <br>ส่วนกลางของเราจัดเต็มด้วย:<br>- สระว่ายน้ำระบบเกลือยาว 50 เมตร 🏊‍♀️<br>- ฟิตเนสลอยฟ้าวิว 360 องศา 🏋️‍♂️<br>- Co-working Space & Meeting Room ตลอด 24 ชม.';
                    replyEn = 'Our project is in a prime location, just 300m from the BTS station! 🚆<br>Our facilities include:<br>- 50m salt-water Swimming Pool 🏊‍♀️<br>- 360° Sky Fitness 🏋️‍♂️<br>- 24/7 Co-working Space & Meeting Room';
                }

                aiMsgDiv.innerHTML = `
                    <div class="bg-white px-4 py-3 rounded-4 shadow-sm text-dark ai-bubble" style="max-width: 85%; border-bottom-left-radius: 4px !important; line-height: 1.6;">
                        <span class="text-th">${replyTh}</span><span class="text-en">${replyEn}</span>
                    </div>
                    <small class="text-muted mt-1 ms-2" style="font-size: 0.7rem;">AI Assistant • Just now</small>
                `;
                chatBox.appendChild(aiMsgDiv);
                chatBox.scrollTop = chatBox.scrollHeight;
                
            }, 800 + Math.random() * 500); // 800-1300ms delay for realism
        });
    }

    // --- OCR Scanning Logic ---
    const ocrDropzone = document.getElementById('ocr-dropzone');
    const ocrInput = document.getElementById('ocr-input');
    const ocrDefaultState = document.getElementById('ocr-default-state');
    const ocrScanningState = document.getElementById('ocr-scanning-state');
    const ocrSuccessState = document.getElementById('ocr-success-state');
    const ocrPreviewImg = document.getElementById('ocr-preview-img');
    const ocrProgressBar = document.getElementById('ocr-progress-bar');
    const btnOcrReset = document.getElementById('btn-ocr-reset');

    if (ocrDropzone && ocrInput) {
        // Trigger file input on click
        ocrDropzone.addEventListener('click', (e) => {
            // Prevent triggering if clicked on reset button
            if (e.target.closest('#btn-ocr-reset')) return;
            if (!ocrScanningState.classList.contains('d-none') || !ocrSuccessState.classList.contains('d-none')) return;
            ocrInput.click();
        });

        // Drag and Drop events
        ocrDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (!ocrScanningState.classList.contains('d-none') || !ocrSuccessState.classList.contains('d-none')) return;
            ocrDropzone.classList.add('dragover');
        });

        ocrDropzone.addEventListener('dragleave', () => {
            ocrDropzone.classList.remove('dragover');
        });

        ocrDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            ocrDropzone.classList.remove('dragover');
            if (!ocrScanningState.classList.contains('d-none') || !ocrSuccessState.classList.contains('d-none')) return;
            
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleOcrFile(e.dataTransfer.files[0]);
            }
        });

        // File Input Change
        ocrInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                handleOcrFile(this.files[0]);
            }
        });

        // Reset Flow
        if (btnOcrReset) {
            btnOcrReset.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent opening file dialog
                resetOcrState();
            });
        }
    }

    function resetOcrState() {
        ocrInput.value = ''; // clear input
        ocrScanningState.classList.add('d-none');
        ocrScanningState.classList.remove('d-flex');
        ocrSuccessState.classList.add('d-none');
        ocrSuccessState.classList.remove('d-flex');
        ocrDefaultState.classList.remove('d-none');
        ocrDefaultState.classList.add('d-flex');
        ocrProgressBar.style.width = '0%';
        ocrDropzone.style.pointerEvents = 'auto'; // allow clicking again
        
        // Clear fields
        const idField = document.getElementById('custIdentify');
        if (idField) idField.value = '';
        document.getElementById('custFirstName').value = '';
        document.getElementById('custLastName').value = '';
    }

    function handleOcrFile(file) {
        // Basic validation
        if (!file.type.match('image.*')) {
            alert(document.body.classList.contains('lang-en') ? 'Please upload an image file.' : 'กรุณาอัปโหลดไฟล์รูปภาพ');
            return;
        }

        // Show Preview Image
        const reader = new FileReader();
        reader.onload = function(e) {
            ocrPreviewImg.src = e.target.result;
            startOcrSimulation();
        }
        reader.readAsDataURL(file);
    }

    function startOcrSimulation() {
        // UI transitions
        ocrDefaultState.classList.add('d-none');
        ocrDefaultState.classList.remove('d-flex');
        ocrScanningState.classList.remove('d-none');
        ocrScanningState.classList.add('d-flex');
        ocrDropzone.style.pointerEvents = 'none'; // disable clicking

        // Animate Progress Bar
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            ocrProgressBar.style.width = `${progress}%`;

            if (progress === 100) {
                clearInterval(interval);
                setTimeout(() => {
                    finishOcrSimulation();
                }, 500); // short delay at 100%
            }
        }, 200);
    }

    function finishOcrSimulation() {
        ocrScanningState.classList.add('d-none');
        ocrScanningState.classList.remove('d-flex');
        ocrSuccessState.classList.remove('d-none');
        ocrSuccessState.classList.add('d-flex');
        ocrDropzone.style.pointerEvents = 'auto';

        // Mock data to auto-fill (Simulating OCR extraction)
        const idField = document.getElementById('custIdentify');
        if (idField) idField.value = '1-1002-03456-78-9';
        
        document.getElementById('custFirstName').value = 'สิริพจน์';
        document.getElementById('custLastName').value = 'เจริญทรัพย์';
        
        // Add a slight highlight effect to show it was auto-filled
        ['custIdentify', 'custFirstName', 'custLastName'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.transition = 'background-color 0.5s';
                el.style.backgroundColor = '#ecfdf5';
                setTimeout(() => {
                    el.style.backgroundColor = '';
                }, 1500);
            }
        });
    }

    // --- Interactive Guide (Driver.js) ---
    const driverObj = window.driver.js.driver({
        showProgress: true,
        animate: true,
        nextBtnText: 'ถัดไป (Next)',
        prevBtnText: 'ย้อนกลับ (Prev)',
        doneBtnText: 'ปิด (Done)',
        steps: [
            {
                popover: {
                    title: 'Welcome to SPR Matrix! 👋',
                    description: 'ระบบจัดการผังห้องพักอัจฉริยะ (Smart Unit Matrix) ดูสถานะห้องและทำใบเสนอราคาได้อย่างรวดเร็ว ขอใช้เวลา 1 นาทีเพื่อแนะนำการใช้งานครับ'
                }
            },
            {
                element: '#tour-nav-item',
                popover: {
                    title: 'คู่มือการใช้งาน',
                    description: 'ถ้าลืมการทำงานของระบบ สามารถกดที่ปุ่มนี้เพื่อเรียกดูคำแนะนำได้ตลอดเวลาเลยครับ',
                    side: "right",
                    align: 'start'
                }
            },
            {
                element: '#project-select',
                popover: {
                    title: 'เลือกโครงการและอาคาร',
                    description: 'เริ่มจากการเลือกโครงการและอาคารที่ต้องการดูแล สถิติและผังห้องจะอัปเดตให้อัตโนมัติครับ'
                }
            },
            {
                element: '#status-filters',
                popover: {
                    title: 'ตัวกรองสถานะ (Status Filters)',
                    description: 'คลิกเพื่อกรองและไฮไลต์เฉพาะหน้าผัง เช่น เลือกดูเฉพาะห้อง "ว่าง" เพื่อแนะนำลูกค้า'
                }
            },
            {
                element: '#unit-matrix',
                popover: {
                    title: 'ผังห้องกริต (Unit Grid)',
                    description: '📌 <b>คลิกห้องเขียว (ว่าง):</b> ทำใบเสนอราคา / จอง / หรือ ล็อคห้อง<br><br>📌 <b>คลิกห้องติดล็อค 🔒:</b> ปลดล็อคห้องให้กลับเป็นสถานะว่าง',
                    side: "top",
                    align: 'center'
                }
            }
        ]
    });

    const btnStartTour = document.getElementById('btn-start-tour');
    if (btnStartTour) {
        btnStartTour.addEventListener('click', () => {
            driverObj.drive();
        });
    }

    // Auto-start on first visit
    if (!localStorage.getItem('spr_tour_completed')) {
        setTimeout(() => {
            driverObj.drive();
            localStorage.setItem('spr_tour_completed', 'true');
        }, 800); // Small delay to ensure everything is rendered
    }

    // Initialize SPA data views
    renderCustomersTable();
    renderQuotationsTable();
    renderBookingsTable();
});
