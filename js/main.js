(function($) {
  'use strict';

  // Shopping Cart Engine (stored in localStorage)
  window.CartEngine = {
    getItems: function() {
      const stored = localStorage.getItem('bb_cart_items');
      if (stored === null) {
        const defaultItems = [
          { id: 'morning-glory', name: 'Morning Glory Blend', price: '$16.99', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80', qty: 1 },
          { id: 'french-press', name: 'Classic French Press', price: '$34.99', img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80', qty: 1 }
        ];
        localStorage.setItem('bb_cart_items', JSON.stringify(defaultItems));
        return defaultItems;
      }
      try {
        return JSON.parse(stored) || [];
      } catch (e) {
        return [];
      }
    },
    addItem: function(item) {
      let items = this.getItems();
      const existingIndex = items.findIndex(i => i.id === item.id || i.name === item.name);
      if (existingIndex > -1) {
        items[existingIndex].qty += (item.qty || 1);
      } else {
        items.push({
          id: item.id || 'item-' + Date.now(),
          name: item.name || 'Artisan Product',
          price: item.price || '$15.00',
          img: item.img || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&q=80',
          qty: item.qty || 1
        });
      }
      localStorage.setItem('bb_cart_items', JSON.stringify(items));
      this.updateBadge();
      this.showAddedToast(item.name || 'Product');
    },
    removeItem: function(id) {
      let items = this.getItems();
      const removedItem = items.find(i => i.id === id);
      items = items.filter(i => i.id !== id);
      localStorage.setItem('bb_cart_items', JSON.stringify(items));
      this.updateBadge();
      if (window.renderCartPage) window.renderCartPage();
      if (removedItem && window.announceToScreenReader) {
        window.announceToScreenReader(`${removedItem.name} removed from cart.`);
      }
    },
    updateBadge: function() {
      const items = this.getItems();
      const totalCount = items.reduce((sum, item) => sum + item.qty, 0);
      
      $('.cart-link').each(function() {
        let $badge = $(this).find('.cart-badge');
        if ($badge.length === 0) {
          $badge = $('<span class="cart-badge badge bg-accent rounded-pill position-absolute top-0 start-100 translate-middle"></span>');
          $(this).append($badge);
        }
        if (totalCount > 0) {
          $badge.text(totalCount).show();
        } else {
          $badge.hide();
        }
      });
    },
    showAddedToast: function(productName) {
      let $toastContainer = $('#bb-toast-container');
      if ($toastContainer.length === 0) {
        $toastContainer = $('<div id="bb-toast-container" class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1090;"></div>');
        $('body').append($toastContainer);
      }

      const toastId = 'toast-' + Date.now();
      const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white bg-dark border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="d-flex">
            <div class="toast-body d-flex align-items-center gap-2">
              <i class="fas fa-check-circle text-success fa-lg"></i>
              <div>
                <strong>Added to Cart!</strong>
                <div class="small text-white-50">${productName} has been added.</div>
              </div>
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close notification"></button>
          </div>
        </div>
      `;
      $toastContainer.append(toastHtml);
      const toastElem = document.getElementById(toastId);
      const bsToast = new bootstrap.Toast(toastElem, { delay: 3500 });
      bsToast.show();

      if (window.announceToScreenReader) {
        window.announceToScreenReader(`${productName} added to shopping cart.`);
      }
    }
  };

  // Initialize Bootstrap Tooltips and Popovers
  function initBootstrapPlugins() {
    // Tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
      return new bootstrap.Popover(popoverTriggerEl);
    });
  }

  // Interactive Add-To-Cart Buttons
  function setupCartTriggers() {
    $(document).on('click', '.btn-primary:contains("Add to Cart"), .btn:contains("Add to Cart"), [data-action="add-cart"]', function(e) {
      const $btn = $(this);
      const href = $btn.attr('href');

      // If button is a direct add to cart action
      if ($btn.text().toLowerCase().includes('add to cart') || $btn.data('action') === 'add-cart') {
        // Look for parent card or container to extract product info
        const $card = $btn.closest('.product-card, .feature-card, article, .card, .product-detail');
        let name = $card.find('h3, h2, .product-title').first().text().trim() || 'Artisan Coffee';
        let price = $card.find('.price, .product-price').first().text().trim() || '$16.99';
        let img = $card.find('img').first().attr('src') || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&q=80';
        let id = $card.attr('id') || name.toLowerCase().replace(/[^a-z0-0]+/g, '-');

        if (name) {
          if (href === 'cart.html') {
            e.preventDefault(); // Don't reload immediately, handle smoothly
          }
          window.CartEngine.addItem({ id, name, price, img, qty: 1 });

          // Animated feedback on button
          const originalText = $btn.html();
          $btn.html('<i class="fas fa-check me-1"></i> Added!').addClass('btn-success').removeClass('btn-primary');
          setTimeout(() => {
            $btn.html(originalText).removeClass('btn-success').addClass('btn-primary');
          }, 2000);
        }
      }
    });

    window.CartEngine.updateBadge();
  }

  // Quick Product View Modal Plugin
  function setupQuickViewModal() {
    $(document).on('click', '.product-image, .product-card h3', function() {
      const $card = $(this).closest('.product-card');
      if ($card.length === 0) return;

      const title = $card.find('h3').text();
      const desc = $card.find('p').text();
      const price = $card.find('.price').text() || '$16.99';
      const imgSrc = $card.find('img').attr('src');
      const id = $card.attr('id');

      let $modal = $('#quickViewModal');
      if ($modal.length === 0) {
        $('body').append(`
          <div class="modal fade" id="quickViewModal" tabindex="-1" aria-labelledby="quickViewModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
              <div class="modal-content rounded-4 overflow-hidden border-0 shadow-lg">
                <div class="modal-header bg-cream border-0">
                  <h5 class="modal-title font-heading fw-bold" id="quickViewModalLabel">Product Details</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                  <div class="row g-4 align-items-center">
                    <div class="col-md-6">
                      <img id="qv-img" src="" alt="" class="img-fluid rounded-3 shadow-sm w-100" style="max-height: 350px; object-fit: cover;">
                    </div>
                    <div class="col-md-6">
                      <h2 id="qv-title" class="mb-2"></h2>
                      <div class="mb-2 text-warning">
                        <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star-half-alt"></i>
                        <span class="text-muted small ms-1">(4.8 / 5.0)</span>
                      </div>
                      <p id="qv-desc" class="text-muted mb-3"></p>
                      <div class="h3 text-primary mb-4" id="qv-price"></div>
                      <div class="d-flex gap-2">
                        <button id="qv-add-btn" class="btn btn-primary btn-lg flex-fill">
                          <i class="fas fa-cart-plus me-1"></i> Add to Cart
                        </button>
                        <a id="qv-cart-link" href="cart.html" class="btn btn-outline-secondary btn-lg">
                          View Cart
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `);
        $modal = $('#quickViewModal');
      }

      $('#qv-title').text(title);
      $('#qv-desc').text(desc);
      $('#qv-price').text(price);
      $('#qv-img').attr('src', imgSrc).attr('alt', title);

      $('#qv-add-btn').off('click').on('click', function() {
        window.CartEngine.addItem({ id: id || 'qv-' + Date.now(), name: title, price: price, img: imgSrc, qty: 1 });
        const bsModal = bootstrap.Modal.getInstance(document.getElementById('quickViewModal'));
        if (bsModal) bsModal.hide();
      });

      const modalObj = new bootstrap.Modal(document.getElementById('quickViewModal'));
      modalObj.show();
    });
  }

  // Cart Page Renderer (`cart.html`)
  window.renderCartPage = function() {
    if (window.location.pathname.indexOf('cart.html') === -1) return;

    const items = window.CartEngine.getItems();
    const $container = $('#cart-container, .cart-layout, .cart-container, #cart-items-wrapper').first();

    if (!$container.length) return;

    if (items.length === 0) {
      $container.html(`
        <div class="text-center py-5 bg-white rounded-4 shadow-sm p-5 my-4">
          <i class="fas fa-shopping-basket fa-4x text-muted mb-3"></i>
          <h2>Your Cart is Empty</h2>
          <p class="text-muted">Explore our fine coffees and brewing equipment to fill your cup!</p>
          <a href="classics.html" class="btn btn-primary btn-lg mt-2"><i class="fas fa-coffee me-2"></i> Browse Coffees</a>
        </div>
      `);
      return;
    }

    let subtotal = 0;
    let itemsHtml = `
      <div class="row g-4">
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <h3 class="mb-4 d-flex justify-content-between align-items-center h4 font-heading fw-bold">
              <span><i class="fas fa-shopping-bag text-primary me-2"></i> Shopping Cart</span>
              <span class="badge bg-cream text-dark fs-6 font-monospace">${items.length} unique items</span>
            </h3>
            <div class="table-responsive">
              <table class="table align-middle">
                <thead>
                  <tr class="text-muted small border-bottom">
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th class="text-end">Total</th>
                    <th class="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
    `;

    items.forEach(item => {
      const pVal = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 15.00;
      const itemTotal = pVal * item.qty;
      subtotal += itemTotal;

      itemsHtml += `
        <tr>
          <td>
            <div class="d-flex align-items-center gap-3">
              <img src="${item.img}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover;" class="rounded-3 shadow-sm">
              <div>
                <strong class="d-block text-dark mb-1">${item.name}</strong>
                <span class="badge bg-success-subtle text-success border border-success-subtle extra-small"><i class="fas fa-check-circle me-1"></i>In Stock</span>
              </div>
            </div>
          </td>
          <td class="fw-medium">${item.price}</td>
          <td>
            <div class="input-group input-group-sm" style="width: 110px;">
              <button class="btn btn-outline-secondary btn-cart-dec" data-id="${item.id}" aria-label="Decrease quantity">-</button>
              <input type="text" class="form-control text-center bg-white" value="${item.qty}" readonly aria-label="Quantity">
              <button class="btn btn-outline-secondary btn-cart-inc" data-id="${item.id}" aria-label="Increase quantity">+</button>
            </div>
          </td>
          <td class="text-end fw-bold text-primary">$${itemTotal.toFixed(2)}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-danger btn-cart-remove px-3 py-1" data-id="${item.id}" aria-label="Remove ${item.name} from cart">
              <i class="fas fa-trash-alt me-1" aria-hidden="true"></i> Remove
            </button>
          </td>
        </tr>
      `;
    });

    const tax = subtotal * 0.08;
    const shipping = subtotal > 50 ? 0 : 5.99;
    const grandTotal = subtotal + tax + shipping;

    itemsHtml += `
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card border-0 shadow-sm rounded-4 p-4 bg-white sticky-top" style="top: 90px;">
            <h4 class="mb-3 font-heading fw-bold">Order Summary</h4>
            <div class="d-flex justify-content-between mb-2 text-muted">
              <span>Subtotal</span>
              <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="d-flex justify-content-between mb-2 text-muted">
              <span>Estimated Tax (8%)</span>
              <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="d-flex justify-content-between mb-3 text-muted">
              <span>Shipping</span>
              <span>${shipping === 0 ? '<span class="text-success fw-bold">FREE</span>' : '$' + shipping.toFixed(2)}</span>
            </div>
            <hr>
            <div class="d-flex justify-content-between mb-4 h4 fw-bold text-dark">
              <span>Total</span>
              <span class="text-primary">$${grandTotal.toFixed(2)}</span>
            </div>
            <a href="payment.html" class="btn btn-primary btn-lg w-100 rounded-pill shadow-sm py-3 font-weight-bold">
              <i class="fas fa-lock me-2" aria-hidden="true"></i> Proceed to Checkout
            </a>
            <div class="text-center mt-3 text-muted extra-small">
              <i class="fas fa-shield-alt text-success me-1"></i> Secure 256-bit SSL Encryption
            </div>
          </div>
        </div>
      </div>
    `;

    $container.html(itemsHtml);

    // Quantity Inc/Dec handlers
    $('.btn-cart-inc').off('click').on('click', function() {
      const id = $(this).data('id');
      const items = window.CartEngine.getItems();
      const item = items.find(i => i.id === id);
      if (item) {
        item.qty += 1;
        localStorage.setItem('bb_cart_items', JSON.stringify(items));
        window.CartEngine.updateBadge();
        window.renderCartPage();
      }
    });

    $('.btn-cart-dec').off('click').on('click', function() {
      const id = $(this).data('id');
      const items = window.CartEngine.getItems();
      const item = items.find(i => i.id === id);
      if (item) {
        if (item.qty > 1) {
          item.qty -= 1;
          localStorage.setItem('bb_cart_items', JSON.stringify(items));
        } else {
          window.CartEngine.removeItem(id);
        }
        window.CartEngine.updateBadge();
        window.renderCartPage();
      }
    });

    $('.btn-cart-remove').off('click').on('click', function(e) {
      e.preventDefault();
      const id = $(this).data('id');
      window.CartEngine.removeItem(id);
    });
  };

  // Dedicated Payment Page Renderer (`payment.html`)
  window.renderPaymentPage = function() {
    if (window.location.pathname.indexOf('payment.html') === -1) return;

    const $container = $('#payment-page-container');
    if (!$container.length) return;

    const items = window.CartEngine.getItems();

    if (items.length === 0) {
      $container.html(`
        <div class="text-center py-5 bg-white rounded-4 shadow-sm p-5 my-4">
          <i class="fas fa-shopping-cart fa-4x text-muted mb-3"></i>
          <h2 class="h3 font-heading fw-bold">Your Cart is Empty</h2>
          <p class="text-muted">You must add items to your cart before proceeding to checkout.</p>
          <a href="classics.html" class="btn btn-primary btn-lg mt-3"><i class="fas fa-coffee me-2"></i> Browse Our Coffees</a>
        </div>
      `);
      return;
    }

    let subtotal = 0;
    let itemsSummaryHtml = '';

    items.forEach(item => {
      const pVal = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 15.00;
      const itemTotal = pVal * item.qty;
      subtotal += itemTotal;

      itemsSummaryHtml += `
        <div class="d-flex align-items-center justify-content-between py-2 border-bottom">
          <div class="d-flex align-items-center gap-3">
            <img src="${item.img}" alt="${item.name}" style="width: 48px; height: 48px; object-fit: cover;" class="rounded-3 shadow-sm">
            <div>
              <div class="fw-bold text-dark small">${item.name}</div>
              <div class="text-muted extra-small">Qty: ${item.qty} &times; ${item.price}</div>
            </div>
          </div>
          <div class="fw-bold text-primary">$${itemTotal.toFixed(2)}</div>
        </div>
      `;
    });

    const tax = subtotal * 0.08;
    const shipping = subtotal > 50 ? 0 : 5.99;
    const grandTotal = subtotal + tax + shipping;

    function renderForm(initialValues = {}) {
      const townships = [
        'Yankin', 'Kamayut', 'Bahan', 'Mayangone', 'Kyauktada', 'Dagon',
        'Sanchaung', 'Botataung', 'Insein', 'Tamwe', 'Thingangyun',
        'Lanmadaw', 'Latha', 'Ahlone', 'Mingaladon', 'Kyeemyindaing', 'Pazundaung'
      ];

      const states = [
        'Yangon Region', 'Mandalay Region', 'Naypyidaw Union Territory', 'Shan State',
        'Bago Region', 'Ayeyarwady Region', 'Mon State', 'Kayin State',
        'Rakhine State', 'Sagaing Region', 'Magway Region', 'Kachin State',
        'Kayah State', 'Chin State', 'Tanintharyi Region'
      ];

      const selectedCity = initialValues.payCity || '';
      const selectedState = initialValues.payState || '';

      const cityOptionsHtml = townships.map(t => 
        `<option value="${t}" ${selectedCity === t ? 'selected' : ''}>${t} Township</option>`
      ).join('');

      const stateOptionsHtml = states.map(s => 
        `<option value="${s}" ${selectedState === s ? 'selected' : ''}>${s}</option>`
      ).join('');

      const paymentFormHtml = `
        <div class="row g-4">
          <!-- Payment & Billing Form -->
          <div class="col-lg-7">
            <form id="payment-checkout-form" class="needs-validation" novalidate>
              
              <!-- Express Payment Options -->
              <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                <h3 class="h5 font-heading fw-bold mb-3"><i class="fas fa-bolt text-warning me-2"></i> Express Checkout</h3>
                <p class="text-muted small mb-3">Click an option below to authenticate via your express wallet:</p>
                <div class="row g-2">
                  <div class="col-4">
                    <button type="button" class="btn btn-outline-dark w-100 py-2 btn-express-pay" data-method="Apple Pay">
                      <i class="fab fa-apple fa-lg me-1"></i> Pay
                    </button>
                  </div>
                  <div class="col-4">
                    <button type="button" class="btn btn-outline-primary w-100 py-2 btn-express-pay" data-method="Google Pay">
                      <i class="fab fa-google fa-lg me-1"></i> Pay
                    </button>
                  </div>
                  <div class="col-4">
                    <button type="button" class="btn btn-outline-warning w-100 py-2 btn-express-pay" data-method="PayPal">
                      <i class="fab fa-paypal fa-lg me-1"></i> PayPal
                    </button>
                  </div>
                </div>
                <div class="text-center position-relative my-4">
                  <hr>
                  <span class="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">OR PAY WITH CREDIT CARD</span>
                </div>
              </div>

              <!-- Customer Details -->
              <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                <h3 class="h5 font-heading fw-bold mb-3"><i class="fas fa-user text-primary me-2"></i> 1. Contact &amp; Shipping Details</h3>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label for="pay-email" class="form-label fw-medium">Email Address <span class="text-danger">*</span></label>
                    <input type="email" class="form-control" id="pay-email" placeholder="e.g. mgmg@example.com" required value="${initialValues.payEmail || ''}">
                    <div class="invalid-feedback">Please enter a valid email address.</div>
                  </div>
                  <div class="col-md-6">
                    <label for="pay-phone" class="form-label fw-medium">Phone Number <span class="text-danger">*</span></label>
                    <input type="tel" class="form-control" id="pay-phone" placeholder="e.g. +959 757 231 993" required value="${initialValues.payPhone || ''}">
                    <div class="invalid-feedback">Please enter your phone number.</div>
                  </div>
                  <div class="col-12">
                    <label for="pay-name" class="form-label fw-medium">Full Name <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="pay-name" placeholder="e.g. Aung Kyaw" required value="${initialValues.payName || ''}">
                    <div class="invalid-feedback">Please enter your full name.</div>
                  </div>
                  <div class="col-12">
                    <label for="pay-address" class="form-label fw-medium">Shipping Address <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="pay-address" placeholder="e.g. No.8 Kyauk Kone Street" required value="${initialValues.payAddress || ''}">
                    <div class="invalid-feedback">Please enter your street address.</div>
                  </div>
                  <div class="col-md-5">
                    <label for="pay-city" class="form-label fw-medium">Township / City <span class="text-danger">*</span></label>
                    <select class="form-select" id="pay-city" required>
                      <option value="" ${!selectedCity ? 'selected disabled' : ''}>Select Township in Yangon...</option>
                      ${cityOptionsHtml}
                    </select>
                    <div class="invalid-feedback">Please select your township/city.</div>
                  </div>
                  <div class="col-md-4">
                    <label for="pay-state" class="form-label fw-medium">State / Region <span class="text-danger">*</span></label>
                    <select class="form-select" id="pay-state" required>
                      <option value="" ${!selectedState ? 'selected disabled' : ''}>Select State/Region...</option>
                      ${stateOptionsHtml}
                    </select>
                    <div class="invalid-feedback">Please select a state or region.</div>
                  </div>
                  <div class="col-md-3">
                    <label for="pay-zip" class="form-label fw-medium">ZIP / Postal Code <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="pay-zip" placeholder="e.g. 11081" required value="${initialValues.payZip || ''}">
                    <div class="invalid-feedback">Please enter your postal code.</div>
                  </div>
                </div>
              </div>

              <!-- Credit Card Details -->
              <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
                <div class="d-flex flex-wrap align-items-center justify-content-between mb-3 gap-2">
                  <h3 class="h5 font-heading fw-bold mb-0">
                    <i class="fas fa-credit-card text-primary me-2"></i> 2. Card Payment
                  </h3>
                  <div id="card-type-indicator">
                    <span class="badge bg-light text-dark border">
                      <i class="far fa-credit-card me-1"></i> Allowed: Visa, MasterCard, JCB
                    </span>
                  </div>
                </div>

                <div class="row g-3">
                  <div class="col-12">
                    <label for="card-holder" class="form-label fw-medium">Cardholder Name <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="card-holder" placeholder="e.g. Aung Kyaw" required value="${initialValues.cardHolder || ''}">
                    <div class="invalid-feedback">Please enter cardholder name.</div>
                  </div>
                  <div class="col-12">
                    <label for="card-number" class="form-label fw-medium">Card Number <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <input type="text" class="form-control" id="card-number" placeholder="e.g. 5124 0000 0000 8892" required maxlength="19" value="${initialValues.cardNumber || ''}">
                      <span class="input-group-text text-muted" id="card-icon-slot"><i class="fas fa-lock"></i></span>
                    </div>
                    <div id="card-number-error" class="invalid-feedback d-none mt-1">Please enter a valid Visa, MasterCard, or JCB card number.</div>
                  </div>
                  <div class="col-md-6">
                    <label for="card-expiry" class="form-label fw-medium">Expiration Date (MM/YY) <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="card-expiry" placeholder="MM/YY (e.g. 08/28)" required maxlength="5" value="${initialValues.cardExpiry || ''}">
                    <div class="invalid-feedback">Please enter card expiration date.</div>
                  </div>
                  <div class="col-md-6">
                    <label for="card-cvv" class="form-label fw-medium">CVV / Security Code <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="card-cvv" placeholder="e.g. 123" required maxlength="4" value="${initialValues.cardCvv || ''}">
                    <div class="invalid-feedback">Please enter 3 or 4 digit CVV.</div>
                  </div>
                </div>
              </div>

              <button type="submit" id="btn-submit-payment" class="btn btn-primary btn-lg w-100 rounded-pill shadow-sm py-3 font-weight-bold">
                <i class="fas fa-shield-alt me-2"></i> Proceed to Checkout ($${grandTotal.toFixed(2)})
              </button>
            </form>
          </div>

          <!-- Order Summary Sidebar -->
          <div class="col-lg-5">
            <div class="card border-0 shadow-sm rounded-4 p-4 bg-white sticky-top" style="top: 90px;">
              <h3 class="h5 font-heading fw-bold mb-3 border-bottom pb-2">Order Summary (${items.length} Items)</h3>
              <div class="mb-3">
                ${itemsSummaryHtml}
              </div>

              <div class="d-flex justify-content-between mb-2 text-muted">
                <span>Subtotal</span>
                <span>$${subtotal.toFixed(2)}</span>
              </div>
              <div class="d-flex justify-content-between mb-2 text-muted">
                <span>Estimated Tax (8%)</span>
                <span>$${tax.toFixed(2)}</span>
              </div>
              <div class="d-flex justify-content-between mb-3 text-muted">
                <span>Shipping</span>
                <span>${shipping === 0 ? '<span class="text-success fw-bold">FREE</span>' : '$' + shipping.toFixed(2)}</span>
              </div>
              <hr>
              <div class="d-flex justify-content-between mb-4 h4 fw-bold text-dark">
                <span>Grand Total</span>
                <span class="text-primary">$${grandTotal.toFixed(2)}</span>
              </div>

              <div class="p-3 bg-cream rounded-3 border">
                <div class="d-flex align-items-center gap-2 mb-1">
                  <i class="fas fa-truck text-primary"></i>
                  <strong class="small text-dark">Estimated Delivery</strong>
                </div>
                <p class="text-muted extra-small mb-0">Delivered in <strong>2-3 Business Days</strong> with eco-friendly packaging.</p>
              </div>
            </div>
          </div>
        </div>
      `;

      $container.html(paymentFormHtml);

      // Card Type Detection helper
      function getCardType(cardNumber) {
        const clean = cardNumber.replace(/\D/g, '');
        if (!clean) return { type: 'empty', name: '', icon: 'far fa-credit-card', color: 'bg-light text-dark border' };

        // Visa: starts with 4
        if (/^4/.test(clean)) {
          return { type: 'visa', name: 'Visa', icon: 'fab fa-cc-visa me-1', color: 'bg-primary text-white' };
        }
        // MasterCard: starts with 51-55, 5124, 2221-2720
        if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(clean)) {
          return { type: 'mastercard', name: 'MasterCard', icon: 'fab fa-cc-mastercard me-1', color: 'bg-warning text-dark' };
        }
        // JCB: starts with 3528-3589 or 35
        if (/^(352[89]|35[3-8]\d|35)/.test(clean)) {
          return { type: 'jcb', name: 'JCB', icon: 'fab fa-cc-jcb me-1', color: 'bg-success text-white' };
        }

        return { type: 'unsupported', name: 'Unsupported Card', icon: 'fas fa-exclamation-triangle me-1', color: 'bg-danger text-white' };
      }

      // Live card type indicator & formatting
      $('#card-number').on('input keyup', function() {
        let raw = $(this).val().replace(/\D/g, '');
        if (raw.length > 16) raw = raw.substring(0, 16);
        
        let formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
        $(this).val(formatted);

        const cardInfo = getCardType(raw);
        const $indicator = $('#card-type-indicator');
        const $errorMsg = $('#card-number-error');

        if (cardInfo.type === 'empty') {
          $indicator.html(`<span class="badge bg-light text-dark border"><i class="far fa-credit-card me-1"></i> Allowed: Visa, MasterCard, JCB</span>`);
          $errorMsg.addClass('d-none');
          $(this).removeClass('is-invalid');
        } else if (cardInfo.type === 'unsupported') {
          $indicator.html(`<span class="badge ${cardInfo.color} fs-6 px-3"><i class="${cardInfo.icon}"></i> Unsupported Card</span>`);
          $errorMsg.removeClass('d-none').text('Only Visa, MasterCard, and JCB cards are accepted.').show();
          $(this).addClass('is-invalid');
        } else {
          $indicator.html(`<span class="badge ${cardInfo.color} fs-6 px-3"><i class="${cardInfo.icon}"></i> ${cardInfo.name}</span>`);
          $errorMsg.addClass('d-none').hide();
          $(this).removeClass('is-invalid');
        }
      });

      // Trigger initial card check if value exists
      if ($('#card-number').val()) {
        $('#card-number').trigger('input');
      }

      // Express Pay click redirection
      $('.btn-express-pay').off('click').on('click', function() {
        const method = $(this).data('method');
        window.location.href = `express-pay.html?method=${encodeURIComponent(method)}`;
      });

      // Handle Form Submission -> 10s Confirmation Page
      $('#payment-checkout-form').off('submit').on('submit', function(e) {
        e.preventDefault();
        
        const form = this;
        const cardNumRaw = $('#card-number').val().replace(/\D/g, '');
        const cardInfo = getCardType(cardNumRaw);

        if (cardInfo.type === 'unsupported' || cardNumRaw.length < 15) {
          $('#card-number').addClass('is-invalid');
          $('#card-number-error').removeClass('d-none').text('Only Visa, MasterCard, and JCB cards are accepted. Please enter a valid card number.').show();
          $('#card-number').focus();
          return;
        }

        if (!form.checkValidity()) {
          e.stopPropagation();
          $(form).addClass('was-validated');
          return;
        }

        const customerData = {
          payEmail: $('#pay-email').val().trim(),
          payPhone: $('#pay-phone').val().trim(),
          payName: $('#pay-name').val().trim(),
          payAddress: $('#pay-address').val().trim(),
          payCity: $('#pay-city').val(),
          payState: $('#pay-state').val(),
          payZip: $('#pay-zip').val().trim(),
          cardHolder: $('#card-holder').val().trim(),
          cardNumber: $('#card-number').val().trim(),
          cardExpiry: $('#card-expiry').val().trim(),
          cardCvv: $('#card-cvv').val().trim()
        };

        renderConfirmationScreen(customerData);
      });
    }

    let countdownTimer = null;

    function renderConfirmationScreen(customerData) {
      if (countdownTimer) clearInterval(countdownTimer);

      let secondsLeft = 10;

      const confirmHtml = `
        <div class="row justify-content-center my-4">
          <div class="col-lg-8">
            <div class="card border-0 shadow-lg rounded-4 p-4 p-md-5 bg-white">
              <div class="text-center mb-4">
                <div class="badge bg-warning text-dark px-3 py-2 rounded-pill fs-6 mb-2">
                  <i class="fas fa-clock me-1"></i> Order Confirmation Review
                </div>
                <h2 class="h3 font-heading fw-bold text-dark">Review Your Order &amp; Shipping Details</h2>
                <p class="text-muted">Please check your details below. Payment will proceed automatically in <strong id="countdown-ticker" class="text-primary fs-4">10</strong> seconds.</p>
                <div class="progress my-3" style="height: 8px;">
                  <div id="countdown-progress" class="progress-bar progress-bar-striped progress-bar-animated bg-primary" role="progressbar" style="width: 100%;"></div>
                </div>
              </div>

              <div class="bg-light p-4 rounded-3 border mb-4">
                <h4 class="h6 text-muted text-uppercase fw-bold mb-3 border-bottom pb-2">Customer &amp; Shipping Information</h4>
                <div class="row g-3">
                  <div class="col-md-6">
                    <span class="text-muted small d-block">Full Name:</span>
                    <strong class="text-dark fs-6">${customerData.payName}</strong>
                  </div>
                  <div class="col-md-6">
                    <span class="text-muted small d-block">Email Address:</span>
                    <strong class="text-dark fs-6">${customerData.payEmail}</strong>
                  </div>
                  <div class="col-md-6">
                    <span class="text-muted small d-block">Phone Number:</span>
                    <strong class="text-dark fs-6">${customerData.payPhone}</strong>
                  </div>
                  <div class="col-md-6">
                    <span class="text-muted small d-block">Payment Method:</span>
                    <strong class="text-dark fs-6">Card ending in •••• ${customerData.cardNumber.slice(-4) || '8892'}</strong>
                  </div>
                  <div class="col-12">
                    <span class="text-muted small d-block">Shipping Address:</span>
                    <strong class="text-dark fs-6">${customerData.payAddress}, ${customerData.payCity}, ${customerData.payState} ${customerData.payZip}</strong>
                  </div>
                </div>
              </div>

              <div class="bg-cream p-4 rounded-3 border mb-4">
                <h4 class="h6 text-muted text-uppercase fw-bold mb-3 border-bottom pb-2">Payment Summary</h4>
                <div class="d-flex justify-content-between mb-1 text-muted">
                  <span>Subtotal (${items.length} items):</span>
                  <span>$${subtotal.toFixed(2)}</span>
                </div>
                <div class="d-flex justify-content-between mb-1 text-muted">
                  <span>Estimated Tax (8%):</span>
                  <span>$${tax.toFixed(2)}</span>
                </div>
                <div class="d-flex justify-content-between mb-2 text-muted">
                  <span>Shipping:</span>
                  <span>${shipping === 0 ? '<span class="text-success fw-bold">FREE</span>' : '$' + shipping.toFixed(2)}</span>
                </div>
                <div class="d-flex justify-content-between fs-5 fw-bold text-dark pt-2 border-top">
                  <span>Total Amount Due:</span>
                  <span class="text-primary">$${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div class="d-flex flex-column flex-sm-row justify-content-between gap-3">
                <button type="button" id="btn-edit-details" class="btn btn-outline-secondary btn-lg rounded-pill px-4">
                  <i class="fas fa-edit me-1"></i> Edit Information
                </button>
                <button type="button" id="btn-confirm-now" class="btn btn-primary btn-lg rounded-pill px-5 fw-bold">
                  <i class="fas fa-check-circle me-1"></i> Confirm &amp; Pay Now
                </button>
              </div>
            </div>
          </div>
        </div>
      `;

      $container.html(confirmHtml);

      if (window.announceToScreenReader) {
        window.announceToScreenReader(`Confirmation screen loaded. Order will process automatically in 10 seconds or click Confirm and Pay Now.`);
      }

      function executePaymentSuccess() {
        if (countdownTimer) clearInterval(countdownTimer);

        // Clear cart
        localStorage.removeItem('bb_cart_items');
        window.CartEngine.updateBadge();

        const orderId = 'BB-' + Math.floor(100000 + Math.random() * 900000);

        const successHtml = `
          <div class="text-center py-5 bg-white rounded-4 shadow-lg p-5 my-4 border border-success-subtle">
            <div class="text-success mb-3">
              <i class="fas fa-check-circle fa-5x"></i>
            </div>
            <h2 class="h3 font-heading fw-bold mb-2">Payment Successful!</h2>
            <p class="lead text-muted mb-4">Thank you for your order, <strong>${customerData.payName}</strong>! We are preparing your fresh artisan coffee.</p>
            <div class="badge bg-cream text-dark p-3 fs-6 rounded-pill mb-4 border">
              Order Confirmation ID: <strong>#${orderId}</strong>
            </div>

            <div class="row justify-content-center mb-4 text-start">
              <div class="col-md-9">
                <div class="p-4 bg-light rounded-3 border">
                  <h4 class="h6 text-muted text-uppercase fw-bold mb-3 border-bottom pb-2"><i class="fas fa-receipt text-primary me-2"></i> CONFIRMED ORDER &amp; SHIPPING DETAILS</h4>
                  
                  <div class="row g-3 mb-3">
                    <div class="col-sm-6">
                      <span class="text-muted extra-small d-block text-uppercase">Customer Name</span>
                      <strong class="text-dark">${customerData.payName}</strong>
                    </div>
                    <div class="col-sm-6">
                      <span class="text-muted extra-small d-block text-uppercase">Email Address</span>
                      <strong class="text-dark">${customerData.payEmail}</strong>
                    </div>
                    <div class="col-sm-6">
                      <span class="text-muted extra-small d-block text-uppercase">Phone Number</span>
                      <strong class="text-dark">${customerData.payPhone}</strong>
                    </div>
                    <div class="col-sm-6">
                      <span class="text-muted extra-small d-block text-uppercase">Amount Paid</span>
                      <strong class="text-primary fs-5">$${grandTotal.toFixed(2)}</strong>
                    </div>
                  </div>

                  <div class="p-3 bg-white rounded-3 border">
                    <span class="text-muted extra-small d-block text-uppercase mb-1"><i class="fas fa-map-marker-alt text-danger me-1"></i> Shipping Address</span>
                    <p class="mb-0 text-dark fw-semibold">
                      ${customerData.payAddress}<br>
                      ${customerData.payCity}, ${customerData.payState} ${customerData.payZip}
                    </p>
                  </div>

                  <div class="d-flex justify-content-between align-items-center mt-3 pt-2 border-top extra-small text-muted">
                    <span><i class="fas fa-truck text-success me-1"></i> Estimated Delivery: <strong>2-3 Business Days</strong></span>
                    <span><i class="fas fa-shield-alt text-primary me-1"></i> Payment Encrypted &amp; Verified</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-center gap-3">
              <a href="index.html" class="btn btn-primary btn-lg rounded-pill px-4"><i class="fas fa-home me-2"></i> Return Home</a>
              <a href="classics.html" class="btn btn-outline-secondary btn-lg rounded-pill px-4"><i class="fas fa-coffee me-2"></i> Continue Shopping</a>
            </div>
          </div>
        `;

        $container.html(successHtml);

        if (window.announceToScreenReader) {
          window.announceToScreenReader(`Payment successful! Order confirmed for ${customerData.payName} with order ID ${orderId}.`);
        }
      }

      // Start 10 second ticker
      countdownTimer = setInterval(() => {
        secondsLeft -= 1;
        if (secondsLeft < 0) secondsLeft = 0;
        $('#countdown-ticker').text(secondsLeft);
        const pct = (secondsLeft / 10) * 100;
        $('#countdown-progress').css('width', pct + '%');

        if (secondsLeft <= 0) {
          clearInterval(countdownTimer);
          executePaymentSuccess();
        }
      }, 1000);

      // Handle Confirm Now button click
      $('#btn-confirm-now').off('click').on('click', function() {
        executePaymentSuccess();
      });

      // Handle Edit Details button click
      $('#btn-edit-details').off('click').on('click', function() {
        if (countdownTimer) clearInterval(countdownTimer);
        renderForm(customerData);
      });
    }

    renderForm();
  };

  // Document Ready Initialization
  $(document).ready(function() {
    initBootstrapPlugins();
    setupCartTriggers();
    setupQuickViewModal();
    window.renderCartPage();
    window.renderPaymentPage();

    // Delegate remove button click event for any static or dynamic item
    $(document).on('click', '.btn-cart-remove', function(e) {
      e.preventDefault();
      const id = $(this).data('id');
      if (id) {
        window.CartEngine.removeItem(id);
      }
    });

    // Event Registration Form Handler
    $(document).on('submit', '#event-registration-form, .registration-section form, form[action^="mailto:"]', function(e) {
      e.preventDefault();
      
      const $form = $(this);
      const firstName = $form.find('#first-name').val() || '';
      const lastName = $form.find('#last-name').val() || '';
      const email = $form.find('#email').val() || '';
      const $eventSelect = $form.find('#event-select');
      const eventName = $eventSelect.find('option:selected').text() || $eventSelect.val() || 'Coffee Event';
      const recipient = $form.attr('action') ? $form.attr('action').replace(/^mailto:/i, '') : 'events@beanboutique.com';
      
      const fullName = (firstName + ' ' + lastName).trim() || 'Guest';
      const subject = `Event Registration: ${eventName}`;
      const body = `Hello Bean Boutique Team,\n\nI would like to register for the following event:\n- Event: ${eventName}\n- Name: ${fullName}\n- Email: ${email}\n\nThank you!\n${fullName}`;
      
      const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      let $feedback = $form.find('.registration-feedback');
      if ($feedback.length === 0) {
        $feedback = $('<div class="registration-feedback mt-4 p-4 bg-white border border-success border-2 rounded-4 text-center shadow-sm"></div>');
        $form.append($feedback);
      }

      $feedback.html(`
        <div class="text-success mb-2"><i class="fas fa-check-circle fa-3x"></i></div>
        <h3 class="h4 fw-bold text-dark mb-2">Registration Request Ready!</h3>
        <p class="text-muted mb-3">Thank you, <strong>${fullName}</strong>! We have prepared your email registration for <strong>${eventName}</strong>.</p>
        <div class="p-3 bg-light rounded-3 text-start small text-muted mb-3 font-monospace border">
          <div><strong>To:</strong> ${recipient}</div>
          <div><strong>Subject:</strong> ${subject}</div>
          <div><strong>Registrant:</strong> ${fullName} (${email})</div>
        </div>
        <div class="d-flex justify-content-center gap-2 flex-wrap">
          <a href="${mailtoUrl}" class="btn btn-primary rounded-pill px-4">
            <i class="fas fa-paper-plane me-2"></i> Launch Email App
          </a>
          <button type="button" class="btn btn-outline-secondary rounded-pill px-4 reset-reg-form">
            Register Another Person
          </button>
        </div>
      `);

      if (window.announceToScreenReader) {
        window.announceToScreenReader(`Registration details created for ${fullName} for ${eventName}. Email client launched.`);
      }

      // Try triggering mailto link automatically
      try {
        window.location.href = mailtoUrl;
      } catch (err) {
        console.log('Mailto trigger handled:', err);
      }
    });

    $(document).on('click', '.reset-reg-form', function() {
      const $form = $(this).closest('form');
      $form[0].reset();
      $form.find('.registration-feedback').remove();
    });
  });

})(jQuery);
