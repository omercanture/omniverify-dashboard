🛡️ OmniVerify: ZK-Powered Content Notary

OmniVerify is a decentralized protocol designed to notarize digital content using Zero-Knowledge proofs on the Mina Protocol. It empowers users to prove the existence and integrity of web content (like tweets or chat messages) at a specific point in time without compromising privacy.

The project consists of a high-performance Chrome Extension for on-the-fly notarization and a Futuristic Explorer Dashboard to track on-chain verifications in real-time.
🚀 Key Features

    One-Click Notarization: Capture selected text from any website and seal it on the Mina blockchain instantly.

    Privacy-First (ZK): Leverages the power of ZK-proofs to provide immutable timestamps while maintaining data confidentiality.

    Live Proof Explorer: A real-time Next.js dashboard that monitors the Mina Devnet for notary transactions.

    Context-Aware Metadata: Automatically detects the source platform (Twitter, WhatsApp, etc.) and tags the proof accordingly.

    Robust Hybrid Infrastructure: Implements a fail-safe API proxy that switches between multiple Mina nodes (Minascan & Mina Explorer) to ensure 99.9% uptime.

🛠️ Technical Stack

    Blockchain: Mina Protocol (Devnet)

    Wallet Integration: Auro Wallet (Mina's leading wallet)

    Frontend: Next.js 14+, Tailwind CSS, Lucide Icons

    Backend: Next.js Serverless API Routes (GraphQL Proxy)

    Extension: Chrome Extension Manifest V3 (Chrome Scripting & Tabs API)

📦 Getting Started
1. Installation (Chrome Extension)

    Navigate to chrome://extensions/ in your browser.

    Enable Developer mode.

    Click Load unpacked and select the /extension folder of this repository.

2. Running the Dashboard Locally
Bash

# Clone the repository
git clone https://github.com/your-username/omniverify-zk.git

# Install dependencies
npm install

# Start the development server
npm run dev

Open http://localhost:3000 to view the dashboard.
🗺️ How it Works

    Select & Capture: The user highlights text on a platform (e.g., a Tweet) and clicks "Verify" in the extension.

    ZK-Submission: The extension sends a transaction to the OmniVerify Notary Address on Mina Devnet with the metadata (memo).

    On-Chain Verification: Once the block is produced, the transaction becomes an immutable proof of the content's existence.

    Live Feed: The OmniVerify Dashboard picks up the transaction via GraphQL and displays the verified attestation to the public.

🔗 Project Links

    Live Dashboard: https://omniverify-dashboard.vercel.app

    Notary Address (Devnet): B62qrkTv4TiLcZrZN9VYKd3ZLyg921fqmy3a18986dUW1xSh9WzV25v

    Target Network: Mina Devnet

🌟 Vision

In an era of deepfakes and digital misinformation, proving "who said what and when" is critical. OmniVerify aims to standardize digital truth by providing a lightweight, privacy-preserving layer for the modern web.
