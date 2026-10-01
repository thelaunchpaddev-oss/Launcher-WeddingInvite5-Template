document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize AOS Scroll Animation Engine
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 900, once: true, offset: 50 });
    }

    // 2. Grab token from URL parameters for secure guest authentication
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    const guestNameDisplay = document.getElementById('guestNameDisplay');
    const venueNameText = document.getElementById('venueNameText');
    const venueAddressText = document.getElementById('venueAddressText');
    const mapLinkBtn = document.getElementById('mapLinkBtn');
    
    const rsvpForm = document.getElementById('rsvpForm');
    const rsvpSelectStatus = document.getElementById('rsvpSelectStatus');
    const plusOneContainer = document.getElementById('plusOneContainer');
    const plusOneCountInput = document.getElementById('plusOneCountInput');
    const rsvpStatusMessage = document.getElementById('rsvpStatusMessage');

    // Central 24/7 Render API endpoint URL
    const API_BASE_URL = 'https://launchpad-core-api.onrender.com';

    if (!token) {
        guestNameDisplay.textContent = "Honored Guest";
    } else {
        try {
            const response = await fetch(`${API_BASE_URL}/api/event-hq/invite/verify-token/${token}`);
            const result = await response.json();

            if (result.success) {
                const { guestName, rsvpStatus, plusOneAllowed, plusOneCount, eventDetails } = result.data;
                
                // INJECT GUEST NAME DYNAMICALLY INTO PLACEHOLDER
                guestNameDisplay.textContent = guestName;

                if (eventDetails) {
                    if (eventDetails.venueName) venueNameText.textContent = eventDetails.venueName;
                    if (eventDetails.venueAddress) venueAddressText.textContent = eventDetails.venueAddress;
                    if (eventDetails.googleMapsUrl) {
                        mapLinkBtn.href = eventDetails.googleMapsUrl;
                        mapLinkBtn.style.display = 'inline-block';
                    }
                }

                if (rsvpStatus && rsvpStatus !== 'pending') {
                    rsvpSelectStatus.value = rsvpStatus;
                }
                if (plusOneAllowed) {
                    plusOneContainer.style.display = 'flex';
                    if (plusOneCount !== undefined) plusOneCountInput.value = plusOneCount;
                }
            } else {
                guestNameDisplay.textContent = "Valued Guest";
            }
        } catch (err) {
            console.error("API Connection error:", err);
            guestNameDisplay.textContent = "Valued Guest";
        }
    }

    // 3. Live Countdown Timer Engine (Target Date: October 24, 2026)
    const targetWeddingTime = new Date('2026-10-24T15:30:00').getTime();
    function runCountdown() {
        const now = new Date().getTime();
        const difference = targetWeddingTime - now;

        if (difference > 0) {
            document.getElementById('daysVal').textContent = Math.floor(difference / (1000 * 60 * 60 * 24));
            document.getElementById('hoursVal').textContent = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            document.getElementById('minsVal').textContent = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            document.getElementById('secsVal').textContent = Math.floor((difference % (1000 * 60)) / 1000);
        }
    }
    setInterval(runCountdown, 1000);
    runCountdown();

    // 4. Handle RSVP Submission with Extraordinary Confetti Celebration Animation
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            rsvpStatusMessage.style.display = 'block';
            rsvpStatusMessage.style.color = '#C4AD9A';
            rsvpStatusMessage.textContent = 'Transmitting response to manifest...';

            const payload = {
                rsvpStatus: rsvpSelectStatus.value,
                plusOneCount: plusOneCountInput ? parseInt(plusOneCountInput.value) || 0 : 0,
                dietaryRestrictions: '' // Removed as requested
            };

            try {
                if (token) {
                    const rsvpRes = await fetch(`${API_BASE_URL}/api/event-hq/invite/rsvp/${token}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    await rsvpRes.json();
                }

                rsvpStatusMessage.style.color = '#2ecc71';
                rsvpStatusMessage.textContent = '✨ Boarding pass response recorded successfully!';

                // Trigger Extraordinary Confetti Burst on acceptance
                if (payload.rsvpStatus === 'attending' && typeof confetti === 'function') {
                    confetti({
                        particleCount: 160,
                        spread: 100,
                        origin: { y: 0.7 },
                        colors: ['#231815', '#C4AD9A', '#424A3B', '#7C8573']
                    });
                }
            } catch (err) {
                rsvpStatusMessage.style.color = '#e74c3c';
                rsvpStatusMessage.textContent = 'Network error recording response.';
            }
        });
    }
});