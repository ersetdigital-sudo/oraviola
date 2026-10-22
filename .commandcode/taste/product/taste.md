# Product / UX expectations

- Payment flow must never jump straight to "success/lunas" when the user clicks "Saya sudah bayar": show an acknowledgment first ("Terima kasih, pembayaranmu telah diterima dan akan segera diproses") with a processing/spinner state, and only later a final success screen. Model it as an explicit order status (menunggu → diproses → sukses), not an instant flip. Confidence: 0.85
- Reject premature "instant done" states in general — a user action that only starts a backend job should render as "received / being processed", never as a completed transaction. Confidence: 0.75
