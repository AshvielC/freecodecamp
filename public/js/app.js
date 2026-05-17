const state = {
  token: localStorage.getItem('farmconnectToken'),
  user: JSON.parse(localStorage.getItem('farmconnectUser') || 'null'),
  mockListings: [
    {
      _id: 'demo-1',
      produceName: 'Grade A Roma Tomatoes',
      category: 'Vegetables',
      description: 'Firm, freshly harvested tomatoes ideal for restaurants, sauces, and hotel buffets.',
      quantityAvailable: 420,
      unit: 'kg',
      pricePerUnit: 2.4,
      harvestDate: new Date().toISOString(),
      location: { city: 'Nakuru', region: 'Rift Valley' },
      deliveryAvailable: true,
      minimumOrderQuantity: 40,
      qualityGrade: 'grade_a',
      organicCertified: true,
      verifiedFarmer: true,
      farmerRating: 4.8,
      photos: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=900&q=80'],
      farmerProfileId: { farmName: 'Green Valley Farm', completedOrders: 128 }
    },
    {
      _id: 'demo-2',
      produceName: 'Sweet Export Mangoes',
      category: 'Fruits',
      description: 'Tree-ripened mangoes packed for resorts, juice processors, supermarkets, and exporters.',
      quantityAvailable: 900,
      unit: 'crates',
      pricePerUnit: 18,
      harvestDate: new Date().toISOString(),
      location: { city: 'Embu', region: 'Eastern' },
      deliveryAvailable: true,
      minimumOrderQuantity: 25,
      qualityGrade: 'premium',
      organicCertified: false,
      verifiedFarmer: true,
      farmerRating: 4.6,
      photos: ['https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=900&q=80'],
      farmerProfileId: { farmName: 'Sun Orchard Cooperative', completedOrders: 84 }
    },
    {
      _id: 'demo-3',
      produceName: 'Fresh Basil and Coriander Mix',
      category: 'Herbs',
      description: 'Aromatic herbs harvested to order for caterers and fine dining kitchens.',
      quantityAvailable: 140,
      unit: 'bunches',
      pricePerUnit: 1.15,
      harvestDate: new Date().toISOString(),
      location: { city: 'Kiambu', region: 'Central' },
      deliveryAvailable: false,
      minimumOrderQuantity: 30,
      qualityGrade: 'premium',
      organicCertified: true,
      verifiedFarmer: false,
      farmerRating: 4.3,
      photos: ['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=900&q=80'],
      farmerProfileId: { farmName: 'Hilltop Herbs', completedOrders: 42 }
    }
  ]
};

const pages = document.querySelectorAll('.page');
const navLinks = document.querySelector('#navLinks');
const authStatus = document.querySelector('#authStatus');
const listingGrid = document.querySelector('#listingGrid');
const listingDetail = document.querySelector('#listingDetail');
const orderForm = document.querySelector('#orderForm');

const api = async (path, options = {}) => {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(state.token && { Authorization: `Bearer ${state.token}` }),
      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
};

const showPage = pageId => {
  pages.forEach(page => page.classList.toggle('active', page.id === pageId));
  navLinks.classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const formatMoney = value => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(value || 0);
const prettyStatus = status => (status || 'pending').replaceAll('_', ' ');

const updateAuthStatus = () => {
  if (!authStatus) return;
  authStatus.textContent = state.user
    ? `Signed in as ${state.user.name} (${state.user.role}).`
    : 'Not signed in.';
};

const listingImage = listing => listing.photos?.[0] || 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80';

const renderListings = listings => {
  document.querySelector('#farmerListingsCount').textContent = String(listings.length);
  listingGrid.innerHTML = listings.map(listing => `
    <article class="listing-card">
      <img src="${listingImage(listing)}" alt="${listing.produceName}" />
      <div class="listing-body">
        <div class="badges">
          <span class="badge">${listing.category}</span>
          ${listing.verifiedFarmer ? '<span class="badge">Verified farmer</span>' : ''}
          ${listing.organicCertified ? '<span class="badge">Certified</span>' : ''}
        </div>
        <h3>${listing.produceName}</h3>
        <p class="muted">${listing.description || ''}</p>
        <span class="price">${formatMoney(listing.pricePerUnit)} / ${listing.unit}</span>
        <p><strong>${listing.quantityAvailable}</strong> ${listing.unit} available · MOQ ${listing.minimumOrderQuantity}</p>
        <p class="muted">📍 ${[listing.location?.city, listing.location?.region].filter(Boolean).join(', ') || 'Farm location'} · ⭐ ${listing.farmerRating || 0}</p>
        <button class="btn primary" type="button" data-detail="${listing._id}">View and order</button>
      </div>
    </article>
  `).join('');
};

const getCurrentListings = async (params = '') => {
  try {
    const data = await api(`/api/listings${params}`);
    return data.items.length ? data.items : state.mockListings;
  } catch (error) {
    return state.mockListings;
  }
};

const renderListingDetail = listing => {
  listingDetail.innerHTML = `
    <img src="${listingImage(listing)}" alt="${listing.produceName}" />
    <article class="card form-card">
      <div class="badges">
        <span class="badge">${listing.qualityGrade?.replace('_', ' ') || 'Grade A'}</span>
        ${listing.deliveryAvailable ? '<span class="badge">Delivery available</span>' : '<span class="badge">Pickup</span>'}
        ${listing.verifiedFarmer ? '<span class="badge">Verified farmer</span>' : ''}
      </div>
      <h2>${listing.produceName}</h2>
      <p class="muted">${listing.description || ''}</p>
      <span class="price">${formatMoney(listing.pricePerUnit)} / ${listing.unit}</span>
      <p><strong>Farm:</strong> ${listing.farmerProfileId?.farmName || 'Local farm'} · ${listing.farmerProfileId?.completedOrders || 0} completed orders</p>
      <p><strong>Availability:</strong> ${listing.quantityAvailable} ${listing.unit}; minimum order ${listing.minimumOrderQuantity} ${listing.unit}</p>
      <p><strong>Harvest date:</strong> ${new Date(listing.harvestDate).toLocaleDateString()}</p>
      <p><strong>Traceability:</strong> Order records store farmer, buyer, produce batch, harvest date, delivery date, quantity, and destination.</p>
      <button class="btn primary" type="button" data-order="${listing._id}">Request bulk order</button>
    </article>
  `;
};

const loadListings = async form => {
  const params = form ? new URLSearchParams(new FormData(form)) : new URLSearchParams();
  [...params.entries()].forEach(([key, value]) => {
    if (!value) params.delete(key);
  });
  const queryString = params.toString() ? `?${params.toString()}` : '';
  renderListings(await getCurrentListings(queryString));
};

document.addEventListener('click', async event => {
  const pageButton = event.target.closest('[data-page]');
  const detailButton = event.target.closest('[data-detail]');
  const orderButton = event.target.closest('[data-order]');

  if (pageButton) {
    event.preventDefault();
    showPage(pageButton.dataset.page);
  }

  if (detailButton) {
    const listings = await getCurrentListings();
    const listing = listings.find(item => item._id === detailButton.dataset.detail);
    if (listing) {
      renderListingDetail(listing);
      showPage('listing-detail');
    }
  }

  if (orderButton) {
    orderForm.listingId.value = orderButton.dataset.order;
    showPage('order-request');
  }
});

document.querySelector('.menu-toggle').addEventListener('click', () => navLinks.classList.toggle('open'));

document.querySelector('#signupForm').addEventListener('submit', async event => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.target));
  const profile = values.role === 'farmer'
    ? { farmName: values.profileName }
    : { businessName: values.profileName, buyerType: 'restaurant' };

  try {
    const data = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: values.name, email: values.email, password: values.password, role: values.role, profile })
    });
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('farmconnectToken', state.token);
    localStorage.setItem('farmconnectUser', JSON.stringify(state.user));
    updateAuthStatus();
    alert('Account created successfully.');
  } catch (error) {
    alert(error.message);
  }
});

document.querySelector('#loginForm').addEventListener('submit', async event => {
  event.preventDefault();
  try {
    const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.target))) });
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('farmconnectToken', state.token);
    localStorage.setItem('farmconnectUser', JSON.stringify(state.user));
    updateAuthStatus();
  } catch (error) {
    alert(error.message);
  }
});

document.querySelector('#filterForm').addEventListener('submit', event => {
  event.preventDefault();
  loadListings(event.target);
});

document.querySelector('#loadListings').addEventListener('click', () => loadListings(document.querySelector('#filterForm')));

document.querySelector('#listingForm').addEventListener('submit', async event => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.target));
  const payload = {
    ...values,
    quantityAvailable: Number(values.quantityAvailable),
    pricePerUnit: Number(values.pricePerUnit),
    minimumOrderQuantity: Number(values.minimumOrderQuantity),
    deliveryAvailable: Boolean(values.deliveryAvailable),
    location: { city: values.city }
  };

  try {
    await api('/api/listings', { method: 'POST', body: JSON.stringify(payload) });
    document.querySelector('#listingStatus').textContent = 'Listing published successfully.';
    event.target.reset();
    loadListings();
  } catch (error) {
    document.querySelector('#listingStatus').textContent = `${error.message} Sign in as a farmer to publish to the API.`;
  }
});

orderForm.addEventListener('submit', async event => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.target));
  const payload = {
    ...values,
    quantity: Number(values.quantity),
    offeredPrice: Number(values.offeredPrice),
    recurringSupply: { frequency: values.frequency }
  };

  try {
    await api('/api/orders', { method: 'POST', body: JSON.stringify(payload) });
    alert('Order request sent.');
    showPage('orders');
  } catch (error) {
    alert(`${error.message} Sign in as a buyer to create live orders.`);
  }
});

document.querySelector('#loadOrders').addEventListener('click', async () => {
  const ordersList = document.querySelector('#ordersList');
  try {
    const data = await api('/api/orders/my');
    ordersList.innerHTML = data.orders.map(order => `
      <article class="card order-card">
        <span class="status-pill">${prettyStatus(order.status)}</span>
        <h3>${order.produceName}</h3>
        <p>${order.quantity} ${order.unit} · Offered ${formatMoney(order.offeredPrice)} · ${order.deliveryMethod}</p>
        <p class="muted">Traceability batch: ${order.traceability?.batchCode || 'Pending batch code'}</p>
      </article>
    `).join('') || '<p class="muted">No orders yet.</p>';
  } catch (error) {
    ordersList.innerHTML = '<article class="card order-card"><span class="status-pill">pending</span><h3>Demo order workflow</h3><p>Pending → accepted → preparing → ready for pickup → delivered → completed.</p></article>';
  }
});

document.querySelector('#messageForm').addEventListener('submit', async event => {
  event.preventDefault();
  try {
    await api('/api/messages', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(event.target))) });
    alert('Message sent.');
  } catch (error) {
    alert(`${error.message} Sign in and provide a valid recipient ID to send live messages.`);
  }
});

document.querySelector('#loadAnalytics').addEventListener('click', async () => {
  const target = document.querySelector('#adminAnalytics');
  try {
    const data = await api('/api/admin/analytics');
    target.innerHTML = ['users', 'farmers', 'buyers', 'listings', 'orders', 'pendingCertifications'].map(key => `
      <article class="stat-card"><span>${key}</span><strong>${data[key]}</strong></article>
    `).join('');
  } catch (error) {
    target.innerHTML = `
      <article class="stat-card"><span>Users</span><strong>Demo</strong></article>
      <article class="stat-card"><span>Verification queue</span><strong>12</strong></article>
      <article class="stat-card"><span>Reported listings</span><strong>2</strong></article>
    `;
  }
});

updateAuthStatus();
loadListings();
