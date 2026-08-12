/**
 * Bean Boutique — Advanced Search & Smart Routing Engine
 * Provides live search, autocomplete suggestions, dynamic product filtering,
 * keyword highlighting, and direct page redirection.
 */

(function($) {
  'use strict';

  // Comprehensive Catalog & Routing Directory
  const catalogData = [
    // Coffee Items
    { id: 'morning-glory', title: 'Morning Glory Blend', category: 'coffee', page: 'classics.html', price: '$16.99', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80', desc: 'Our signature medium roast with notes of caramel and citrus.' },
    { id: 'ethiopian', title: 'Ethiopian Yirgacheffe', category: 'coffee', page: 'best-selections.html', price: '$19.99', img: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80', desc: 'Floral floral notes with bright bergamot and wild jasmine.' },
    { id: 'colombian', title: 'Colombian Supremo', category: 'coffee', page: 'classics.html', price: '$17.99', img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80', desc: 'Balanced single-origin roast with chocolate and toasted hazelnut.' },
    { id: 'midnight-ember', title: 'Midnight Ember Dark Roast', category: 'coffee', page: 'classics.html', price: '$18.49', img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80', desc: 'Bold dark roast coffee with smoky cacao, spice, and full body.' },
    { id: 'kenyan', title: 'Kenyan AA Reserve', category: 'coffee', page: 'best-selections.html', price: '$21.99', img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80', desc: 'Vibrant blackcurrant and winey acidity in a high-elevation bean.' },
    { id: 'decaf', title: 'Swiss Water Decaf', category: 'coffee', page: 'classics.html', price: '$17.49', img: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&q=80', desc: 'Chemical-free decaffeinated coffee with rich brown sugar notes.' },
    { id: 'origin-story', title: 'Origin Story Blend', category: 'coffee', page: 'cool-story.html', price: '$22.99', img: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80', desc: 'Artisan blend telling the heritage of small-batch coffee farming.' },

    // Bean Samplers & Taster Sets
    { id: 'african-sampler', title: 'African Origin Bean Sampler', category: 'coffee', page: 'bean-samplers.html', price: '$24.99', img: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80', desc: 'Features Ethiopian, Kenyan, and Rwandan whole coffee beans.' },
    { id: 'roaster-flight', title: "Roaster's Choice Bean Flight", category: 'coffee', page: 'bean-samplers.html', price: '$28.50', img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80', desc: 'Curated rotation of 4 micro-lot whole bean coffee roasts.' },

    // Equipment
    { id: 'espresso-machine', title: 'Pro Espresso Machine', category: 'equipment', page: 'electric-machines.html', price: '$899.00', img: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&q=80', desc: 'Professional espresso maker with dual boiler and PID temp control.' },
    { id: 'french-press', title: 'Classic French Press', category: 'equipment', page: 'immersion-brewers.html', price: '$34.99', img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80', desc: 'Borosilicate glass plunger press for full-bodied immersion coffee.' },
    { id: 'grinder', title: 'Burr Grinder Pro', category: 'equipment', page: 'essentials.html', price: '$149.99', img: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&q=80', desc: '40mm stainless steel conical burr grinder with 30 precision settings.' },
    { id: 'pour-over', title: 'Pour-Over Starter Set', category: 'equipment', page: 'essentials.html', price: '$79.99', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80', desc: 'Includes glass dripper, gooseneck kettle, server, and unbleached filters.' },
    { id: 'aeropress', title: 'AeroPress Go Travel', category: 'equipment', page: 'immersion-brewers.html', price: '$39.99', img: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&q=80', desc: 'Compact air-pressure espresso and coffee maker for home and travel.' },
    { id: 'moka-pot', title: 'Moka Pot Stovetop', category: 'equipment', page: 'immersion-brewers.html', price: '$29.99', img: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&q=80', desc: 'Traditional Italian stovetop espresso brewer made of durable aluminum.' }
  ];

  // Direct Page Topic Routing Map
  const topicRoutes = [
    { keywords: ['classics', 'classic', 'roast', 'blend', 'coffee', 'bean', 'beans'], page: 'classics.html', title: 'Classics Coffee Beans' },
    { keywords: ['sampler', 'samplers', 'taster', 'flight', 'pack', 'tasting'], page: 'bean-samplers.html', title: 'Bean Samplers & Tasters' },
    { keywords: ['cool', 'story', 'heritage', 'origin', 'farm'], page: 'cool-story.html', title: 'Cool Story Blends' },
    { keywords: ['best', 'selection', 'selections', 'reserve', 'yirgacheffe', 'kenyan'], page: 'best-selections.html', title: 'Best Selections' },
    { keywords: ['immersion', 'french press', 'aeropress', 'moka', 'brewer', 'brewers'], page: 'immersion-brewers.html', title: 'Immersion Brewers' },
    { keywords: ['electric', 'machine', 'espresso', 'maker', 'grinder'], page: 'electric-machines.html', title: 'Electric Machines' },
    { keywords: ['essential', 'essentials', 'filter', 'kettle', 'scale', 'accessories'], page: 'essentials.html', title: 'Brewing Essentials' },
    { keywords: ['event', 'events', 'workshop', 'cupping', 'tasting', 'class'], page: 'events.html', title: 'Community Events' },
    { keywords: ['about', 'story', 'team', 'roaster'], page: 'about.html', title: 'About Bean Boutique' },
    { keywords: ['offer', 'offers', 'deal', 'discount', 'sale', 'subscribe'], page: 'offers.html', title: 'Special Offers' },
    { keywords: ['cart', 'checkout', 'basket'], page: 'cart.html', title: 'Shopping Cart' }
  ];

  // Helper: Get URL Query Parameter
  function getQueryParam(param) {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get(param) || '';
  }

  // Find exact/best relevant redirect page for search query
  function findBestPageRedirect(query) {
    const q = query.toLowerCase().trim();
    if (!q) return null;

    // 1. Direct item match check
    for (const item of catalogData) {
      if (item.title.toLowerCase() === q || item.id === q) {
        return { page: item.page, title: item.title, exactItem: item };
      }
    }

    // 2. Direct topic keyword match check
    for (const route of topicRoutes) {
      for (const kw of route.keywords) {
        if (q === kw || q.includes(kw)) {
          return { page: route.page, title: route.title };
        }
      }
    }

    return null;
  }

  // Initialize Navbar Live Search Auto-Suggest
  function setupNavbarLiveSearch() {
    $('.nav-search-form').each(function() {
      const $form = $(this);
      const $input = $form.find('input[type="search"]');

      if ($input.length === 0) return;

      // Wrap form in container for relative dropdown positioning
      if (!$form.hasClass('position-relative')) {
        $form.addClass('position-relative');
      }

      // Create live results dropdown container if not exists
      let $resultsBox = $form.find('.search-autocomplete-box');
      if ($resultsBox.length === 0) {
        $resultsBox = $(`
          <div class="search-autocomplete-box shadow-lg rounded-3 border-0 bg-white" 
               style="display:none; position:absolute; top:100%; left:0; right:0; z-index:1050; margin-top:6px; max-height:380px; overflow-y:auto;"
               aria-label="Search suggestions" role="listbox">
          </div>
        `);
        $form.append($resultsBox);
      }

      // Input event for live typing
      $input.on('input focus', function() {
        const query = $(this).val().trim().toLowerCase();
        if (query.length < 2) {
          $resultsBox.hide().empty();
          return;
        }

        const directRedirect = findBestPageRedirect(query);
        const matches = catalogData.filter(item => 
          item.title.toLowerCase().includes(query) || 
          item.desc.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );

        let html = '';

        if (directRedirect) {
          html += `
            <div class="p-2 border-bottom bg-light">
              <span class="badge bg-primary mb-1">Direct Page Match</span>
              <a href="${directRedirect.page}" class="d-flex align-items-center justify-content-between text-dark fw-semibold text-decoration-none small hover-bg-cream p-1 rounded">
                <span><i class="fas fa-arrow-right text-primary me-2"></i> Go to <strong>${directRedirect.title}</strong></span>
                <i class="fas fa-chevron-right text-muted small"></i>
              </a>
            </div>
          `;
        }

        if (matches.length > 0) {
          html += '<div class="p-2 text-muted uppercase extra-small fw-bold border-bottom">Matching Products (' + matches.length + ')</div>';
          matches.slice(0, 5).forEach(item => {
            html += `
              <a href="${item.page}#${item.id}" class="d-flex align-items-center gap-2 p-2 border-bottom text-decoration-none text-dark hover-bg-cream" role="option">
                <img src="${item.img}" alt="${item.title}" style="width: 40px; height: 40px; object-fit: cover;" class="rounded">
                <div class="flex-fill overflow-hidden">
                  <div class="fw-semibold text-truncate small">${highlightText(item.title, query)}</div>
                  <div class="text-muted extra-small">${item.price} &bull; ${item.category}</div>
                </div>
                <i class="fas fa-external-link-alt text-muted small ms-2"></i>
              </a>
            `;
          });
          html += `
            <a href="search.html?q=${encodeURIComponent(query)}" class="d-block p-2 text-center bg-primary text-white fw-medium text-decoration-none small rounded-bottom">
              View all results for "${query}" &rarr;
            </a>
          `;
        } else if (!directRedirect) {
          html = `
            <div class="p-3 text-center text-muted small">
              <i class="fas fa-search me-1"></i> No matching products found.
              <a href="search.html?q=${encodeURIComponent(query)}" class="d-block mt-2 text-primary fw-semibold">Try full search page &rarr;</a>
            </div>
          `;
        }

        $resultsBox.html(html).show();
      });

      // Submit Form Handler: Smart Redirection
      $form.on('submit', function(e) {
        const query = $input.val().trim();
        if (!query) return;

        const bestRedirect = findBestPageRedirect(query);
        // If query directly matches a specific product or subpage, redirect user immediately!
        if (bestRedirect && !$form.data('force-search-page')) {
          e.preventDefault();
          window.location.href = bestRedirect.page + (bestRedirect.exactItem ? '#' + bestRedirect.exactItem.id : '');
        }
      });

      // Hide dropdown when clicking outside
      $(document).on('click', function(e) {
        if (!$(e.target).closest($form).length) {
          $resultsBox.hide();
        }
      });
    });
  }

  // Highlight matching keyword text
  function highlightText(text, keyword) {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-warning text-dark p-0 px-1 rounded">$1</mark>');
  }

  // Handle Search Page (`search.html?q=...`)
  function initSearchPage() {
    if (window.location.pathname.indexOf('search.html') === -1) return;

    const searchQuery = getQueryParam('q').trim();
    const $searchHeader = $('.search-hero');
    const $catalogGrid = $('.catalog-grid');
    const $tagsContainer = $('.search-tags');

    // Populate search input in hero or search forms
    if (searchQuery) {
      $('.nav-search-form input[type="search"]').val(searchQuery);
      if ($('#search-hero-input').length) {
        $('#search-hero-input').val(searchQuery);
      }
    }

    // Direct Match Alert Banner
    const directRedirect = findBestPageRedirect(searchQuery);
    if (directRedirect && searchQuery) {
      $('.search-hero .container').append(`
        <div class="alert alert-warning border-2 border-warning d-flex align-items-center justify-content-between my-3 shadow-sm rounded-3 text-dark">
          <div>
            <i class="fas fa-compass fa-lg me-2 text-dark"></i>
            <strong>Looking for ${directRedirect.title}?</strong> We have a dedicated category page for this!
          </div>
          <a href="${directRedirect.page}" class="btn btn-dark btn-sm rounded-pill fw-bold px-3 ms-2">
            Go to ${directRedirect.title} <i class="fas fa-arrow-right ms-1"></i>
          </a>
        </div>
      `);
    }

    // Filter Products based on search query
    function renderFilteredProducts() {
      const q = searchQuery.toLowerCase();
      const currentCategory = $('input[name="search-filter"]:checked').attr('id'); // 'filter-all', 'filter-coffee', 'filter-equipment'

      let matchesCount = 0;

      $('.product-card').each(function() {
        const $card = $(this);
        const title = $card.find('h3').text().toLowerCase();
        const desc = $card.find('p').text().toLowerCase();
        const type = $card.data('type'); // 'coffee', 'equipment'

        let matchesQuery = !q || title.includes(q) || desc.includes(q);
        let matchesType = true;

        if (currentCategory === 'filter-coffee') {
          matchesType = (type === 'coffee');
        } else if (currentCategory === 'filter-equipment') {
          matchesType = (type === 'equipment');
        }

        if (matchesQuery && matchesType) {
          $card.show().addClass('animate-fade-in');
          matchesCount++;

          // Highlight matching titles
          if (q) {
            const originalTitle = $card.data('orig-title') || $card.find('h3').text();
            $card.data('orig-title', originalTitle);
            $card.find('h3').html(highlightText(originalTitle, q));
          }
        } else {
          $card.hide();
        }
      });

      // Show empty state if no results
      $('#no-search-results').remove();
      if (matchesCount === 0) {
        $catalogGrid.append(`
          <div id="no-search-results" class="col-12 text-center py-5">
            <i class="fas fa-search-minus fa-3x text-muted mb-3"></i>
            <h3>No results found for "${searchQuery}"</h3>
            <p class="text-muted">Try searching with another term like "espresso", "croissant", "french press", or "roast".</p>
            <a href="search.html" class="btn btn-outline-primary mt-2">Clear Search Filters</a>
          </div>
        `);
      }

      // Announce results to Screen Readers
      if (window.announceToScreenReader) {
        window.announceToScreenReader(`Search completed for ${searchQuery || 'all items'}. Found ${matchesCount} matching products.`);
      }
    }

    // Bind category filter changes
    $('input[name="search-filter"]').on('change', function() {
      renderFilteredProducts();
    });

    // Initial render
    renderFilteredProducts();
  }

  // Document Ready Initialization
  $(document).ready(function() {
    setupNavbarLiveSearch();
    initSearchPage();
  });

})(jQuery);
