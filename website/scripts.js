﻿document.addEventListener('DOMContentLoaded', () => {
    // NAV TOGGLE
    const navToggle = document.querySelector('.nav-toggle');
    const siteNav = document.querySelector('.site-nav');
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            siteNav.classList.toggle('open');
            navToggle.classList.toggle('open');
        });
    }

    // HERO SLIDER
    let activeIndex = 0;
    const sliderDots = document.querySelectorAll('.slider-dot');
    const slides = document.querySelectorAll('.hero-slide');

    function setActiveSlide(index) {
        slides.forEach((slide, idx) => {
            const copy = slide.querySelector('.hero-copy');
            const isActive = idx === index;
            slide.classList.toggle('active', isActive);

            if (copy) {
                copy.classList.remove('animate');
                if (isActive) {
                    void copy.offsetWidth;
                    copy.classList.add('animate');
                }
            }
        });
        sliderDots.forEach((dot, idx) => dot.classList.toggle('active', idx === index));
        activeIndex = index;
    }

    sliderDots.forEach(dot => dot.addEventListener('click', () => setActiveSlide(Number(dot.dataset.index))));
    setActiveSlide(0);
    setInterval(() => setActiveSlide((activeIndex + 1) % slides.length), 6000);

    // LIVE CURRENCY CONVERTER
    const fromAmount = document.getElementById('from-amount');
    const fromCurrency = document.getElementById('from-currency');
    const toCurrency = document.getElementById('to-currency');
    const toAmount = document.getElementById('to-amount');
    const swapBtn = document.getElementById('swap-btn');
    const exchangeRates = {};
    const converterStatus = document.getElementById('converter-status');

    function setConverterStatus(message, isError = false) {
        if (!converterStatus) return;
        converterStatus.textContent = message;
        converterStatus.classList.toggle('error', isError);
    }

    async function fetchRate(base, target) {
        if (base === target) return 1;
        const key = base + target;
        if (exchangeRates[key]) return exchangeRates[key];

        async function fetchBaseRates(url) {
            const resp = await fetch(url);
            if (!resp.ok) return null;
            const json = await resp.json();
            if (json.result === 'success' || json.base) {
                return json.rates?.[target] ?? null;
            }
            return null;
        }

        try {
            const primary = await fetchBaseRates('https://open.er-api.com/v6/latest/' + base);
            if (primary !== null) {
                exchangeRates[key] = primary;
                return primary;
            }
        } catch (e) {
            // fallback below
        }

        try {
            const fallback = await fetchBaseRates('https://api.exchangerate-api.com/v4/latest/' + base);
            if (fallback !== null) {
                exchangeRates[key] = fallback;
                return fallback;
            }
        } catch (e) {
            return null;
        }

        return null;
    }

    async function convertCurrency() {
        const amount = parseFloat(fromAmount.value) || 0;
        const from = fromCurrency.value;
        const to = toCurrency.value;
        setConverterStatus('Calculating live rate…');
        if (from === to) {
            toAmount.textContent = amount.toFixed(2);
            setConverterStatus('Same currency selected. Amount unchanged.');
            return;
        }

        const rate = await fetchRate(from, to);
        if (rate) {
            const result = (amount * rate).toFixed(4).replace(/\.?0+$/, '');
            toAmount.textContent = result || '0';
            setConverterStatus(`Live ${from}/${to} rate applied.`);
        } else {
            toAmount.textContent = '—';
            setConverterStatus('Unable to retrieve rate. Check your connection or try again.', true);
        }
    }

    fromAmount.addEventListener('input', convertCurrency);
    fromCurrency.addEventListener('change', convertCurrency);
    toCurrency.addEventListener('change', convertCurrency);

    swapBtn.addEventListener('click', () => {
        const temp = fromCurrency.value;
        fromCurrency.value = toCurrency.value;
        toCurrency.value = temp;
        convertCurrency();
    });

    const convertBtn = document.getElementById('convert-btn');
    if (convertBtn) {
        convertBtn.addEventListener('click', convertCurrency);
    }

    convertCurrency();

    // LIVE MARKET PRICES
    const marketCards = document.querySelectorAll('.market-card');
    const lastPrices = {};

    async function updateMarketPrices() {
        for (const card of marketCards) {
            const pair = card.dataset.pair;
            const [base, target] = pair.split('/');
            const strong = card.querySelector('strong');
            const changeEl = card.querySelector('.change');
            const prev = lastPrices[pair];
            const rate = await fetchRate(base, target);
            if (rate === null) {
                card.classList.add('stale');
                continue;
            }
            lastPrices[pair] = rate;
            strong.textContent = formatRate(rate, pair);
            if (prev) {
                const delta = (rate - prev) / prev * 100;
                changeEl.textContent = (delta >= 0 ? '+' : '') + delta.toFixed(2) + '%';
                changeEl.classList.toggle('positive', delta >= 0);
                changeEl.classList.toggle('negative', delta < 0);
            }
            card.classList.remove('stale');
        }
    }

    function formatRate(rate, pair) {
        if (!rate) return '—';
        if (pair.endsWith('/JPY')) return rate.toFixed(2);
        if (rate >= 100) return rate.toFixed(2);
        return rate.toFixed(4);
    }

    if (marketCards.length) {
        updateMarketPrices();
        setInterval(updateMarketPrices, 5000);
    }

    // MARKET CAROUSEL
    const marketGrid = document.querySelector('.market-grid');
    const carouselPrev = document.querySelector('.carousel-prev');
    const carouselNext = document.querySelector('.carousel-next');
    let autoScrollId = null;

    function startAutoScroll() {
        if (!marketGrid) return;
        let direction = 1;
        autoScrollId = setInterval(() => {
            marketGrid.scrollBy({ left: 300 * direction, behavior: 'smooth' });
            if (marketGrid.scrollLeft + marketGrid.clientWidth >= marketGrid.scrollWidth - 10) direction = -1;
            if (marketGrid.scrollLeft <= 0) direction = 1;
        }, 3500);
    }

    function stopAutoScroll() { if (autoScrollId) { clearInterval(autoScrollId); autoScrollId = null; } }

    if (carouselPrev && carouselNext) {
        carouselPrev.addEventListener('click', () => { stopAutoScroll(); marketGrid.scrollBy({ left: -320, behavior: 'smooth' }); });
        carouselNext.addEventListener('click', () => { stopAutoScroll(); marketGrid.scrollBy({ left: 320, behavior: 'smooth' }); });
        marketGrid.addEventListener('mouseenter', stopAutoScroll);
        marketGrid.addEventListener('mouseleave', startAutoScroll);
        startAutoScroll();
    }

    // CHAT & SENTIMENT
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');

    const sampleMessages = [
        { name: 'James Moragn', avatar: 'JM', text: 'EUR/USD showing strong support at 1.0850. Good buy zone.', type: 'buy', time: '2m ago' },
        { name: 'Joseph Christopher', avatar: 'JC', text: 'GBP breaking through 1.27. Watch for resistance at 1.2750.', type: 'neutral', time: '4m ago' },
        { name: 'Emmanuel Henry', avatar: 'EH', text: 'Yen volatility spike incoming. Reduce USD/JPY positions.', type: 'sell', time: '6m ago' },
        { name: 'Micheal Elliot', avatar: 'ME', text: 'Just earned 50 tokens watching the AUD analysis video!', type: 'neutral', time: '8m ago' },
        { name: 'Mark uroji', avatar: 'MU', text: 'Technical breakout confirmed for AUD/USD. Momentum bullish.', type: 'buy', time: '10m ago' },
    ];

    function renderMessages() {
        chatContainer.innerHTML = sampleMessages.map(msg => `
            <div class="chat-message ${msg.type}">
                <div class="chat-avatar">${msg.avatar}</div>
                <div class="chat-content">
                    <div class="chat-name">${msg.name}</div>
                    <div class="chat-text">${msg.text}</div>
                    <div class="chat-time">${msg.time}</div>
                </div>
            </div>
        `).join('');
    }

    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;
        const newMsg = { name: 'You', avatar: 'YO', text: text, type: 'neutral', time: 'now' };
        sampleMessages.unshift(newMsg);
        if (sampleMessages.length > 10) sampleMessages.pop();
        renderMessages();
        chatInput.value = '';
    }

    window.sendMessage = sendMessage;
    renderMessages();

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});
