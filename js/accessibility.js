/**
 * Bean Boutique — Accessibility (a11y) Suite
 * Features for users with visual, hearing, motor, or cognitive impairments.
 */

(function($) {
  'use strict';

  // State object stored in localStorage for persistent user preferences
  const defaultState = {
    contrast: 'default', // 'default', 'high-contrast', 'dark', 'monochrome'
    fontSize: 100,      // percentage: 100, 110, 120, 130, 140
    dyslexicFont: false,
    readingRuler: false,
    largeCursor: false,
    highlightLinks: false,
    stopAnimations: false,
    ttsActive: false
  };

  let a11yState = Object.assign({}, defaultState, JSON.parse(localStorage.getItem('bb_a11y_settings') || '{}'));

  // Save state
  function saveState() {
    localStorage.setItem('bb_a11y_settings', JSON.stringify(a11yState));
    applySettings();
  }

  // Apply CSS classes and styles based on state
  function applySettings() {
    const $html = $('html');
    const $body = $('body');

    // 1. Contrast
    $html.removeClass('a11y-high-contrast a11y-dark-mode a11y-monochrome');
    if (a11yState.contrast === 'high-contrast') {
      $html.addClass('a11y-high-contrast');
    } else if (a11yState.contrast === 'dark') {
      $html.addClass('a11y-dark-mode');
    } else if (a11yState.contrast === 'monochrome') {
      $html.addClass('a11y-monochrome');
    }

    // 2. Font Size
    $html.css('font-size', a11yState.fontSize + '%');
    $('#a11y-font-size-val').text(a11yState.fontSize + '%');

    // 3. Dyslexic Font
    if (a11yState.dyslexicFont) {
      $body.addClass('a11y-dyslexic-font');
    } else {
      $body.removeClass('a11y-dyslexic-font');
    }

    // 4. Reading Ruler
    if (a11yState.readingRuler) {
      if ($('#a11y-reading-ruler').length === 0) {
        $('body').append('<div id="a11y-reading-ruler" class="a11y-ruler"></div>');
      }
      $('#a11y-reading-ruler').show();
    } else {
      $('#a11y-reading-ruler').hide();
    }

    // 5. Large Cursor
    if (a11yState.largeCursor) {
      $body.addClass('a11y-large-cursor');
    } else {
      $body.removeClass('a11y-large-cursor');
    }

    // 6. Highlight Links
    if (a11yState.highlightLinks) {
      $body.addClass('a11y-highlight-links');
    } else {
      $body.removeClass('a11y-highlight-links');
    }

    // 7. Stop Animations
    if (a11yState.stopAnimations) {
      $body.addClass('a11y-stop-animations');
      $('.carousel').carousel('pause');
    } else {
      $body.removeClass('a11y-stop-animations');
    }

    // Update active UI buttons
    $('[data-a11y-contrast]').removeClass('active');
    $(`[data-a11y-contrast="${a11yState.contrast}"]`).addClass('active');

    $('#a11y-toggle-dyslexic').prop('checked', a11yState.dyslexicFont);
    $('#a11y-toggle-ruler').prop('checked', a11yState.readingRuler);
    $('#a11y-toggle-cursor').prop('checked', a11yState.largeCursor);
    $('#a11y-toggle-links').prop('checked', a11yState.highlightLinks);
    $('#a11y-toggle-animations').prop('checked', a11yState.stopAnimations);
  }

  // Screen Reader Live Announcements
  window.announceToScreenReader = function(message) {
    let $announcer = $('#a11y-announcer');
    if ($announcer.length === 0) {
      $announcer = $('<div id="a11y-announcer" class="visually-hidden" aria-live="polite" aria-atomic="true"></div>');
      $('body').append($announcer);
    }
    $announcer.text(message);
  };

  // Text-To-Speech (Voice Reader)
  let ttsUtterance = null;
  function speakText(text) {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }
    window.speechSynthesis.cancel(); // Stop current speech
    if (!text) return;

    ttsUtterance = new SpeechSynthesisUtterance(text);
    ttsUtterance.rate = 0.9;
    ttsUtterance.pitch = 1.0;
    
    ttsUtterance.onstart = function() {
      $('#a11y-tts-status').html('<span class="badge bg-success"><i class="fas fa-volume-up"></i> Reading aloud...</span>');
    };
    ttsUtterance.onend = function() {
      $('#a11y-tts-status').html('<span class="text-muted"><i class="fas fa-check"></i> Reading finished</span>');
    };
    ttsUtterance.onerror = function() {
      $('#a11y-tts-status').html('<span class="text-danger">Error reading text</span>');
    };

    window.speechSynthesis.speak(ttsUtterance);
  }

  function stopTextToSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      $('#a11y-tts-status').html('<span class="text-muted"><i class="fas fa-pause"></i> Speech stopped</span>');
    }
  }

  // Build Floating Widget & Modal
  function injectAccessibilityUI() {
    // 1. Skip to Content Link at top of body
    if ($('.skip-link').length === 0) {
      $('body').prepend(`
        <a href="#main-content" class="skip-link" tabindex="0">
          Skip to main content (Press Enter)
        </a>
      `);
    }

    // 2. Ensure main content wrapper has id="main-content"
    if ($('#main-content').length === 0) {
      const $mainElem = $('main').length ? $('main') : $('section').first();
      $mainElem.attr('id', 'main-content').attr('tabindex', '-1');
    }

    // 3. Floating Trigger Button
    if ($('#a11y-floating-trigger').length === 0) {
      $('body').append(`
        <div id="a11y-widget-container" class="a11y-widget-container">
          <button id="a11y-floating-trigger" class="btn btn-a11y-floating" 
                  type="button" 
                  aria-label="Open Accessibility Tools Menu (Alt + A)" 
                  title="Accessibility Tools (Alt + A)"
                  data-bs-toggle="offcanvas" 
                  data-bs-target="#a11yOffcanvas" 
                  aria-controls="a11yOffcanvas">
            <i class="fas fa-universal-access" aria-hidden="true"></i>
            <span class="a11y-badge-text">Accessibility</span>
          </button>
        </div>
      `);
    }

    // 4. Offcanvas Drawer
    if ($('#a11yOffcanvas').length === 0) {
      $('body').append(`
        <div class="offcanvas offcanvas-end a11y-offcanvas" tabindex="-1" id="a11yOffcanvas" aria-labelledby="a11yOffcanvasLabel">
          <div class="offcanvas-header bg-primary text-white">
            <h5 class="offcanvas-title d-flex align-items-center gap-2" id="a11yOffcanvasLabel">
              <i class="fas fa-universal-access" aria-hidden="true"></i> Accessibility Tools
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close accessibility menu"></button>
          </div>
          <div class="offcanvas-body">
            <div class="alert alert-info py-2 small">
              <i class="fas fa-keyboard"></i> <strong>Shortcuts:</strong> <code>Alt+A</code> (Menu), <code>Alt+S</code> (Search), <code>Alt+C</code> (Cart)
            </div>

            <!-- Voice Reader / TTS -->
            <div class="a11y-section mb-4">
              <h6><i class="fas fa-volume-up text-primary me-1"></i> Text-to-Speech Screen Reader</h6>
              <p class="small text-muted mb-2">Select any text on the page or click below to read the current section aloud.</p>
              <div class="d-flex gap-2 mb-2">
                <button id="a11y-btn-read-page" class="btn btn-sm btn-outline-primary flex-fill">
                  <i class="fas fa-play"></i> Read Main Content
                </button>
                <button id="a11y-btn-read-selection" class="btn btn-sm btn-outline-secondary flex-fill">
                  <i class="fas fa-highlighter"></i> Read Selection
                </button>
                <button id="a11y-btn-stop-speech" class="btn btn-sm btn-outline-danger">
                  <i class="fas fa-stop"></i>
                </button>
              </div>
              <div id="a11y-tts-status" class="small"></div>
            </div>

            <hr>

            <!-- Text & Display Size -->
            <div class="a11y-section mb-4">
              <h6><i class="fas fa-font text-primary me-1"></i> Text Size (<span id="a11y-font-size-val">100%</span>)</h6>
              <div class="d-flex gap-2 align-items-center mb-3">
                <button id="a11y-btn-font-dec" class="btn btn-outline-secondary btn-sm flex-fill" aria-label="Decrease text size"><i class="fas fa-minus"></i> A-</button>
                <button id="a11y-btn-font-reset" class="btn btn-outline-secondary btn-sm" aria-label="Reset text size"><i class="fas fa-undo"></i> Reset</button>
                <button id="a11y-btn-font-inc" class="btn btn-outline-secondary btn-sm flex-fill" aria-label="Increase text size"><i class="fas fa-plus"></i> A+</button>
              </div>

              <div class="form-check form-switch mb-2">
                <input class="form-check-input" type="checkbox" id="a11y-toggle-dyslexic">
                <label class="form-check-label fw-medium" for="a11y-toggle-dyslexic">
                  Dyslexia-Friendly Font
                </label>
              </div>
            </div>

            <hr>

            <!-- Contrast Modes -->
            <div class="a11y-section mb-4">
              <h6><i class="fas fa-adjust text-primary me-1"></i> Color Contrast Modes</h6>
              <div class="grid gap-2 d-grid" style="grid-template-columns: 1fr 1fr;">
                <button class="btn btn-sm btn-outline-dark text-start" data-a11y-contrast="default">
                  <i class="fas fa-sun me-1"></i> Default
                </button>
                <button class="btn btn-sm btn-outline-warning text-start bg-dark text-warning fw-bold" data-a11y-contrast="high-contrast">
                  <i class="fas fa-eye me-1"></i> High Contrast
                </button>
                <button class="btn btn-sm btn-dark text-start" data-a11y-contrast="dark">
                  <i class="fas fa-moon me-1"></i> Dark Theme
                </button>
                <button class="btn btn-sm btn-secondary text-start" data-a11y-contrast="monochrome">
                  <i class="fas fa-palette me-1"></i> Monocolor
                </button>
              </div>
            </div>

            <hr>

            <!-- Visual Aids & Focus -->
            <div class="a11y-section mb-4">
              <h6><i class="fas fa-low-vision text-primary me-1"></i> Visual & Motor Aids</h6>

              <div class="form-check form-switch mb-2">
                <input class="form-check-input" type="checkbox" id="a11y-toggle-ruler">
                <label class="form-check-label fw-medium" for="a11y-toggle-ruler">
                  Reading Guide Ruler
                </label>
              </div>

              <div class="form-check form-switch mb-2">
                <input class="form-check-input" type="checkbox" id="a11y-toggle-cursor">
                <label class="form-check-label fw-medium" for="a11y-toggle-cursor">
                  Large Target Mouse Cursor
                </label>
              </div>

              <div class="form-check form-switch mb-2">
                <input class="form-check-input" type="checkbox" id="a11y-toggle-links">
                <label class="form-check-label fw-medium" for="a11y-toggle-links">
                  Highlight Links &amp; Buttons
                </label>
              </div>

              <div class="form-check form-switch mb-2">
                <input class="form-check-input" type="checkbox" id="a11y-toggle-animations">
                <label class="form-check-label fw-medium" for="a11y-toggle-animations">
                  Pause Animations (Reduce Motion)
                </label>
              </div>
            </div>

            <div class="pt-3 border-top d-flex gap-2">
              <button id="a11y-btn-reset-all" class="btn btn-outline-danger btn-sm w-100">
                <i class="fas fa-trash-alt me-1"></i> Reset All Settings
              </button>
            </div>
          </div>
        </div>
      `);
    }
  }

  // Event Handlers
  $(document).ready(function() {
    injectAccessibilityUI();
    applySettings();

    // Font size triggers
    $('#a11y-btn-font-inc').on('click', function() {
      if (a11yState.fontSize < 150) {
        a11yState.fontSize += 10;
        saveState();
        announceToScreenReader('Text size increased to ' + a11yState.fontSize + '%');
      }
    });

    $('#a11y-btn-font-dec').on('click', function() {
      if (a11yState.fontSize > 90) {
        a11yState.fontSize -= 10;
        saveState();
        announceToScreenReader('Text size decreased to ' + a11yState.fontSize + '%');
      }
    });

    $('#a11y-btn-font-reset').on('click', function() {
      a11yState.fontSize = 100;
      saveState();
      announceToScreenReader('Text size reset to default');
    });

    // Contrast buttons
    $(document).on('click', '[data-a11y-contrast]', function() {
      const mode = $(this).data('a11y-contrast');
      a11yState.contrast = mode;
      saveState();
      announceToScreenReader('Color theme changed to ' + mode);
    });

    // Switches
    $('#a11y-toggle-dyslexic').on('change', function() {
      a11yState.dyslexicFont = $(this).is(':checked');
      saveState();
    });

    $('#a11y-toggle-ruler').on('change', function() {
      a11yState.readingRuler = $(this).is(':checked');
      saveState();
    });

    $('#a11y-toggle-cursor').on('change', function() {
      a11yState.largeCursor = $(this).is(':checked');
      saveState();
    });

    $('#a11y-toggle-links').on('change', function() {
      a11yState.highlightLinks = $(this).is(':checked');
      saveState();
    });

    $('#a11y-toggle-animations').on('change', function() {
      a11yState.stopAnimations = $(this).is(':checked');
      saveState();
    });

    // Reset All
    $('#a11y-btn-reset-all').on('click', function() {
      a11yState = Object.assign({}, defaultState);
      stopTextToSpeech();
      saveState();
      announceToScreenReader('All accessibility preferences reset to default');
    });

    // Reading Ruler Mouse Tracking
    $(document).on('mousemove', function(e) {
      if (a11yState.readingRuler) {
        $('#a11y-reading-ruler').css('top', e.clientY + 'px');
      }
    });

    // Voice Reader / TTS triggers
    $('#a11y-btn-read-page').on('click', function() {
      const mainText = $('#main-content').text() || $('body').text();
      speakText(mainText.substring(0, 1500)); // Read first block
    });

    $('#a11y-btn-read-selection').on('click', function() {
      const selection = window.getSelection().toString();
      if (selection && selection.trim().length > 0) {
        speakText(selection);
      } else {
        alert('Please select/highlight some text on the page first.');
      }
    });

    $('#a11y-btn-stop-speech').on('click', function() {
      stopTextToSpeech();
    });

    // Keyboard Shortcuts Listener
    $(document).on('keydown', function(e) {
      // Alt + A => Toggle Accessibility Menu
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        const bsOffcanvas = bootstrap.Offcanvas.getOrCreateInstance('#a11yOffcanvas');
        bsOffcanvas.toggle();
      }
      // Alt + S => Jump focus to navbar search input
      if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        $('.nav-search-form input[type="search"]').first().focus();
      }
      // Alt + C => Go to Cart page
      if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        window.location.href = 'cart.html';
      }
      // Alt + H => Go to Home page
      if (e.altKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        window.location.href = 'index.html';
      }
      // Esc => close offcanvas / modals
      if (e.key === 'Escape') {
        stopTextToSpeech();
      }
    });
  });

})(jQuery);
